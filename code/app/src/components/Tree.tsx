import React, { useContext, useEffect } from "react";
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

            let { setFlatTree, flatTree } = useContext(GlobalStateContext)
            useEffect(()=> {
              if (data && data.getFlatTreeByUniqueNameWithMya) {
                flatTree = data.getFlatTreeByUniqueNameWithMya.treeNodes.map(
                  treeNode => ({
                    leaf: treeNode.leaf, 
                    uniqueName: treeNode.uniqueName,
                    pathFromRoot: treeNode.pathFromRoot}))
                console.log(flatTree)
              }
              setFlatTree(flatTree)
            },[data])
            return (
              <div className={styles.tree}>
                <TreeSearchName />

                {loading ? "Data is loading..." : data?.getFlatTreeByUniqueNameWithMya? (
                  <TreeGraph
                    data={data.getFlatTreeByUniqueNameWithMya.treeNodes} 
                    pathFromRoot={data.getFlatTreeByUniqueNameWithMya.pathFromRoot} />
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
