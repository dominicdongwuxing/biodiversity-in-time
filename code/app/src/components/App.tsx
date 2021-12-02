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

import {GlobalStateContextConsumer} from "./globalStateContext"



export default function App() {
  
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
              <GlobalStateContextConsumer>
                {({myaMain, myaRange, searchName, searchId, wikiRefRange}) => (
                  <Map 
                      myaMain={myaMain} 
                      myaRange={myaRange} 
                      searchName={searchName} 
                      searchId={searchId} 
                  />)
                }
              </GlobalStateContextConsumer>
              
            </CardContent>
          </Card>
        </Grid>

        <Grid item sm={4} >
          <Card style={{height: "525px"}}>
            <CardContent>
              <Tree/>          
            </CardContent>
          </Card>
        </Grid>

      <Grid item sm={12}>
        <Card style={{height:"100%"}}>
          <CardContent>
            <GlobalStateContextConsumer>
              {({myaMain, myaRange, setMyaMain, setMyaRange}) => (
                <ScrollBar
                changeMyaMain={setMyaMain}
                changeMyaRange={setMyaRange}
                myaMain={myaMain}
                myaRange={myaRange}
                />
              )}
            </GlobalStateContextConsumer>
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
