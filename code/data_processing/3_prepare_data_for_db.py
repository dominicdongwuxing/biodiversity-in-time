import pandas as pd
import os
import json
import requests
import pickle as pkl
import matplotlib.pyplot as plt
import numpy as np

DATADIR = "../../dataset"
WIKIDIR = DATADIR + "/wikidata/processed"
PBDBDIR = DATADIR + "/pbdb"

def get_flat_tree_from_tree(tree):
    '''
    input a nested tree and output all full and incomplete 
    branches of the tree.
    return: a list where each element is a dictionary, where
    there is name, rank, id of each node/leave and path to root.
    '''
    def visit_nodes (root_child, path_from_root_id, path_from_root_name,path_from_root_rank):
        '''
        input a root (root_child) and recursively append information
        of each of its downstream nodes and leaves to the list, branches.
        '''
        path_from_root_id += "," + root_child["id"]
        path_from_root_name += "," + root_child["name"]
        path_from_root_rank += "," + root_child["rank"]
        children = []
        if "children" in root_child.keys():
            for child in root_child["children"]:
                children.append(child["id"])
        branches.append({"name": root_child["name"], "rank": root_child["rank"], "id": root_child["id"], \
                         "pathFromRootById": path_from_root_id, \
                         "pathFromRootByName": path_from_root_name, \
                         "pathFromRootByRank": path_from_root_rank, \
                         "children": children})
        if "children" in root_child.keys():
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
with open(os.path.join(WIKIDIR, "tree.json"),"rb") as f:
    tree_from_biota = json.load(f)

# compute flat tree for db
tree_for_db = get_flat_tree_from_tree(tree_from_biota)

del tree_from_biota

# load linked pbdb fossils 
with open(os.path.join(PBDBDIR, "pbdb.json"),"rb") as f:
    pbdb = json.load(f)

pbdb = pd.DataFrame(pbdb)
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

parsed_pbdb = json.loads(pbdb.to_json(orient="records"))

with open(os.path.join(PBDBDIR, "pbdb_for_db.json"),"w") as f:
    json.dump(parsed_pbdb,f)

# split linked pbdb fossils into 10 files
json_splitter(parsed_pbdb,10,PBDBDIR,"pbdb_for_db")


# aggregate pbdb into wikiRef, minma(min of all records under the same wikiRef), maxma (similar to minma)
# and coordinates ([[lng, lat]])
agg_pbdb = pbdb.groupby(["wikiRef"]).agg({"minma":"min","maxma":"max"})
pbdb["coordinate"] = pbdb[["lng","lat"]].values.tolist()
coordinates = pbdb.groupby(["wikiRef"])["coordinate"].apply(list)
agg_pbdb["coordinates"] = coordinates
agg_pbdb.reset_index(level=0, inplace=True)
parsed_agg_pbdb = json.loads(agg_pbdb.to_json(orient="records"))

with open(os.path.join(PBDBDIR, "agg_pbdb_for_db.json"),"w") as f:
    json.dump(parsed_agg_pbdb,f)




with open("../../dataset/pbdb/pbdb_for_db.json","rb") as f:
    pbdb = pd.DataFrame(json.load(f))


tree_for_db_pd = pd.DataFrame(tree_for_db)

# cut down tree_for_bd_pd by only keeping the items that are present in the tree from all fossil records
all_paths = tree_for_db_pd[tree_for_db_pd["id"].isin(set(pbdb["wikiRef"].unique()))]["pathFromRootById"].tolist()

all_ids_fossil_tree = set()
for path in all_paths:
    path = path.split(",")[1:]
    all_ids_fossil_tree.update(path)


tree_for_db_pd = tree_for_db_pd[tree_for_db_pd["id"].isin(all_ids_fossil_tree)]

# build dataframe for wikiRef id counts, min of minma, max of maxma
# indices are wikiRefs 
wikiRef_count_and_time_pd = pd.DataFrame(pbdb.groupby(["wikiRef"])["id"].count())
wikiRef_count_and_time_pd.columns = ["count"]
wikiRef_count_and_time_pd["minma"] = pbdb.groupby(["wikiRef"])["minma"].min().tolist()
wikiRef_count_and_time_pd["maxma"] = pbdb.groupby(["wikiRef"])["maxma"].max().tolist()

# initialize count, maxma, minma to 0
tree_for_db_pd["count"],tree_for_db_pd["maxma"], tree_for_db_pd["minma"] = [0]*tree_for_db_pd.shape[0], [-1]*tree_for_db_pd.shape[0],[-1]*tree_for_db_pd.shape[0]

tree_for_db_pd = tree_for_db_pd.set_index("id")

# aggregate the count, maxma and minma for all entries
# count of an entry is the fossil sum of its subtree 
# maxma of an entry is the max of maxma in its substree
# minma of an entry is the min of minma in its subtree
i = 0
for wikiRef in wikiRef_count_and_time_pd.index:
    i += 1
    if i % 1000 == 0:
        print(i)
    count, maxma, minma = wikiRef_count_and_time_pd.loc[wikiRef, "count"], \
    wikiRef_count_and_time_pd.loc[wikiRef, "maxma"], \
    wikiRef_count_and_time_pd.loc[wikiRef, "minma"]
    
    tree_for_db_pd.loc[wikiRef, "count"] = count
    tree_for_db_pd.loc[wikiRef, "maxma"] = maxma
    tree_for_db_pd.loc[wikiRef, "minma"] = minma

    ids_from_root = tree_for_db_pd.loc[wikiRef].pathFromRootById.split(",")[1:]

    for upstream_id in ids_from_root[:-1]:
        tree_for_db_pd.loc[upstream_id, "count"] += count
        if float(tree_for_db_pd.loc[upstream_id, "maxma"]) < maxma:
            tree_for_db_pd.loc[upstream_id, "maxma"] = maxma
        if float(tree_for_db_pd.loc[upstream_id, "minma"]) == -1 or \
            float(tree_for_db_pd.loc[upstream_id, "minma"]) > minma:
            tree_for_db_pd.loc[upstream_id, "minma"] = minma

tree_for_db_pd.reset_index(level=0,inplace=True)

parsed_tree_for_db = json.loads(tree_for_db_pd.to_json(orient="records"))
# save the flat tree for db into file
with open(os.path.join(WIKIDIR, "fossil_related_flat_tree_for_db.json"),"w") as f:
    json.dump(parsed_tree_for_db,f)





# also append pathFromRootById into fossil data 


with open(os.path.join(WIKIDIR, "fossil_related_flat_tree_for_db.json"),"rb") as f:
    tree_for_db_pd = pd.DataFrame(json.load(f))

agg_pbdb["pathFromRootById"] = tree_for_db_pd.set_index("id").loc[agg_pbdb["wikiRef"],"pathFromRootById"].values

parsed_agg_pbdb = json.loads(agg_pbdb.to_json(orient="records"))

with open(os.path.join(PBDBDIR, "agg_pbdb_for_db.json"),"w") as f:
    json.dump(parsed_agg_pbdb,f)