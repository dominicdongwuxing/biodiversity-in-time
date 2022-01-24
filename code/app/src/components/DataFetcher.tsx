import React, { useState, useEffect, useContext } from "react"
import { useQuery } from "@apollo/client";
import { GlobalStateContext } from "./GlobalStateContext";


export default function DataFetcher (props) {
    // use passed query and variables to get data and show loading message or props.children
    const {name, maxma, minma, maxElement, depth, currentTree, mya} = useContext(GlobalStateContext)
    const queryName = props.query.definitions[0].name.value
    let queryVariables
    if (queryName == "retrieveLocations") {
        queryVariables = {
            tree: currentTree.map(node => {
                return {
                    pathFromRoot: node.pathFromRoot,
                    fossils: node.fossils
                }
            }),
            mya: mya,
          }
    } else {
        queryVariables = {
            name: name,
            maxElement: maxElement,
            depth: depth,
            maxma: maxma,
            minma: minma,
          }
    }

    const { loading, error, data } = useQuery(props.query, { variables: queryVariables })
    // if (queryName == "retrieveLocations") {
    //     console.log(variables, data)
    // }
    //console.log(`at mya ${myaValueMap}`,data)
    return (
        <div>
            {props.children(loading, error, data)}
        </div>
    )
}

