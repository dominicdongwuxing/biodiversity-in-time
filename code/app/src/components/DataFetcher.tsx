import React, { useState, useEffect, useContext } from "react"
import { useQuery } from "@apollo/client";
import { GlobalStateContext } from "./GlobalStateContext";

export default function DataFetcher (props) {
    // use passed query and variables to get data and show loading message or props.children
    // note, I didn't use cache!!!
    const {searchId, searchName, myaRange, searchMaxElement, searchDepth} = useContext(GlobalStateContext)
    const variables={
        name: searchName,
        maxElement: searchMaxElement,
        depth: searchDepth,
        id: searchId,
        maxma: myaRange[0],
        minma: myaRange[1],
      }
    const { loading, error, data } = useQuery(props.query, { variables: variables, fetchPolicy: "no-cache"})
    
    return (
        <div>
            {props.children(loading, error, data)}
        </div>
    )
}

