import React, { useEffect, useState } from "react";
import Header from "./Header";
import Map from "./Map";
import ScrollBar from "./ScrollBar";
import Tree from "./Tree";
import InfoSection from "./InfoSection";
import Footer from "./Footer";
import styles from "./App.module.css";

export default function App() {
  const changeMyaMain = (value) => {
    setMyaMain(parseInt(value))
    setMyaRange([(value - steps < 0) ? 0 : value - steps, (value + steps > 1000) ? 1000 : value + steps])
  }

  const changeMyaRange = (valueArr) => {
    setMyaRange([parseInt(valueArr[0]), parseInt(valueArr[1])])
  }

  const steps = 100
  const [myaMain, setMyaMain] = useState(500)
  const [myaRange, setMyaRange] = useState([myaMain - steps,myaMain + steps])

  return (
    <div className={styles.app}>
      <Header />
      <Map />
      <ScrollBar changeMyaMain = {changeMyaMain} changeMyaRange={changeMyaRange} myaMain={myaMain} myaRange={myaRange} steps={steps}/>
      <Tree props={{mya: myaMain, myaRange: myaRange}}/>
      <InfoSection />
      <Footer />
    </div>
  );
}
