import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
// import * as d3 from "d3";

const FOSSIL_AT_MYA_QUERY = gql`
  query retrieveFossilsAtMya($mya: Float) {
    getFossilsAtMya(mya: $mya) {
      id
      name
      wikiRef
      maxma
      minma
      lat
      lng
    }
  }
`;

const FOSSIL_UPTO_MYA_QUERY = gql`
  query retrieveFossilsUptoMya($mya: Float) {
    getFossilsUptoMya(mya: $mya) {
      wikiRef
    }
  }
`;

// const WIKI_QUERY = gql `
//     query retriveFlatTree ($ids: [String]) {
//         getWikisById (ids: $ids) {
//             pathFromRootByName
//         }
//     }
// `

const WIKI_QUERY = gql`
  query retriveAllFossilWikis {
    getAllWikis {
      rank
      pathFromRootByName
    }
  }
`;

export const TREE_QUERY = gql`
  query retrieveTreeFromWikisId($id: String, $maxElement: Int, $depth: Int) {
    getTreeFromWikisId(id: $id, maxElement: $maxElement, depth: $depth) {
      name
      id
      rank
      count
      children {
        name
        id
        rank
        count
        children {
          name
          id
          rank
          count
          children {
            name
            id
            rank
            count
            children {
              name
              id
              rank
              count
              children {
                name
                id
                rank
                count
                children {
                  name
                  id
                  rank
                  count
                }
              }
            }
          }
        }
      }
    }
  }
`;

// const WIKI_QUERY = gql `
//     query test ($names: [String]) {
//         getWikisByName (names: $names) {
//             id
//             name
//             pathFromRootById
//             pathFromRootByName
//         }
//     }
// `

export const TreeByMya = () => {
  // const mya = 750
  // const fossilQuery  = useQuery(FOSSIL_UPTO_MYA_QUERY,
  //     {variables: { mya }}).data;
  // const ids = fossilQuery?[...new Set(fossilQuery.getFossilsUptoMya.map(fossil=>fossil.wikiRef))]:[]
  // if (ids.length) {console.log("wiki refs: ", ids.length)}
  // const ids = ["Q23419047", "Q55138706", "Q21368814", "Q5174", "Q25441", "Q18960", "Q729"]
  // const names = ["Animalia","Plantae"]
  // const treeQuery = useQuery(WIKI_QUERY,
  //     {variables: { ids }});

  // if (treeQuery.data) {console.log("tree query: ", treeQuery)}

  const queryData = useQuery(WIKI_QUERY).data;
  let tree = null;
  if (queryData) {
    // console.log(queryData.getAllWikis)
    const paths = queryData.getAllWikis.map((wiki) => wiki.pathFromRootByName);
    const ranks = [...new Set(queryData.getAllWikis.map((wiki) => wiki.rank))];
    console.log(ranks);
    const arrangeIntoTree = (inputPaths) => {
      // Adapted from https://gist.github.com/stephanbogner/4b590f992ead470658a5ebf09167b03d#file-index-js-L77
      const findWhere = (array, key, value) => {
        let t = 0; // t is used as a counter
        while (t < array.length && array[t][key] !== value) {
          t++;
        } // find the index where the id is the as the aValue

        if (t < array.length) {
          return array[t];
        } else {
          return false;
        }
      };

      const paths = inputPaths.map((path) => path.split(",").slice(1));
      const tree = [];

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let currentLevel = tree;
        for (let j = 0; j < path.length; j++) {
          const part = path[j];
          const existingPath = findWhere(currentLevel, "name", part);

          if (existingPath) {
            currentLevel = existingPath.children;
          } else {
            const newPart = {
              name: part,
              parent: j ? path[j - 1] : null,
              //children: j == path.length-1 ? null : [],
              children: [],
            };

            currentLevel.push(newPart);
            currentLevel = newPart.children;
          }
        }
      }
      return tree;
    };
    tree = arrangeIntoTree(paths)[0];
    //console.log(tree)
  }

  return (
    // <div>
    //     Tree json: {treeQuery.data?
    //         "treeQuery.data.getWikisById[0].name":"loading..."}
    // </div>

    <div>{"treeExample"}</div>
  );
};

const Fossil = (props) => {
  const { fossil } = props;
  return (
    <div>
      Name: {fossil.name}; WikiRef: {fossil.wikiRef} from {fossil.minma} mya to{" "}
      {fossil.maxma} mya. lat: {fossil.lat} lng: {fossil.lng}
    </div>
  );
};

export const FossilArrayAtMya = () => {
  const mya = 750;
  const { data } = useQuery(FOSSIL_AT_MYA_QUERY, { variables: { mya } });
  // if (data) {
  //     const wikiRefs = [...new Set(data.getFossilsAtMya.map(fossil=>fossil.wikiRef))]
  //     console.log(wikiRefs)
  // }
  return (
    <div>
      {data
        ? data.getFossilsAtMya.map((fossil) => (
            <Fossil key={fossil.id} fossil={fossil} />
          ))
        : null}
    </div>
  );
};

// export default FossilArrayAtMya
