import React, { useState, useContext } from "react"
import { GlobalStateContext } from "./GlobalStateContext";
import {
    Button,
    TextField,
  } from "@mui/material";
  import { useTreeStyles } from "./TreeStyles";

export default function TreeSearchName () {
    const {setSearchName} = useContext(GlobalStateContext)
    const [searchNameBuffer, setSearchNameBuffer] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        setSearchName(searchNameBuffer);
      };

    return (
        <form onSubmit={handleSubmit}>
            <TextField
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
            />

            <Button
            className={useTreeStyles().root}
            style={{ maxHeight: "35px"}}
            size="small"
            variant="contained"
            type="submit"
            color="primary"
            >
            Search Root
            </Button>
      </form>

    )
}