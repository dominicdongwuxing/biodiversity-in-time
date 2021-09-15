import pandas as pd
import os
import json
import requests
import json
import matplotlib.pyplot as plt

DATADIR = "../../dataset"

def get_name_id_dict (wiki):
    '''
    takes the wiki dataset and build a taxon_name to id code lookup dict 
    return a dict, where keys are taxon names, values are lists of corresponding id (Q code) 
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
    '''
    matching_priorities = ["accepted_name", "genus","family","order","class","phylum"]
    wiki_ref_list, wiki_ref_rank_list, lowest_matched_rank = [], [], []
    #pbdb["wiki_ref"], pbdb["wiki_ref_rank"], pbdb["lowest_matched_rank"]=[np.nan]*pbdb.shape[0],[np.nan]*pbdb.shape[0],[np.nan]*pbdb.shape[0]
    for i, row in pbdb.iterrows():
        if i % 10000 == 0:
            print(i)
        for testing_rank in matching_priorities:
            name = row[testing_rank]
            if name in name_id_lookup:
                codes = name_id_lookup[name]
                ranks = [rank_info[wiki.loc[code]["taxon_rank"]] if str(wiki.loc[code]["taxon_rank"]) != "nan" else "nan" for code in codes]
                wiki_ref_list.append("_".join(codes)) 
                wiki_ref_rank_list.append("_".join(ranks)) 
                if testing_rank == "accepted_name":
                    lowest_matched_rank.append(row["accepted_rank"]) 
                else:
                    lowest_matched_rank.append(testing_rank) 
                break
        if len(wiki_ref_list) == i:
            wiki_ref_list.append(np.nan) 
            wiki_ref_rank_list.append(np.nan)
            lowest_matched_rank.append(np.nan) 
    pbdb["wiki_ref"], pbdb["wiki_ref_rank"], pbdb["lowest_matched_rank"] = wiki_ref_list, wiki_ref_rank_list, lowest_matched_rank
    return pbdb

############################################################################################################################################

# load wikidata and pbdb data
wiki, pbdb = pd.read_csv(os.path.join(DATADIR, "wikidata","processed","data.csv"), index_col = "id"), \
pd.read_csv(os.path.join(DATADIR, "pbdb","data.csv"))

# match pbdb name to wiki Q_code: first match accepted_name, then genus, family, order, class, phylum and kingdom 
name_id_lookup = get_name_id_dict(wiki)
# out of 1346120 fossils, 52531 has more than 1 wikiRef matching and 7127 has no wikiRef matching
pbdb = link_data(pbdb,name_id_lookup)

pbdb.to_csv("../../dataset/pbdb/pbdb_linked.csv",index=False)
# parse the pbdb that are linked to one and only one wiki data entry 
included_pbdb = pbdb[(pbdb["wiki_ref"].notna()) & (~pbdb["wiki_ref"].str.contains("_", na= False))].rename(columns={'occurrence_no': 'id', "accepted_name":"name","accepted_rank":"rank","min_ma":"minma","max_ma":"maxma","wiki_ref":"wikiRef"})[["id","wikiRef","name","rank","minma","maxma","lng","lat"]].to_json(orient="records")
parsed_included_pbdb = json.loads(included_pbdb)

with open("../../dataset/pbdb/pbdb.json","w") as f:
    json.dump(parsed_included_pbdb,f)



