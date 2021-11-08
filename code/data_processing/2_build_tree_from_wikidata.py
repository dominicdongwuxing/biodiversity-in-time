import pandas as pd
import numpy as np
import os
import time
import pickle
import math
import collections
import requests
import json

# ROOTDIR is where I have my thesis folder on my computer
ROOTDIR = "/home/dongwuxing/Documents/thesis"
DATADIR = ROOTDIR + "/dataset"
WIKIDIR = DATADIR + "/wikidata"
PARSED_WIKIDIR = WIKIDIR + "/parsed"
PROCESSED_WIKIDIR = WIKIDIR + "/processed"

def is_nan(value):
    '''
    check if a value is nan
    return boolean
    '''
    if value == None:
        return True
    try:
        return math.isnan(float(value))
    except:
        return False
    

def build_flat_tree (data):
    '''
    generate a flat tree of life from data

    input: data in pandas dataframe
    return: dict, where key is each parent code and 
    values are their corresponding children codes
    '''
    tree_dict = {}
    for i in range(data.shape[0]):
        parent_code = data["parent_taxon"][i]
        name = data.index[i]

        # only process entries with a certain parent node 
        if parent_code != None and not is_nan(parent_code):
            if parent_code not in tree_dict:
                tree_dict[parent_code] = [name]
            else:
                tree_dict[parent_code].append(name)
    
    # also append leaves into the tree dict (those that are not parents)
    for i in range(data.shape[0]):
        potential_leaf = data.index[i]
        if potential_leaf not in tree_dict:
            tree_dict[potential_leaf] = []
    return tree_dict


def get_missing_parents(data):
    '''
    Look for missing parents, which are parents whose id cannot be found in the data

    input: dataset in pandas dataframe
    return: list of id codes of the missing parents.
    '''
    missing_parents = []
    all_ids = data.index
    for parent in data[data["parent_taxon"].notna()]["parent_taxon"].unique().tolist():
        if parent not in all_ids:
            missing_parents.append(parent)
    return missing_parents

def build_rooted_tree(root_id, tree, data):
    '''
    recursively build a rooted tree from the
    pre-build flat tree using build_flat_tree, and the dataset

    input: root_id, the pre-built flat tree dict and 
    the dataset in pandas dataframe
    return: a rooted tree organized in dict of dicts
    {name: taxon_name, id: Q headed id code, rank: rank name in English,
    children: [{subtree in dict of the same structure}]}
    '''
    try:
        name = data.loc[root_id]["taxon_name"]
        if is_nan(name):
            name = ""
    except KeyError:
        name = ""
    
        
    try:
        rank = data.loc[root_id]["taxon_rank"]
        if is_nan(rank):
            rank = ""
    except KeyError:
        rank = ""
    
    
    rooted_tree = {"name":name,"rank":rank, "id": root_id, "children":[build_tree_from_root(child_id,tree, data) for child_id in tree[root_id]]}
    
    if rooted_tree["children"] == []:
        del rooted_tree["children"]
    else:
        # merge nodes or leaves that are siblings but has identical taxon names

        # collect taxon_names that are repetitive in the children list for a rooted tree
        repeated_names = [item for item, count in collections.Counter([child["name"] for child in rooted_tree["children"]]).items() if count > 1]
        # initialize a new children list, first put in children with no repeating taxon names
        new_children_list = [child for child in rooted_tree["children"] if child["name"] not in repeated_names]
        # then iterate over all repeated taxon names
        for rep in repeated_names:
            # initialize a replacement dictionary for a repeating taxon name
            replacement = {"name":rep,"rank":"", "id": "","children":[]}
            for child in rooted_tree["children"]:
                # in the children list, find the taxon name that equals to the current taxon name under process
                if child["name"] == rep:
                    # the new id attribute would be all ids under the same taxon name, separated by _
                    if replacement["id"]:
                        replacement["id"] += "_" + child["id"]
                    else:
                        replacement["id"] = child["id"]

                    # the new rank attribute would be all rank names under the same taxon name, separated by _
                    if replacement["rank"]:
                        replacement["rank"] += "_" + child["rank"]
                    else:
                        replacement["rank"] = child["rank"]
                    
                    # bring all children under the same taxon name together 
                    if "children" in child.keys():
                        try:
                            replacement["children"] += child["children"]
                        except KeyError:
                            replacement["children"] = child["children"]
                    
                    # # if there is still no children in the end, delete this attribute
                    # if replacement["children"] == []:
                    #     del replacement["children"]
                    
            # append this merged item into children list
            new_children_list.append(replacement)
        # replace the chilren list with the merged children list
        rooted_tree["children"] = new_children_list
    return rooted_tree

def trim_data(data):
    '''
    give the dataframe, break species_name into two attributes and only take species_name_value; 
    and return only "taxon_name","taxon_rank","parent_taxon","species_name_value" attributes
    and "id" attribute is set as the index

    input: untrimmed dataset as pandas dataframe
    return: trimmed dataset as pandas dataframe
    '''
    species_name_value = [data["species_name"][i]["value"] for i in range(data.shape[0])]
    data["species_name_value"]= species_name_value
    data = data[["id","taxon_name","taxon_rank","parent_taxon","species_name_value"]]
    data = data.set_index("id")
    return data

