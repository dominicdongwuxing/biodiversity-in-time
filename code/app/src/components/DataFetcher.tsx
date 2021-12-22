import React, { useState, useEffect, useContext } from "react"
import { useQuery } from "@apollo/client";
import { GlobalStateContext } from "./GlobalStateContext";

export default function DataFetcher (props) {
    // use passed query and variables to get data and show loading message or props.children
    const {searchName, myaRangeTree, searchMaxElement, searchDepth, flatTree, myaValueMap} = useContext(GlobalStateContext)
    const variables={
        uniqueName: searchName,
        maxElement: searchMaxElement,
        depth: searchDepth,
        maxma: myaRangeTree[0],
        minma: myaRangeTree[1],
        flatTree: flatTree,
        mya: myaValueMap,
      }
    const { loading, error, data } = useQuery(props.query, { variables: variables})
    
    return (
        <div>
            {props.children(loading, error, data)}
        </div>
    )
}

