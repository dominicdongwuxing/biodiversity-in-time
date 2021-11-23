import React, { useEffect, useState, useRef } from "react";
import styles from "./Tree.module.css";
import { useQuery, gql } from "@apollo/client";
import { GlobalStateContextConsumer } from "./globalStateContext";
import TreeSearchName from "./TreeSearchName"
import TreeGraph from "./TreeGraph"
import TreeGraphCustomize from "./TreeGraphCustomize"

const TREE_QUERY = gql`
  query retrieveTreeFromWikiNameOrIdWithMya(
    $name: String
    $maxElement: Int
    $depth: Int
    $id: String
    $minma: Float
    $maxma: Float
  ) {
    getTreeFromWikiNameOrIdWithMya(
      name: $name
      maxElement: $maxElement
      depth: $depth
      id: $id
      minma: $minma
      maxma: $maxma
    ) {
      name
      id
      rank
      count
      pathFromRootByName
      pathFromRootById
      children {
        name
        id
        rank
        count
        children {
          name
          id
          rank
          count
          children {
            name
            id
            rank
            count
            children {
              name
              id
              rank
              count
              children {
                name
                id
                rank
                count
                children {
                  name
                  id
                  rank
                  count
                }
              }
            }
          }
        }
      }
    }
  }
`;


export default function Tree({ searchId, searchName, myaRange, searchMaxElement, searchDepth }) {
  // note: I didn't use cache!!!



  // const usePrevious = (value) => {
  //   const ref = useRef()
  //   useEffect(() => {
  //     if (data) {
  //       ref.current = value
  //     }
  //   })
  //   return ref.current
  // }

  const { data } = useQuery(TREE_QUERY, {
    variables: {
      name: searchName,
      maxElement: searchMaxElement,
      depth: searchDepth,
      id: searchId,
      maxma: myaRange[0],
      minma: myaRange[1],
    },
    fetchPolicy: "no-cache",
  });

  // useEffect(() => {
  //   console.log(data)
  // }, [data])

  return (
    <div className={styles.tree}>

      <GlobalStateContextConsumer>
        {({setSearchName, setSearchId}) => (
          <TreeSearchName 
            setSearchName={setSearchName}
            setSearchId={setSearchId}
          />
        )}
      </GlobalStateContextConsumer>

      {data ? (
        <GlobalStateContextConsumer>
          {({setSearchId, setWikiRefRange}) => 
            <TreeGraph
              data={data.getTreeFromWikiNameOrIdWithMya}
              setSearchId={setSearchId}
              setWikiRefRange={setWikiRefRange}
            />
          }
        </GlobalStateContextConsumer>
      ) : "This taxon doesn't exist in the time period, pleast try a new search :)"}
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
  );
}
