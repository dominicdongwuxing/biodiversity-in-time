import React, { useEffect, useState } from "react";
import styles from "./Map.module.css";
import Fossils from "./Fossils";

export default function Map() {
  console.log("tree loaded")
  return (
    <div className={styles.map}>
      <h1>This is map.</h1>
      <Fossils />
    </div>
  );
}
