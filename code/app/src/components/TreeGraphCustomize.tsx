import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
} from "@mui/material";

export default function TreeGraphCustomize ({data, setSearchId, searchDepth, setSearchDepth, searchMaxElement, setSearchMaxElement}) {

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
        setSearchId("Q2382443");
      };
    
      const handleBackToPrevious = () => {
        if (data) {
          const path = data.getTreeFromWikiNameOrIdWithMya.pathFromRootById
            .split(",")
            .slice(1);
          if (path.length < searchDepth) {
            setSearchId("Q2382443");
          } else {
            setSearchId(path[path.length - searchDepth]);
          }
        }
      };

    return (
        <div>
            <FormControl>
            <Select
                style={{margin: "5px"}}
                value={searchMaxElement}
                size="small"
                onChange={(event) => {
                setSearchMaxElement(event.target.value as number);
                }}
            >
                {makeOptions(Array.from({ length: 20 }, (_, i) => i + 1))}
            </Select>
            <FormHelperText>max item</FormHelperText>
            </FormControl>

            <FormControl>
            <Select
                style={{margin: "5px"}}
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
        

            {data?.getTreeFromWikiNameOrIdWithMya.name !== "Biota" ? (
                <Button 
                style={{margin: "5px"}}
                variant="contained" 
                size="small" 
                onClick={handleBackToTop} 
                color="secondary">
                Back to top
                </Button>
            ) : null}
            {data ? (
                <BackToPrevious
                data={data.getTreeFromWikiNameOrIdWithMya}
                handleBackToPrevious={handleBackToPrevious}
                searchDepth={searchDepth}
                />
            ) : null}
        </div>
    )
}

function BackToPrevious ({ data, searchDepth, handleBackToPrevious }) {
    if (data) {
      const path = data.pathFromRootByName.split(",").slice(1);
      if (path.length > searchDepth) {
        return (
          <Button
            style={{margin: "5px"}}
            variant="contained"
            size="small"
            onClick={handleBackToPrevious}
            color="secondary"
          >
            Back to {path[path.length - searchDepth]}
          </Button>
        );
      }
    }
    return null;
  };