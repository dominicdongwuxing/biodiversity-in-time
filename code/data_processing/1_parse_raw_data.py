'''
This script parses the raw data and saves the result in pbdb_parsed.csv
It has the following attributes:

occurrence_no, accepted_name, accepted_rank, kingdom, phylum, class, order, family, genus, max_ma, min_ma, lng, lat

'''

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

##############################################################################################################################

# parse animal and plant fossil data with desired attributes and combine them into one pandas dataframe
attributes = ["occurrence_no","accepted_name","accepted_rank","kingdom","phylum","class","order","family","genus","max_ma","min_ma","lng","lat"]
animal_data = parse_dataset(file="pbdb_animalia.csv",attributes=attributes)
plant_data = parse_dataset(file="pbdb_plantae.csv",attributes=attributes)
data = pd.concat([plant_data, animal_data],ignore_index=True)
data.to_csv(os.path.join(PBDBDIR, "pbdb_parsed.csv"), index = False)




