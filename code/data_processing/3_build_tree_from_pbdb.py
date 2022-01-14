
'''
This script computes the tree dataframe tree.json generated from tree_init and pbdb_parsed_processed. It has the following attributes:

path_from_root: a comma separated string that notes the path from Eukaryota root to its name
note that this is also the unique id for this node/leaf.

name: the part of parent_path_from_root after last comma

parent: the parent_path_from_root of its parent, which is the string before the last comma in parent_path_from_root

wikiRef: a reference Q_code from wiki data, if available, this is when there is a match between 
the two datasets, regarding both name and rank 

is_leaf: boolean value indicating if a node is a leaf node (has no children)

maxma: the max of the maxma for fossils belonging to itself and its subtree

minma: the min of minma for fossils belonging to itself and its subtree
'''

import pandas as pd
import numpy as np
import string
import os
import re
import json
import collections

# ROOTDIR is where I have my thesis folder on my computer
ROOTDIR = "/home/dongwuxing/Documents/thesis"
DATADIR = ROOTDIR + "/dataset"
PBDBDIR = DATADIR + "/pbdb"
WIKIDIR = DATADIR + "/wikidata/processed"

def get_additional_nodes(tree):
    '''
    Add missing nodes to the tree dataframe. It iterates through all
    possible paths and add all nodes along those paths that are
    not present in the tree dataframe.
    
    input: immature tree dataframe
    return: new dataframe with the missing nodes to append to tree dataframe
    '''
    ranks = ["domain","kingdom","phylum","class","order","family","genus"]
    # extract all current nodes from all paths
    current_nodes = set(tree["path_from_root"].unique().tolist())
    # initialize lists to be added
    path_from_root_list = []
    rank_list = []
    # check for each path if unseen nodes need to be added
    for path in current_nodes:
        # find all indices of comma
        indices = [i.start() for i in re.finditer(",",path)]
        for i in indices:
            node = path[:i]
            # add each node along the path if the node is not there
            if node not in current_nodes:
                path_from_root_list.append(node)
                # find out which rank name it has by counting its last comma position
                rank_list.append(ranks[len(node.split(","))-1])
    
    pd_to_add = pd.DataFrame(data={"path_from_root":path_from_root_list, "rank":rank_list}).drop_duplicates()
    return pd_to_add


def append_parent_and_name (tree):
    '''
    For each node, add path_from_root of its parent and add its name the string after the last comma
    of its path_from_root
    
    input: tree dataframe
    return: tree appended with parent and name attribute
    '''
    parents, names = [np.NaN]*tree.shape[0],["Eukaryota"]*tree.shape[0]
    
    # iterate each row and append parent of a node as the string before the last comma of its path_from_root
    for i, row in tree.iterrows():
        last_comma_idx = row["path_from_root"].rfind(",")
        # Eukaryota has no parent
        if last_comma_idx != -1:
            parents[i] = row["path_from_root"][:last_comma_idx]
            names[i] = row["path_from_root"][last_comma_idx+1:]
    
    tree["parent"] = parents
    tree["name"] = names
    return tree


def get_name_id_dict (wiki):
    '''
    input: the wiki dataset in pandas dataframe
    return: a dict, where keys are taxon names, values are lists of corresponding id (Q code) 
    '''
    name_id_dict = {}
    for idx in wiki.index:
        name = wiki.loc[idx,"taxon_name"]
        if name not in name_id_dict:
            name_id_dict[name] = [idx]
        else:
            name_id_dict[name].append(idx)
    return name_id_dict

