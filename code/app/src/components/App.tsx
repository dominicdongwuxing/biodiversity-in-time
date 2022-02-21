import React from "react";
import Header from "./Header";
import Map from "./Map";
import TimeControl from "./TimeControl";
import Tree from "./Tree";
import Footer from "./Footer";
import { Grid, Card, CardContent } from "@mui/material";


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
