import React, { useState, useEffect, useContext } from "react"
import { useQuery } from "@apollo/client";
import { GlobalStateContext } from "./GlobalStateContext";


export default function DataFetcher (props) {
    // use passed query and variables to get data and show loading message or props.children
    const {searchName, myaRangeTree, searchMaxElement, searchDepth, currentTree, myaValueMap} = useContext(GlobalStateContext)
    const queryName = props.query.definitions[0].name.value
    let variables
    if (queryName == "retrieveLocations") {
        variables = {
            tree: currentTree.map(node => {
                return {
                    name: node.name,
                    fossils: node.fossils
                }
            }),
            mya: myaValueMap,
          }
    } else {
        variables = {
            name: searchName,
            maxElement: searchMaxElement,
            depth: searchDepth,
            maxma: myaRangeTree[0],
            minma: myaRangeTree[1],
          }
    }

    const { loading, error, data } = useQuery(props.query, { variables: variables })
    if (queryName == "retrieveLocations") {
        console.log(variables, data)
    }
    //console.log(`at mya ${myaValueMap}`,data)
    return (
        <div>
            {props.children(loading, error, data)}
        </div>
    )
}