def get_wikiRef(tree, wikidata, name_id_lookup, repetitive_names):
    '''
    Find wikiRef links for tree elements from wikidata. The wikiRef is a unique code starting with Q
    and there is a match if only there is an exact match beween name and rank and the match has to be unique
    
    input: tree dataframe, wiki dataframe, name_id_lookup for wiki dataframe, and set of repetitive names
    return: a list of wikiRef for tree dataframe to append to tree dataframe
    '''
    wikiRef_list = [""] * tree.shape[0]
    for i, row in tree.iterrows():
        if i % 5000 == 0:
            print(i)
        name, rank = row["name"], row["rank"]
        if name in name_id_lookup and name not in repetitive_names:
            # get Q_codes (there maybe multiple) that links to the same taxon name
            codes = name_id_lookup[name]
            # only proceed when there is only one match
            if len(codes) == 1:
                # check if the rank information is also correct 
                if rank == wikidata.loc[codes[0]].taxon_rank:
                    wikiRef_list[i] = codes[0]
    return wikiRef_list

def append_time (tree, data):
    '''
    For each node, aggregate the maxma and minma information.
    maxma: max of maxma of all the fossils mapped to this node and below;
    minma: same as maxma but for minma
    
    input: tree and fossil dataframes
    return: tree data appended with maxma and minma attributes
    '''
    # aggregate fossil data by its path_from_root, get max of maxma, min of minma 
    max_df = data[["path_from_root","max_ma"]].groupby(["path_from_root"]).max()
    min_df = data[["path_from_root","min_ma"]].groupby(["path_from_root"]).min()
    
    tree["maxma"], tree["minma"] = [-1]*tree.shape[0],[-1]*tree.shape[0]
    
    # set path_from_root as index for tree for faser processing
    tree = tree.set_index("path_from_root")
    
    a = 0
    # for each node/leaf in data
    for node in data["path_from_root"].unique().tolist():
        a += 1
        if a % 100 == 0:
            print(a)
        # extract all of its upper stream nodes
        nodes = [node]
        indices = [idx.start() for idx in re.finditer(",",node)]
        for index in indices:
            nodes.append(node[:index])
        maxma, minma = max_df.loc[node].max_ma, min_df.loc[node].min_ma
        for i in nodes:
            current_maxma, current_minma = float(tree.loc[i, "maxma"]), float(tree.loc[i, "minma"])
            if current_maxma < maxma:
                tree.loc[i, "maxma"] = maxma
            if current_minma == -1 or current_minma > minma:
                tree.loc[i, "minma"] = minma
                
    tree.reset_index(inplace=True)
    return tree

def append_is_leaf(tree):
    '''
    Add is_leaf attribute, which is a boolean of whether or not the node is a leaf node
    input: tree dataframe
    return: tree appended with is_leaf
    '''
    is_leaf_list = []
    
    # store all parents in a set
    all_parents = set(tree["parent"])
    
    for i, row in tree.iterrows():
        # if the node's unique identifier --- path_from_root is a parent, then it's not a leaf node
        is_leaf_list.append(not row["path_from_root"] in all_parents)
    tree["is_leaf"] = is_leaf_list
    return tree


#####################################################################################################################

data = pd.read_csv(os.path.join(PBDBDIR, "pbdb_parsed_processed.csv"))
# init tree dataframe
tree = pd.read_csv(os.path.join(PBDBDIR, "tree_init.csv"))

# add the missing nodes along the paths to the tree
pd_to_add = get_additional_nodes(tree)
tree = pd.concat([pd_to_add, tree], ignore_index = True)

# add parent and name attribute to the tree
tree = append_parent_and_name(tree)

wikidata = pd.read_csv(os.path.join(WIKIDIR,"data.csv"), index_col = "id")
# match pbdb name to wiki Q_code: first match accepted_name, then genus, family, order, class, phylum and kingdom 
name_id_lookup = get_name_id_dict(wikidata)
wikiRef_list = get_wikiRef(tree, wikidata, name_id_lookup, repetitive_names)
tree["wikiRef"] = wikiRef_list

# add maxma, minma and count information for the tree
tree = append_time(tree, data)

# add is_leaf for the tree
tree = append_is_leaf(tree)

with open(os.path.join(PBDBDIR, "tree.json"),"w") as f:
    json.dump(json.loads(tree.to_json(orient="records")),f)
