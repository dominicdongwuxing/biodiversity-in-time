import pandas as pd
import os
import json
import requests
import pickle as pkl
import numpy as np

# ROOTDIR is where I have my thesis folder on my computer
ROOTDIR = "/home/dongwuxing/Documents/thesis"
DATADIR = ROOTDIR + "/dataset"
PROCESSED_WIKIDIR = DATADIR + "/wikidata/processed"
PBDBDIR = DATADIR + "/pbdb"

def get_flat_tree_from_tree(tree):
    '''
    Get a flat tree from rooted tree. There maybe more effective
    way for this data processing flow, since the rooted tree is 
    built from a flat tree, however, the two flat trees have different structures. 

    input: a nested rooted tree (dict of dicts) with name, rank, id and children keys
    return: a list where each element is a dictionary, where there is name, rank, id 
    of each node/leave and paths from root by id, taxon name and rank name, separated by ","
    '''
    def visit_nodes (root_child, path_from_root_id, path_from_root_name,path_from_root_rank):
        '''
        input a root (root_child) and recursively append information
        of each of its downstream nodes/leaves to the list called branches.
        '''

        # add to the paths the current item information (id/name/rank)
        path_from_root_id += "," + root_child["id"]
        path_from_root_name += "," + root_child["name"]
        path_from_root_rank += "," + root_child["rank"]
        children = []

        # append children id to the children list
        if "children" in root_child.keys():
            for child in root_child["children"]:
                children.append(child["id"])

        # append the current item to the branches list
        branches.append({"name": root_child["name"], "rank": root_child["rank"], "id": root_child["id"], \
                         "pathFromRootById": path_from_root_id, \
                         "pathFromRootByName": path_from_root_name, \
                         "pathFromRootByRank": path_from_root_rank, \
                         "children": children})

        # if the item has children then recursively explore them
        if "children" in root_child.keys():
            # recursively visit the children, while passing paths information to add 
            for child in root_child["children"]:
                visit_nodes(child, path_from_root_id, path_from_root_name, path_from_root_rank)
        
    branches = []
    visit_nodes(tree, "","","")
    return branches

