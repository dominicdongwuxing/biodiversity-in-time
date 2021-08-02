import React, { useEffect, useState } from "react";
import styles from "./Tree.module.css";
import myTree from "../../../../dataset/wikidata/processed/dangling_trees/Q72288.json"
import * as d3 from "d3";
export default function Tree() {
  return (
    <div className={styles.tree}>
      <h1>This is tree.</h1>
      <div>{JSON.stringify(myTree)}</div>
    </div>
  );
}
