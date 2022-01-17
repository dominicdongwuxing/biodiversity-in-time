import React, { useEffect, useState, useRef, useContext } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { GlobalStateContext } from "./GlobalStateContext";

export default function TreeGraphCustomize ({data }) {
    const { setSearchName, setSearchDepth, setSearchMaxElement, searchDepth, searchMaxElement } = useContext(GlobalStateContext)
    const makeOptions = (valueArr) => {
        const optionArr = [];
        for (const value of valueArr) {
          optionArr.push(
            <MenuItem value={value} key={value}>
              {value}
            </MenuItem>
          );
        }
        return optionArr;
      };
    
      const handleBackToTop = () => {
        setSearchName("Eukaryota");
      };
    
      const handleBackToPrevious = () => {
        if (data && data.getTreeWithFossils) {
          const path = data.getTreeWithFossils.find(i => i.parent === null).pathFromRoot.split(",")
          if (path.length < searchDepth) {
            setSearchName("Eukaryota");
          } else {
            setSearchName(path[path.length - searchDepth - 1]);
          }
        }
      };

    return (
        <div>
            <FormControl>
            <Select
                style={{margin: "5px", maxHeight: "25px"}}
                value={searchMaxElement}
                size="small"
                onChange={(event) => {
                setSearchMaxElement(event.target.value as number);
                }}
            >
                {makeOptions(Array.from({ length: 10 }, (_, i) => i + 1))}
            </Select>
            <FormHelperText>max item</FormHelperText>
            </FormControl>

            <FormControl>
            <Select
                style={{margin: "5px", maxHeight: "25px"}}
                value={searchDepth}
                size="small"
                onChange={(event) => {
                setSearchDepth(event.target.value as number);
                }}
            >
                {makeOptions(Array.from({ length: 5 }, (_, i) => i + 1))}
            </Select>
            <FormHelperText>depth</FormHelperText>
            </FormControl>
        

            {data?.getTreeWithFossils.find(i => i.parent === null).pathFromRoot !== "Eukaryota" ? (
                <Button 
                style={{margin: "5px", maxHeight: "25px"}}
                variant="contained" 
                size="small" 
                onClick={handleBackToTop} 
                color="secondary">
                Back to top
                </Button>
            ) : null}
            {data ? (
                <BackToPrevious
                data={data.getTreeWithFossils}
                handleBackToPrevious={handleBackToPrevious}
                searchDepth={searchDepth}
                />
            ) : null}
        </div>
    )
}

function BackToPrevious ({ data, searchDepth, handleBackToPrevious }) {
    if (data) {
      const path = data.find(i => i.parent === null).pathFromRoot.split(",");
      if (path.length > searchDepth + 1) {
        const displayName = path[path.length - searchDepth - 1]
        return (
          <Button
            style={{margin: "5px", maxHeight: "25px"}}
            variant="contained"
            size="small"
            onClick={handleBackToPrevious}
            color="secondary"
          >
            Back to {displayName}
          </Button>
        );
      }
    }
    return null;
  };