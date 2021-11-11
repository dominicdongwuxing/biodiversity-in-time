import React, { useEffect, useState } from "react";
import Header from "./Header";
import Map from "./Map";
import ScrollBar from "./ScrollBar";
import Tree from "./Tree";
import Footer from "./Footer";
import styles from "./App.module.css";
import { useAppStyles } from "./AppStyles";
import { Grid, Card, CardContent, CardActions } from "@mui/material";
import { useQuery, gql } from "@apollo/client";



export default function App() {
  const changeMyaMain = (value) => {
    setMyaMain(parseInt(value));
    setMyaRange([
      value - steps < 0 ? 0 : value - steps,
      value + steps > 1000 ? 1000 : value + steps,
    ]);
  };

  const changeMyaRange = (valueArr) => {
    setMyaRange([parseInt(valueArr[0]), parseInt(valueArr[1])]);
  };

  const steps = 10;
  const initialMya = Math.floor(0.0117/2);
  const [myaMain, setMyaMain] = useState(initialMya);
  const [myaRange, setMyaRange] = useState([0,0.0117]);
  // const [searchName, setSearchName] = useState("Mammalia");
  // const [searchId, setSearchId] = useState("Q7377");

  const [searchName, setSearchName] = useState("Biota");
  const [searchId, setSearchId] = useState("Q2382443");

  return (
    <Grid container>
      {/* <div className={styles.app}> */}
      <Grid item sm={12}>
        <Card>
          <CardContent>
            <Header />
          </CardContent>
        </Card>
      </Grid>


        <Grid item sm={8} >
          <Card style={{height:"525px"}}>
            <CardContent>
              <Map myaMain={myaMain} myaRange={myaRange} searchName={searchName} searchId={searchId}/>
            </CardContent>
          </Card>
        </Grid>

        <Grid item sm={4} >
          <Card style={{height: "525px"}}>
            <CardContent>
              <Tree props={{ mya: myaMain, myaRange: myaRange, searchName: searchName, searchId: searchId, setSearchName: setSearchName, setSearchId: setSearchId }} />
            </CardContent>
          </Card>
        </Grid>

      <Grid item sm={12}>
        <Card style={{height:"100%"}}>
          <CardContent>
            <ScrollBar
            changeMyaMain={changeMyaMain}
            changeMyaRange={changeMyaRange}
            myaMain={myaMain}
            myaRange={myaRange}
            steps={steps}
            />
          </CardContent>
        </Card>
        
      </Grid>
      
      <Grid item sm={12}>
          <Card>
            <CardContent>
              <Footer />
            </CardContent>
          </Card>
      </Grid>
      {/* </div> */}
    </Grid>
  );
}
