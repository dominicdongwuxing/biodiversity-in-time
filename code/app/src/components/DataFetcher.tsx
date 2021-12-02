import React, { useState, useEffect } from "react"
import { useQuery } from "@apollo/client";

export default function DataFetcher (props) {
    // use passed query and variables to get data and show loading message or props.children
    // note, I didn't use cache!!!
    const { loading, error, data } = useQuery(props.query, { variables: props.variables, fetchPolicy: "no-cache"})
    
    return (
        <div>
            {props.children(loading, error, data)}
        </div>
    )
}

