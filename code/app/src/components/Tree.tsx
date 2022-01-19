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
              // if there is data returned
              if (data) {
                let currentTree = []
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
              } else {
                // then it's loading, then we set currentTree to be empty
                // the dependency array only has to listen to data, 
                // so if the data doesn't exist after loading, the component doesn't need to rerender
                // and the currentTree is still empty
                setCurrentTree([])
              }
            },[data]) 

            // if the query hasn't returned, so it's loading
            if (loading) {
              return (
                  <div className={styles.tree}>
                    <TreeSearchName />
                    <p>Data is loading...</p>  
                    <TreeGraphCustomize 
                      data={data} />
                </div>
                )
            // if the query is not loading, and there is something in the current tree
            } else if (currentTree.length){
              return (
                <div className={styles.tree}>
                  <TreeSearchName />
                    <TreeGraph />                  
                    <br></br>
                  <TreeGraphCustomize 
                    data={data} />
              </div>
              )
            // if the query is not loading, there is no current tree, but there is data 
            // that means the data is being processed in the frontend to get current tree
            // as long as the tree graph's concern, it's still loading
            } else if (data) {
              return (
                <div className={styles.tree}>
                  <TreeSearchName />
                  <p>Data is loading...</p>  
                  <TreeGraphCustomize 
                    data={data} />
              </div>
              )
            } else {
              // if the query is not loading and no current tree and no data, that means nothing has been returned from query
              return (
                <div className={styles.tree}>
                  <TreeSearchName />
                  <p>This taxon doesn't exist in the time period, pleast try a new search :)</p>
                  <TreeGraphCustomize 
                    data={data} />
              </div>
              )
            }
            return (
              <div className={styles.tree}>
                <TreeSearchName />
                {/* render tree when there is something in currentTree,
                when it's loading or when it's done loading, there is data, 
                but there is nothing in the currentTree yet, then also
                show it is loading, otherwise show the taxon doesn't exist*/}
                {loading ? "Data is loading..." : currentTree.length? (
                  <TreeGraph />
                ) : data ? "Data is loading..." : "This taxon doesn't exist in the time period, pleast try a new search :)" }
                <br></br>
                
                <TreeGraphCustomize 
                  data={data} />
              </div>
            )
          }}
        </DataFetcher>
  );
}
