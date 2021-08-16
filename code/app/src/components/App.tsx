import React, { useEffect, useState } from "react";
import Header from "./Header";
import Map from "./Map";
import ScrollBar from "./ScrollBar";
import Tree from "./Tree";
import InfoSection from "./InfoSection";
import Footer from "./Footer";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Map />
      <ScrollBar />
      <Tree />
      <InfoSection />
      <Footer />
    </div>
  );
}
