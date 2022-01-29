import React, { useState, useContext } from "react"
import { GlobalStateContext } from "./GlobalStateContext";
import Stack from '@mui/material/Stack';
import {
    Button,
    TextField,
  } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import uniqueNames from "../../dist/resources/uniqueNames.json"

console.log(uniqueNames)
export default function TreeSearchName () {
    const {setSearchTerm} = useContext(GlobalStateContext)
    const [searchNameBuffer, setSearchNameBuffer] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setSearchTerm(searchNameBuffer);
      };

    return (
        <form onSubmit={handleSubmit} >
          <Stack direction = "row" >
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              
              options={uniqueNames}
              renderInput={(params) => 
                <TextField 
                  {...params} 
                  size="small" 
                  style={{width:"250px"}}


                  variant="filled"
                  onChange={(event) => { setSearchNameBuffer(event.target.value)}}
                  label="Try a taxon name" />}
            />


            {/* <TextField
            InputLabelProps={{
              style: {
                fontSize: "12px",
                top: "-5px"
              },
            }}
            InputProps={{
              style: {
                height: "35px",
              },
            }}
            variant="filled"
            value={searchNameBuffer}
            size="small"
            label="Try a taxon name"
            onChange={(event) => {
                setSearchNameBuffer(event.target.value);
            }}
            /> */}

            <Button
            
            style={{ maxHeight: "47px"}}
            size="small"
            variant="contained"
            type="submit"
            color="primary"
            >
            Search Root
            </Button>
        </Stack>
      </form>

    )
}

