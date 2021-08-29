import React, { useEffect, useState } from "react";
import styles from "./Map.module.css";
import {FossilArrayAtMya} from "./getData";

export default function Map() {
  return (
    <div className={styles.map}>
      <h1>This is map.</h1>
      <FossilArrayAtMya />
    </div>
  );
}
