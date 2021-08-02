from tree_utils import *

# combine all parsed JSON files into one file (maybe this work has already been done and saved as wikidata_records.csv)
data = pd.DataFrame()
for file in os.listdir(PARSED_WIKIDIR):
    temp_data = pd.read_json(os.path.join(PARSED_WIKIDIR,file))
    data = pd.concat([data,temp_data],ignore_index=True)

data = trim_data(data)

# add missing entries to data
old_data_size = data.shape[0]
data = re_query_data(data)
while data.shape[0] != old_data_size:
    old_data_size = data.shape[0]
    data = re_query_data(data)

data.to_csv(PROCESSED_WIKIDIR + "/full_data.csv")

# build a flat tree from dataset, which is a dictionary with parents as keys and their children as values
tree = build_tree(data)
with open(os.path.join(PROCESSED_WIKIDIR,"new_tree_flat.pkl"), "wb") as tree_file:
    pickle.dump(tree, tree_file)

# build a tree rooted from biota, which is a dicitonary of dictionaries
tree_from_biota = build_tree_from_root("Q2382443", tree, data)
with open(os.path.join(PROCESSED_WIKIDIR, "tree.json"), 'w') as fp:
    json.dump(tree_from_biota, fp)