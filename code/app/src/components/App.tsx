import React, { useEffect, useState } from "react";
import Header from "./Header";
import Map from "./Map";
import ScrollBar from "./ScrollBar";
import Tree from "./Tree";
import Footer from "./Footer";
import styles from "./App.module.css";
import { useAppStyles } from "./AppStyles";
import { Grid, Card } from "@mui/material";

export default function App() {
  const changeMyaMain = (value) => {
    setMyaMain(parseInt(value));
    setUrl("./resources/tectonicData/reconstructed_" + parseInt(value) + ".00Ma.geojson")
    setMyaRange([
      value - steps < 0 ? 0 : value - steps,
      value + steps > 1000 ? 1000 : value + steps,
    ]);
  };

  const changeMyaRange = (valueArr) => {
    setMyaRange([parseInt(valueArr[0]), parseInt(valueArr[1])]);
  };

  const steps = 10;
  const initialMya = 400;
  const [myaMain, setMyaMain] = useState(initialMya);
  const [url, setUrl] = useState("./resources/tectonicData/reconstructed_" + initialMya + ".00Ma.geojson")
  const [myaRange, setMyaRange] = useState([myaMain - steps, myaMain + steps]);

  return (
    <Grid container>
      {/* <div className={styles.app}> */}
      <Grid item sm={12}>
        <Card>
        <Header />
        </Card>
        
      </Grid>

      <Grid item sm={12} container >
        <Grid item sm={7} >
          <Map myaMain={myaMain} myaRange={myaRange} url={url}/>
        </Grid>

        <Grid item sm={5} >
          <Tree props={{ mya: myaMain, myaRange: myaRange }} />
        </Grid>
      </Grid>

      <Grid item sm={12}>
        <ScrollBar
          changeMyaMain={changeMyaMain}
          changeMyaRange={changeMyaRange}
          myaMain={myaMain}
          myaRange={myaRange}
          steps={steps}
        />
      </Grid>
      
      <Grid item sm={12}>
        <Footer />
      </Grid>
      {/* </div> */}
    </Grid>
  );
}