def json_splitter(document, splits, DIR, folder_name):
    '''
    take a long json file (dictionary) and split it into "splits" parts
    and save into the folder under "folder_name"
    '''
    idx = 0
    for i in range(0,len(document),len(document)//(splits - 1)):
        idx += 1
        if idx < splits:
            temp = document[i:i+len(document)//(splits - 1)]
        else:
            temp = document[i:]
        with open(os.path.join(DIR, folder_name, folder_name + "_" + str(idx) + ".json"),"w") as f:
            json.dump(temp,f)


################################################################################################################################

# load tree from biota
with open(os.path.join(PROCESSED_WIKIDIR, "tree.json"),"rb") as f:
    tree_from_biota = json.load(f)

# compute flat tree for database(db) and process this data later
tree_for_db = get_flat_tree_from_tree(tree_from_biota)
tree_for_db_pd = pd.DataFrame(tree_for_db)
del tree_for_db
del tree_from_biota

# load linked pbdb fossils 
with open(os.path.join(PBDBDIR, "pbdb_linked.json"),"rb") as f:
    pbdb = pd.DataFrame(json.load(f))

# get all wikiRefs in pbdb and all wiki Q_codes from tree from biota
all_wikiRef = pbdb["wikiRef"].unique().tolist()
all_biota_wiki = [item["id"] for item in tree_for_db]

# note that some tree_for_db has multiple ids and ranks for the same taxon name,
# however there are no wikiRefs involved in those multiple ids
repeat_ids = set([item for ids in tree_for_db_pd[tree_for_db_pd["id"].str.contains("_")]["id"].tolist() for item in ids.split("_")])

wikiRef_in_repeat_ids = []
for wikiRef in all_wikiRef:
    if wikiRef in repeat_ids:
        wikiRef_in_repeat_ids.append(wikiRef)

print(wikiRef_in_repeat_ids)

# get non biota wikiRefs in linked pbdb, which are wikiRefs not in the tree from biota (there are 22)
non_biota_wikiRef = []
all_biota_wiki_set = set(all_biota_wiki)
for i in all_wikiRef:
    if i not in all_biota_wiki_set:
        non_biota_wikiRef.append(i)
print(non_biota_wikiRef)

# exclude pbdb records with non biota wikiRefs 
pbdb = pbdb[~pbdb["wikiRef"].isin(non_biota_wikiRef)]

# store the intermediate result for now
with open(os.path.join(PBDBDIR, "noagg_pbdb_for_db.json"),"w") as f:
    json.dump(json.loads(pbdb.to_json(orient="records")),f)

# first, for each fossil records build a "coordinate" column, which is [lng,lat]
pbdb["coordinate"] = pbdb[["lng","lat"]].values.tolist()
# aggregate pbdb into wikiRef, minma(min of all records under the same wikiRef), maxma (similar to minma)
# and records ([{"maxma":maxma, "minma":minma, "id":id, "coordinate": [lng, lat]}])
agg_pbdb = pbdb.groupby(["wikiRef"]).agg({"minma":"min","maxma":"max"})
pbdb["record"] = pbdb[["maxma","minma","coordinate","id"]].to_dict(orient="records")
records = pbdb.groupby(["wikiRef"])["record"].apply(list)
agg_pbdb["records"] = records
agg_pbdb.reset_index(level=0, inplace=True)

# and find the wikiRef in wikidata and append the path from root by id information to pbdb data
agg_pbdb["pathFromRootById"] = tree_for_db_pd.set_index("id").loc[agg_pbdb["wikiRef"],"pathFromRootById"].values

with open(os.path.join(PBDBDIR, "agg_pbdb_for_db.json"),"w") as f:
    json.dump(json.loads(agg_pbdb.to_json(orient="records")),f)



# back to process for the wiki tree database
# cut down tree_for_db_pd by only keeping the items that are present in the tree from all fossil records

# get all paths 
all_paths = agg_pbdb["pathFromRootById"].values.tolist()

# get all ids that are present in the paths
all_ids_fossil_tree = set()
for path in all_paths:
    path = path.split(",")[1:]
    all_ids_fossil_tree.update(path)

# only keep the items that are in the all paths extracted from all fossil records
tree_for_db_pd = tree_for_db_pd[tree_for_db_pd["id"].isin(all_ids_fossil_tree)]

# build dataframe for wikiRef id counts, min of minma, max of maxma
# indices are wikiRefs 
wikiRef_count_and_time_pd = agg_pbdb[["wikiRef","maxma","minma"]]
wikiRef_count_and_time_pd["count"] = agg_pbdb.records.apply(len)
wikiRef_count_and_time_pd = wikiRef_count_and_time_pd.set_index("wikiRef")

# initialize count, maxma, minma to 0
tree_for_db_pd["count"],tree_for_db_pd["maxma"], tree_for_db_pd["minma"] = [0]*tree_for_db_pd.shape[0], [-1]*tree_for_db_pd.shape[0],[-1]*tree_for_db_pd.shape[0]

tree_for_db_pd = tree_for_db_pd.set_index("id")

# aggregate the count, maxma and minma for all entries
# count of an entry is the fossil sum of its subtree 
# maxma of an entry is the max of maxma in its substree
# minma of an entry is the min of minma in its subtree
i = 0
for wikiRef in wikiRef_count_and_time_pd["wikiRef"].values:
    # # to visually track progress
    # i += 1
    # if i % 1000 == 0:
    #     print(i)

    # get count, maxma (max of all maxma among fossils) and, similarly, minma for the fossil linked to the wikiRef
    count, maxma, minma = wikiRef_count_and_time_pd.loc[wikiRef, "count"], \
    wikiRef_count_and_time_pd.loc[wikiRef, "maxma"], \
    wikiRef_count_and_time_pd.loc[wikiRef, "minma"]
    
    # get all ids from root to the wikiRef itself
    ids_from_root = tree_for_db_pd.loc[wikiRef].pathFromRootById.split(",")[1:]

    # add count, and update maxma and minma for all upstream parent for the wikiRef
    # and the wikiRef itself
    for i in ids_from_root:
        tree_for_db_pd.loc[i, "count"] += count
        if float(tree_for_db_pd.loc[i, "maxma"]) < maxma:
            tree_for_db_pd.loc[i, "maxma"] = maxma
        if float(tree_for_db_pd.loc[i, "minma"]) == -1 or \
            float(tree_for_db_pd.loc[i, "minma"]) > minma:
            tree_for_db_pd.loc[i, "minma"] = minma

tree_for_db_pd.reset_index(level=0,inplace=True)

# save the flat tree for db into file
with open(os.path.join(PROCESSED_WIKIDIR, "fossil_related_flat_tree_for_db.json"),"w") as f:
    json.dump(json.loads(tree_for_db_pd.to_json(orient="records")),f)

