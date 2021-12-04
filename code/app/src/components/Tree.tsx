import React, { useEffect, useState, useRef } from "react";
import styles from "./Tree.module.css";
import { useQuery, gql } from "@apollo/client";
import { GlobalStateContext } from "./GlobalStateContext";
import TreeSearchName from "./TreeSearchName"
import TreeGraph from "./TreeGraph"
import TreeGraphCustomize from "./TreeGraphCustomize"
import {TREE_QUERY} from "./Queries"
import DataFetcher from "./DataFetcher";

export default function Tree() {
  return (
  
      <DataFetcher 
          query={TREE_QUERY}
        >
          {(loading, error, data) => {
            return (
              <div className={styles.tree}>
                <TreeSearchName />

                {loading ? "Data is loading..." : data?.getTreeFromWikiNameOrIdWithMya? (
                  <TreeGraph
                    data={data.getTreeFromWikiNameOrIdWithMya} />
                ) : "This taxon doesn't exist in the time period, pleast try a new search :)" }
                <br></br>
                
                <TreeGraphCustomize 
                  data={data} />
              </div>
            )
          }}
        </DataFetcher>
  );
}
