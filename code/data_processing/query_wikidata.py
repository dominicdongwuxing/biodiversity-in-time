import json
import requests


# The Fields which are stored in the json file
_TAXON_NAME = "P225"
_TAXON_RANG = "P105"
_PARENT_TAXON = "P171"

_TEMPORAL_RANGE_START = "P523"
_START_TIME = "P580"
_END_TIME = "P582"
_MASS = "P2067"
_LENGTH = "P2043"
_HEIGHT = "P2048"

_NCBI_ID = "P685"
_IMAGE = "P18"

_WIKIPEDIA_URL = ""


def get_property(e, p, t="raw"):
    """
    A helper function which extracts a certain wiki-property from an entry.
    :param e: The Entry of the
    :param p:
    :param t:
    :return:
    """
    if p not in e['claims']:
        return None
    elif len(e['claims'][p]) == 0:
        return None
    elif e['claims'][p][0]['mainsnak']['snaktype'] == "novalue" or \
            e['claims'][p][0]['mainsnak']['snaktype'] == "somevalue":
        return None

    try:
        if t == "id":
            return e['claims'][p][0]['mainsnak']['datavalue']['value']['id']
        elif t == "value":
            return e['claims'][p][0]['mainsnak']['datavalue']['value']
        elif t == "raw":
            return json.dumps(e['claims'][p][0]['mainsnak']['datavalue'])

    except Exception as exc:
        # print(exc, e['claims'][p][0]['mainsnak'])
        return None


def parse_images(e):
    images = []
    if _IMAGE not in e['claims']:
        return images

    for i in e['claims'][_IMAGE]:
        try:
            image_name = i['mainsnak']['datavalue']['value']
            images.append("https://en.wikipedia.org/wiki/File:{file}".format(file=image_name))
        except Exception as exc:
            # print(exc, e['claims'][_IMAGE])
            continue
    return images


def parse_entry(e):
    try:
        entry=dict(
            id = e['id'],
            species_name = e['labels']['en'],

            taxon_name = get_property(e, _TAXON_NAME, "value"),
            taxon_rank = get_property(e, _TAXON_RANG, "id"),
            parent_taxon=get_property(e, _PARENT_TAXON, "id"),

            t_range = get_property(e, _TEMPORAL_RANGE_START),
            t_start = get_property(e, _START_TIME),
            t_end = get_property(e, _END_TIME),

            mass = get_property(e, _MASS),
            length = get_property(e, _LENGTH),
            height = get_property(e, _HEIGHT),

            ncbi = get_property(e, _NCBI_ID),
            images = parse_images(e))

        if entry['taxon_name'] is None or \
                entry['parent_taxon'] is None:
            pass
            # print(e)
            # print(entry)

        return entry
    except Exception as err:
        # print(e)
        raise err
        return None


def query_data(entry_id, raw=True):
    # print(f"Querying: {entry_id}. Have a look at the data here: https://www.wikidata.org/wiki/Special:EntityData/{entry_id}.json")
    result = requests.get(f"https://www.wikidata.org/wiki/Special:EntityData/{entry_id}.json").json()
    if raw:
        return result
    else:
        data = result['entities']

        if entity_id in data:
            data = data[entity_id]
            return data
        else:
            return None


if __name__ == '__main__':

    import pandas as pd
    import os
    
    # load the dataset with missing parents in order to query the data by their ID
    df = pd.read_csv("../dataset/wikidata/processed/temp_missing_parents.csv", index_col="id")
    # We create a cache, so we don't have to actually query wikidata everytime,
    # so we don't get blacklisted or throttled down
    cache = dict()

    # Load the cache if existent
    if os.path.isfile("cache.json"):
        with open("cache.json", "r") as f:
            cache = json.load(f)

    result = dict()
    for i, row in df.iterrows():
        entity_id = i
        orig_data = None

        # We can ignore properties (e.g P123456) since they are not of interest and should not be in the tree at the end
        if not entity_id.startswith("P"):
            if entity_id not in cache:
                temp_data = query_data(entity_id)

                # Cache the query, yes, inefficient, but ok for small size
                cache[entity_id] = temp_data
                with open("cache.json", "w") as f:
                    json.dump(cache, f)
            else:
                temp_data = cache[entity_id]

            temp_data = temp_data['entities']

            # print(f"RAW {entity_id}", data)
            if entity_id in temp_data:
                temp_data = temp_data[entity_id]

                result[entity_id] = parse_entry(temp_data)

    with open("../dataset/wikidata/processed/temp_updated_entries.json", "w") as f:
        json.dump(result, f, indent=4)
