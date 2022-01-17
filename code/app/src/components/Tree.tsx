import React, { useContext, useEffect } from "react";
import styles from "./Tree.module.css";
import * as d3 from "d3";
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
            let { setCurrentTree, currentTree } = useContext(GlobalStateContext)
            useEffect(()=> {
              if (data && data.getTreeWithFossils) {
                let currentTree = []
                //console.log(currentTree)
                // compute colors here with d3! 
                const root = d3.stratify()
                  .id(d => d.pathFromRoot)
                  .parentId(d => d.parent)
                  (data.getTreeWithFossils)
                
                // red: #9E2E24 #fc1443
                // yellow: #E2AF42 #96890f
                // green: #4d814b #0b7821
                // purple: #7f4b81 #c717eb
                // cyan: #68aba1 #066066
                let colors = ["#fc1443","#0b7821","#c717eb","#3cc9a1","#d6c415"]
                const lastColor = colors[colors.length - 1]
                root.each((d) => {
                  let currentColor
                  // only assign color when d is not the root
                  if (d.depth) {
                    // if there are still colors left, then pick one to assign to the node
                    // and remove this color from the color list
                    if (colors.length) {
                      currentColor = colors[0]
                      colors = colors.splice(1)
                    } else { // if no color is left then find the color of its parent
                      // but if the parent has no color assgined yet (in case it is depth 1 and colors 
                      // are used up) then just use the last color 
                      currentColor = currentTree.find(i => i.pathFromRoot == d.data.parent).color || lastColor 
                    }
                  } else {
                    // assign blackcolor to points at root
                    currentColor = "black"
                  }
                  currentTree.push({...d.data, color: currentColor})
                })
                setCurrentTree(currentTree)
                //console.log(currentTree)
              } else if (!loading && !data?.getFlatTreeByUniqueNameWithMya) {
                console.log("data is",data)
                setCurrentTree([])
              }
            },[data])
            return (
              <div className={styles.tree}>
                <TreeSearchName />

                {loading ? "Data is loading..." : currentTree.length? (
                  <TreeGraph />
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
