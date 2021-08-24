import React, { useEffect, useState } from "react";
import Fossil from "./Fossil";
import { useQuery, gql } from "@apollo/client";

const FEED_QUERY = gql `
    {
        getFossilsByMya (mya: 750) {
            id
            name
            maxma
            minma
            lat
            lng
        }
    }
`

const Fossils = () => {
    const { data } = useQuery(FEED_QUERY);

    return (
        <div>
          {data ? 
            data.getFossilsByMya.map((fossil) => <Fossil key={fossil.id} fossil={fossil}/>) : null}
          
        </div>
      );
}

export default Fossils