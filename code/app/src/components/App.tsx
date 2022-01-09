import React, { useEffect, useState } from "react";
import Header from "./Header";
import Map from "./Map";
import TimeControl from "./TimeControl";
import Tree from "./Tree";
import Footer from "./Footer";
import styles from "./App.module.css";
import { useAppStyles } from "./AppStyles";
import { Grid, Card, CardContent, CardActions } from "@mui/material";
import { useQuery, gql } from "@apollo/client";

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


        <Grid item sm={7} >
          <Card style={{height:"425px"}}>
            <CardContent>
              <Map />              
            </CardContent>
          </Card>
        </Grid>

        <Grid item sm={5} >
          <Card style={{height: "425px"}}>
            <CardContent>
              <Tree/>          
            </CardContent>
          </Card>
        </Grid>

      <Grid item sm={12}>
        <Card style={{height:"100%"}}>
          <CardContent>
            <TimeControl />
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
