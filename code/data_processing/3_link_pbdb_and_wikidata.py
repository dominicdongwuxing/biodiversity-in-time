import pandas as pd
import os
import json
import requests
import json

# ROOTDIR is where I have my thesis folder on my computer
ROOTDIR = "/home/dongwuxing/Documents/thesis"
DATADIR = ROOTDIR + "/dataset"
WIKIDIR = DATADIR + "/wikidata"
PROCESSED_WIKIDIR = WIKIDIR + "/processed"
PBDBDIR = DATADIR + "/pbdb"

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

def link_data(pbdb,name_id_lookup):
    '''
    link the pbdb data with wiki data by appending to pbdb 1, a column "wiki_ref"
    to the pbdb
    where for each entry it contains a list of wiki Q code(s) that 
    corresponds to the fossil record, if there is no match then the list
    is empty, 2, the 
    the matching priority is:
    accepted_name -> genus -> family -> order -> class -> phylum

    input: pbdb dataset in pandas dataframe and the name_id_lookup dict which is the 
    result of the get_name_id_dict function 
    return: a new pbdb pandas dataframe appended with a wikiRef column 
    '''
    matching_priorities = ["accepted_name", "genus","family","order","class","phylum"]
    # the three columns are intialized to store linking result and append back to the pbdb later
    wiki_ref_list, wiki_ref_rank_list, lowest_matched_rank = [], [], []
    #pbdb["wiki_ref"], pbdb["wiki_ref_rank"], pbdb["lowest_matched_rank"]=[np.nan]*pbdb.shape[0],[np.nan]*pbdb.shape[0],[np.nan]*pbdb.shape[0]
    for i, row in pbdb.iterrows():
        # # to visually track process
        # if i % 10000 == 0:
        #     print(i)

        # for each fossil record in pbdb, for each rank, get the taxon name under this tank, 
        # and test if there is a match in wikidata
        for testing_rank in matching_priorities:
            name = row[testing_rank]
            # if the taxon name under the testing rank has a match in wikidata
            if name in name_id_lookup:
                # get Q_codes (there maybe multiple) that links to the same taxon name
                codes = name_id_lookup[name]
                # the list of rank names corresponding to the lists of Q_codes
                # if the rank name of the Q_code is nan, then append "nan"
                ranks = [wiki.loc[code]["taxon_rank"] if str(wiki.loc[code]["taxon_rank"]) != "nan" else "nan" for code in codes]
                # append the matched Q_codes and their ranks to a string, separated by "_"
                wiki_ref_list.append("_".join(codes)) 
                wiki_ref_rank_list.append("_".join(ranks)) 
                # also append the lowest matched rank (which is the current testing rank)
                if testing_rank == "accepted_name":
                    lowest_matched_rank.append(row["accepted_rank"]) 
                else:
                    lowest_matched_rank.append(testing_rank) 
                break

        # if all testing rank has no match then the result lists have not be appended
        # this means there is no match whatsoever, therefore append nan to the lists for
        # this fossil record
        if len(wiki_ref_list) == i:
            wiki_ref_list.append(np.nan) 
            wiki_ref_rank_list.append(np.nan)
            lowest_matched_rank.append(np.nan) 
    # append 
    pbdb["wiki_ref"], pbdb["wiki_ref_rank"], pbdb["lowest_matched_rank"] = wiki_ref_list, wiki_ref_rank_list, lowest_matched_rank
    return pbdb

############################################################################################################################################

# load wikidata and pbdb data
wiki, pbdb = pd.read_csv(os.path.join(PROCESSED_WIKIDIR,"data.csv"), index_col = "id"), \
pd.read_csv(os.path.join(PBDBDIR,"data.csv"))

# match pbdb name to wiki Q_code: first match accepted_name, then genus, family, order, class, phylum and kingdom 
name_id_lookup = get_name_id_dict(wiki)
# out of 1346120 fossils, 52531 has more than 1 wikiRef matching and 7127 has no wikiRef matching
pbdb = link_data(pbdb,name_id_lookup)

# save the linked pbdb
pbdb.to_csv(os.path.join(PBDBDIR, "pbdb_linked.csv"),index=False)
# parse the pbdb that are linked to one and only one wiki data entry 
included_pbdb = pbdb[(pbdb["wiki_ref"].notna()) & (~pbdb["wiki_ref"].str.contains("_", na= False))].rename(columns={'occurrence_no': 'id', "accepted_name":"name","accepted_rank":"rank","min_ma":"minma","max_ma":"maxma","wiki_ref":"wikiRef"})[["id","wikiRef","name","rank","minma","maxma","lng","lat"]].to_json(orient="records")
parsed_included_pbdb = json.loads(included_pbdb)

with open(os.path.join(PBDBDIR, "pbdb.json"),"w") as f:
    json.dump(parsed_included_pbdb,f)


