import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";

const FOSSIL_AT_MYA_QUERY = gql `
    query retrieveFossilsAtMya ($mya: Float) {
        getFossilsAtMya (mya: $mya) {
            id
            name
            wikiRef
            maxma
            minma
            lat
            lng
        }
    }
`

const FOSSIL_UPTO_MYA_QUERY = gql `
    query retrieveFossilsUptoMya ($mya: Float) {
        getFossilsUptoMya (mya: $mya) {
            id
            name
            wikiRef
            maxma
            minma
            lat
            lng
        }
    }
`

const WIKI_QUERY = gql `
    query retriveFlatTree ($ids: [String]) {
        getWikisById (ids: $ids) {
            pathFromRootByName
        }
    }
`

const TREE_QUERY = gql `
    query retrieveTreeFromWikisId ($ids: [String]) {
        getTreeFromWikisId (ids: $ids) {
            Tree
        }
    }
`

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
    const mya = 750
    const fossilQuery  = useQuery(FOSSIL_UPTO_MYA_QUERY, 
        {variables: { mya }}).data;
    const ids = fossilQuery?[...new Set(fossilQuery.getFossilsUptoMya.map(fossil=>fossil.wikiRef))]:[]
    // console.log("wiki refs: ", wikiRefs)
    // const ids = ["Q23419047", "Q55138706", "Q21368814", "Q5174", "Q25441", "Q18960", "Q729"]
    // const names = ["Animalia","Plantae"]
    const treeQuery = useQuery(WIKI_QUERY, 
        {variables: { ids }});

    if (treeQuery.data) {console.log("tree query: ", treeQuery)}

    return (
        <div>
            Tree json: {treeQuery.data?
                "treeQuery.data.getWikisById[0].name":"loading..."}
        </div>
    )
}

const Fossil = (props) => {
    const { fossil } = props;
    return (
        <div>
            Name: {fossil.name}; WikiRef: {fossil.wikiRef} from {fossil.minma} mya to {fossil.maxma} mya. lat: {fossil.lat} lng: {fossil.lng}
        </div>
    )
}

export const FossilArrayAtMya = () => {
    const mya = 750
    const { data } = useQuery(FOSSIL_AT_MYA_QUERY, 
        {variables: { mya }
    });
    // if (data) {
    //     const wikiRefs = [...new Set(data.getFossilsAtMya.map(fossil=>fossil.wikiRef))]
    //     console.log(wikiRefs)
    // }
    return (
        <div>
          {data ? 
            data.getFossilsAtMya.map((fossil) => <Fossil key={fossil.id} fossil={fossil}/>) : null}
          
        </div>
      );
}

// export default FossilArrayAtMya