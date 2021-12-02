import React, { useEffect, useState, useRef } from "react";
import styles from "./Tree.module.css";
import { useQuery, gql } from "@apollo/client";
import { GlobalStateContextConsumer } from "./globalStateContext";
import TreeSearchName from "./TreeSearchName"
import TreeGraph from "./TreeGraph"
import TreeGraphCustomize from "./TreeGraphCustomize"
import {TREE_QUERY} from "./queries"
import DataFetcher from "./DataFetcher";

export default function Tree() {
  return (
    <GlobalStateContextConsumer>
      {({searchId, searchName, myaRange, searchMaxElement, searchDepth}) => (
        <DataFetcher 
          query={TREE_QUERY}
          variables={{
            name: searchName,
            maxElement: searchMaxElement,
            depth: searchDepth,
            id: searchId,
            maxma: myaRange[0],
            minma: myaRange[1],
          }}
        >
          {(loading, error, data) => {
            return (
              <div className={styles.tree}>
                <GlobalStateContextConsumer>
                  {({setSearchName, setSearchId}) => (<TreeSearchName 
                      setSearchName={setSearchName}
                      setSearchId={setSearchId}
                    />)
                  }
                </GlobalStateContextConsumer>

                {loading ? "Data is loading..." : data?.getTreeFromWikiNameOrIdWithMya? (
                  <GlobalStateContextConsumer>
                    {({setSearchId, setWikiRefRange}) => 
                      <TreeGraph
                        data={data.getTreeFromWikiNameOrIdWithMya}
                        setSearchId={setSearchId}
                        setWikiRefRange={setWikiRefRange}
                      />
                    }
                  </GlobalStateContextConsumer>
                ) : "This taxon doesn't exist in the time period, pleast try a new search :)" }
                <br></br>
                
                <GlobalStateContextConsumer>
                  {({setSearchId, setSearchDepth, setSearchMaxElement}) => (
                    <TreeGraphCustomize 
                      data={data}
                      setSearchId={setSearchId}
                      searchDepth={searchDepth}
                      setSearchDepth={setSearchDepth}
                      searchMaxElement={searchMaxElement}
                      setSearchMaxElement={setSearchMaxElement}
                    />
                  )}
                </GlobalStateContextConsumer>
              </div>
            )
          }}
        </DataFetcher>
      )}
    </GlobalStateContextConsumer>
  );
}
