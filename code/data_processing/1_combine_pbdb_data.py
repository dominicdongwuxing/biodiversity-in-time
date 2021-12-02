import pandas as pd
import numpy as np
import string
import os

# ROOTDIR is where I have my thesis folder on my computer
ROOTDIR = "/home/dongwuxing/Documents/thesis"
DATADIR = ROOTDIR + "/dataset"
PBDBDIR = DATADIR + "/pbdb"

def parse_dataset(file,attributes):
    '''
    pre-processing original fossil dataset.

    input: file name of the original fossil dataset, and array of attributes
    to parse
    return: panadas dataframe, with desired attributes.
    '''
    names = []
    # use excessive columns to hold data
    for first_idx in string.ascii_uppercase[:5]:
        for second_idx in string.ascii_uppercase[:26]:
            names.append(first_idx + second_idx)

    dataset = pd.read_csv(os.path.join(PBDBDIR,file), names=names)
    
    # find the row index of the header
    for i in range(dataset.shape[0]):
        if dataset.iloc[i,0] == 'occurrence_no':
            header_idx = i
            break
    
    # find the number of data-containing columns
    for i in range(len(dataset.iloc[header_idx])):
        if pd.isna(dataset.iloc[header_idx,i]):
            no_of_col = i
            break
            
    # filter the dataset
    column_names = dataset.iloc[header_idx,:i].to_list()
    dataset = dataset.iloc[header_idx+1:,:no_of_col]
    dataset.columns = column_names
    dataset.reset_index(inplace=True, drop=True)

    # add the kingdom attribute to the dataset 
    if "kingdom" in attributes:
        if "animalia" in file:
            kingdom_name = "Animalia"
        else:
            kingdom_name = "Plantae"
        dataset["kingdom"] = [kingdom_name] * dataset.shape[0]
    dataset = dataset[attributes]
    
    # convert numneric columns to float
    for col in attributes:
        try:
            dataset[col] = pd.to_numeric(dataset[col])
        except ValueError:
            pass
    
    # for taxon information, convert "NO_[taxon]_SPECIFIED" to nan values
    taxons = ["phylum","class","order","family","genus"]
    for taxon in taxons:
        if taxon in attributes:
            dataset = dataset.replace("NO_" + taxon.upper() + "_SPECIFIED", np.NaN)
    return dataset

def clean_data(data):
    '''
    Get pathFromRoot, name and rank attributes for pbdb data. 
    pathFromRoot serves as a unique id for each tree item.
    It is its path from the Eukaryota root, to the highest non NaN taxon for each record 
    ranging from phylum to species or subspecies. The path is a comma separated string containing the names along the path.
    Its name and rank corresponds to the last item of pathFromRoot.
    
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
    return: pbdb dataframe with added pathFromRoot, rank and name attributes
    '''
    # we check from phylum to genus, and to its accepted_name
    ranks_descending = ['phylum', 'class', 'order', 'family', 'genus', 'accepted_name']
    pathFromRoot_list, name_list, lowest_rank_list = [""] * data.shape[0], [""] * data.shape[0], [""] * data.shape[0]
    for i, row in data.iterrows():
        if i % 50000 == 0:
            print(i)
        # we already know the first two items in the path are Eularyota and kingdom (animal/plant)
        pathFromRoot = "Eukaryota," + row["kingdom"]
        name = row["kingdom"]
        lowest_rank = "kingdom"
        for rank in ranks_descending:
            # if the name under the current rank is not NaN, then it is of type str
            if type(row[rank]) == str:
                # if we are already at the lowest level, append to the path if it is a species or subspecies
                # otherwise leave it at the above level (genus)
                if rank == "accepted_name":
                    if row["accepted_rank"] in ["species","subspecies"]:
                        pathFromRoot += "," + row[rank] 
                        name = row[rank]
                        lowest_rank = row["accepted_rank"]
                # we are not at the lowest level yet, just append the current rank name to the string
                else:
                    pathFromRoot += "," + row[rank] 
                    name = row[rank]
                    lowest_rank = rank
            # if we see a blank at this rank then we stop, and its path stops at the above rank
            else:
                break
        pathFromRoot_list[i] = pathFromRoot
        name_list[i] = name
        lowest_rank_list[i] = lowest_rank
    data["pathFromRoot"] = pathFromRoot_list
    data["name"] = name_list
    data["rank"] = lowest_rank_list
        
    return data
##############################################################################################################################

# parse animal and plant fossil data with desired attributes and combine them into one pandas dataframe
attributes = ["occurrence_no","accepted_name","accepted_rank","kingdom","phylum","class","order","family","genus","max_ma","min_ma","lng","lat","paleolng", "paleolat", "geoplate"]
animal_data = parse_dataset(file="pbdb_animalia.csv",attributes=attributes)
plant_data = parse_dataset(file="pbdb_plantae.csv",attributes=attributes)
data = pd.concat([plant_data, animal_data],ignore_index=True)
# append the name, rank and path attribute to data
data = clean_data(data)
data.to_csv(os.path.join(PBDBDIR, "data.csv"), index = False)