def re_query_data(data):
    '''
    add new entries to the data by re-querying the data and searching for
    missing parents (either has no parent or has a parent that is not in 
    the dataset) information and adding those missing data to the dataset
    
    input: dataset as pandas dataframe with potentially missing data
    return: new dataset as pandas dataframe with added missing data (if available)
    '''
    # a missing parent is a parent whose id is not in the dataset
    missing_parents = get_missing_parents(data)
    # temp_missing_parents contains those who either has no parent or is a missing parent 
    temp_missing_parents = data[data["parent_taxon"].isna()]
    for missing_parent in missing_parents:
        temp_missing_parents.loc[missing_parent] = [np.nan,np.nan,np.nan,np.nan]
    temp_missing_parents.to_csv(PROCESSED_WIKIDIR + "/temp_missing_parents.csv")
    exec(open("query_wikidata.py").read())
    with open(os.path.join(PROCESSED_WIKIDIR, "temp_updated_entries.json")) as f:
        temp_updated_entries = json.load(f)
        extra_data = trim_data(pd.DataFrame.from_dict(temp_updated_entries, orient="index"))
    for idx in extra_data.index:
        data.loc[idx] = extra_data.loc[idx]
    return data

def get_names_for_taxon_rank(data):
    '''
    input: data in pandas dataframe, where taxon_rank is in ID form 
    return: data in pandas dataframe, where taxon_rank is in English name 
    '''

    def get_rank_id_name_lookup(ranks):
        '''
        input a list of rank ids and query wikidata
        to return the corresponding rank name in English

        input: a list of rank ids
        return: a dictionary, where keys are rank ids
        and values are corresponding English rank names
        '''
        rank_dict = {}
        for rank in ranks:
            request_result = requests.get(f"https://www.wikidata.org/wiki/Special:EntityData/{rank}.json").json()
            rank_dict[rank] = request_result["entities"][rank]["labels"]["en"]["value"]
        return rank_dict

    ranks = [rank for rank in data["taxon_rank"].unique().tolist() if not is_nan(rank)]
    
    # if the rank ID to English name mapping has been computed, load it, otherwise compute it now
    if os.path.isfile(os.path.join(PROCESSED_WIKIDIR,"rank_id_name_lookup.pkl")):
        with open(os.path.join(PROCESSED_WIKIDIR,"rank_id_name_lookup.pkl"), "rb") as f:
            rank_id_name_lookup = pickle.load(f)
    else:
        rank_id_name_lookup = get_rank_id_name_lookup(ranks)
        with open(os.path.join(PROCESSED_WIKIDIR,"rank_id_name_lookup.pkl"), "wb") as f:
            pickle.dump(rank_id_name_lookup, f)

    rank_list = data["taxon_rank"].tolist()
    for i in range(len(rank_list)):
        rank = rank_list[i]
        if not is_nan(rank):
            rank_list[i] = rank_id_name_lookup[rank]
    data["taxon_rank"] = rank_list
    return data
    
########################################################################################################################

# combine all parsed JSON files into one file (maybe this work has already been done and saved as wikidata_records.csv)
data = pd.DataFrame()
for file in os.listdir(PARSED_WIKIDIR):
    temp_data = pd.read_json(os.path.join(PARSED_WIKIDIR,file))
    data = pd.concat([data,temp_data],ignore_index=True)

data = trim_data(data)

# recursively add missing entries to data until no more new data can be added
old_data_size = data.shape[0]
data = re_query_data(data)
while data.shape[0] != old_data_size:
    old_data_size = data.shape[0]
    data = re_query_data(data)

# turn taxon_rank from id into names
data = get_names_for_taxon_rank(data)

# fill na in taxon_name from "species_name_value"
data["taxon_name"].fillna(data["species_name_value"],inplace=True)

data.to_csv(PROCESSED_WIKIDIR + "/data.csv")

# build a flat tree from dataset, which is a dictionary with parents as keys and their children as values
tree = build_flat_tree(data)
with open(os.path.join(PROCESSED_WIKIDIR,"tree_flat.pkl"), "wb") as tree_file:
    pickle.dump(tree, tree_file)

# build a tree rooted from biota, which is a dicitonary of dictionaries
tree_from_biota = build_rooted_tree("Q2382443", tree, data)
with open(os.path.join(PROCESSED_WIKIDIR, "tree.json"), 'w') as fp:
    json.dump(tree_from_biota, fp)

# save the dangling trees (those with children but parent taxon is NaN)
for missing_parent in [i for i in list(data[data["parent_taxon"].isna()].index) if len(tree[i])]:
    # if the parent is not biota, the root for all life
    if missing_parent != "Q2382443":
        dangling_tree = build_tree_from_root(missing_parent, tree, data)
        file_name = os.path.join(PROCESSED_WIKIDIR, "dangling_trees",missing_parent + ".json")
        with open(file_name, 'w') as fp:
            json.dump(dangling_tree, fp, indent=4)