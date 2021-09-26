import React, { useEffect, useState } from "react";
import Header from "./Header";
import Map from "./Map";
import ScrollBar from "./ScrollBar";
import Tree from "./Tree";
import InfoSection from "./InfoSection";
import Footer from "./Footer";
import styles from "./App.module.css";

export default function App() {
  const changeMya = (value) => {
    setMya(value)
  }

  const changeLowerMya = (value) => {
    setLowerMya(value)
  }

  const changeHigherMya = (value) => {
    setHigherMya(value)
  }

  const [mya, setMya] = useState(500)
  const [lowerMya, setLowerMya] = useState(500)
  const [higherMya, setHigherMya] = useState(500)


  return (
    <div className={styles.app}>
      <Header />
      <Map />
      <ScrollBar changeMya = {changeMya} changeLowerMya={changeLowerMya} changeHigherMya={changeHigherMya} mya={mya} lowerMya={lowerMya} higherMya={higherMya}/>
      <Tree props={{mya: mya, lowerMya: lowerMya, higherMya: higherMya}}/>
      <InfoSection />
      <Footer />
    </div>
  );
}
