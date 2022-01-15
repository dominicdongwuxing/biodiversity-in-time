'''
This script uses pbdb_parsed.csv to compute 3 files:

1, tree_init.csv, which has the following attributes:
path_from_root: a comma separated string indicating the path from the root Eukaryota to the name on lowest possible taxonomic rank with no missing names in between
rank: the rank of the last name in path_from_root

2, pbdb_parsed_processed.csv, which is tree_init joined with pbdb_parsed. It has the following attributes:
occurrence_no, accepted_name, accepted_rank, kingdom, phylum, class, order, family, genus, max_ma, min_ma, lng, lat, path_from_root, rank

3, fossils.json, which is from pbdb_parsed_processed extracted with the following attributes:
occurrence_no, max_ma, min_ma, path_from_root

'''

import pandas as pd
import numpy as np
import os
import json

# ROOTDIR is where I have my thesis folder on my computer
ROOTDIR = "/home/dongwuxing/Documents/thesis"
DATADIR = ROOTDIR + "/dataset"
PBDBDIR = DATADIR + "/pbdb"

def append_path_and_rank(data):
    '''
    Get path_from_root and rank attributes for pbdb data aggregated on the same taxonomy. 
    path_from_root serves as a unique id for each tree item.
    It is its path from the Eukaryota root, to the highest non NaN taxon for each record 
    ranging from phylum to species or subspecies. The path is a comma separated string containing the names along the path.
    Rank is simply the taxonomic rank for the last name in path_from_root.
    
    This function is necessary because we cannot use the accepted_name and 
    accepted_rank for building the tree and locating each record to the tree. This is because:
    1, not all accepted rank falls into the common categories, we wish to build a tree with only 
    phylum - class - order - family -genus -species level;
    2, and some accepted name are not on the (subspecies) level and not present in the path to 
    its root (animalia or plantae), therefore it will not have a node on the tree
    3, there are blanks in between the ranks, making it difficult to fill in the blanks to locate the 
    record to a more detailed downstream node, due to possible ambiguity and mismatching. Note that
    doing this will make the record less detailed (if a human record is missing its class entry then 
    it will only be mapped to the phylum level, although we know human is down to the species level).

    input: pbdb dataframe
    return: pbdb dataframe with added path_from_root and rank and name attributes
    '''
    # we check from phylum to genus, and to its accepted_name
    ranks_descending = ['phylum', 'class', 'order', 'family', 'genus', 'accepted_name']
    path_from_root_list, lowest_rank_list = [""] * data.shape[0], [""] * data.shape[0]
    for i, row in data.iterrows():
        # we already know the first two items in the path are Eularyota and kingdom (animal/plant)
        path_from_root = "Eukaryota," + row["kingdom"]
        lowest_rank = "kingdom"
        for rank in ranks_descending:
            # if the name under the current rank is not NaN, then it is of type str
            if type(row[rank]) == str:
                # if we are already at the lowest level, append to the path if it is a species or subspecies
                # otherwise leave it at the above level (genus)
                if rank == "accepted_name":
                    if row["accepted_rank"] in ["species","subspecies"]:
                        path_from_root += "," + row[rank] 
                        lowest_rank = row["accepted_rank"]
                # we are not at the lowest level yet, just append the current rank name to the string
                else:
                    path_from_root += "," + row[rank] 
                    lowest_rank = rank
            # if we see a blank at this rank then we stop, and its path stops at the above rank
            else:
                break
        path_from_root_list[i] = path_from_root
        lowest_rank_list[i] = lowest_rank
    data["path_from_root"] = path_from_root_list
    data["rank"] = lowest_rank_list
        
    return data

##############################################################################################################

pbdb_parsed = pd.read_csv(os.path.join(PBDBDIR, "pbdb_parsed.csv"))

# aggregate data on the same taxonomy information
pbdb_aggregated = pbdb_parsed[["kingdom","phylum","class","order","family","genus","accepted_name","accepted_rank"]].drop_duplicates().reset_index()

# append path_from_root and rank on aggregated data
pbdb_aggregated = append_path_and_rank(pbdb_aggregated)

# save the path_from_root and rank attributes in pbdb_aggregated as the file initialized for creating the tree dataset
pbdb_aggregated[["path_from_root","rank"]].drop_duplicates().to_csv(os.path.join(PBDBDIR, "tree_init.csv"), index = False)

# merge the aggregated data back so that each fossil record has path and rank information
pbdb_parsed_processed = pbdb_parsed.merge(pbdb_aggregated)
pbdb_parsed_processed.to_csv(os.path.join(PBDBDIR, "pbdb_parsed_processed.csv"), index = False)

# extract the necessary attributes to create fossil point dataset on individual record
with open(os.path.join(PBDBDIR, "fossils.json"),"w") as f:
    json.dump(json.loads(pbdb_parsed_processed[["occurrence_no","path_from_root","max_ma","min_ma"]].to_json(orient="records")),f)