import React, { useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";

const arrangeIntoTree = (inputPaths) => {
    // Adapted from https://gist.github.com/stephanbogner/4b590f992ead470658a5ebf09167b03d#file-index-js-L77
    const findWhere = (array, key, value) => {
      let t = 0; // t is used as a counter
      while (t < array.length && array[t][key] !== value) { t++; }; // find the index where the id is the as the aValue

      if (t < array.length) {
          return array[t]
      } else {
          return false;
      }
    }

    const paths = inputPaths.map(path => path.split(",").slice(1))
    let tree = [];

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let currentLevel = tree;
        for (let j = 0; j < path.length; j++) {
            const part = path[j];
            const existingPath = findWhere(currentLevel, 'name', part);

            if (existingPath) {
                currentLevel = existingPath.children;
            } else {
                const newPart = {
                    name: part,
                    //children: j == path.length-1 ? null : [],
                    children: []
                }

                currentLevel.push(newPart);
                currentLevel = newPart.children;
            }
        }
    }
    return tree;
} 
  


const FOSSIL_QUERY = gql `
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

const WIKI_QUERY = gql `
    {
        getWikisById (mya: 750) {
            id
            name
            pathFromRootById
            pathFromRootByName
        }
    }
`


//const tree = arrangeIntoTree(pathsByName)[0]