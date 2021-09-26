import React, { useEffect, useState } from "react";
import styles from "./ScrollBar.module.css";

export default function ScrollBar( { changeMya, changeLowerMya, changeHigherMya, mya, lowerMya, higherMya } ) {
  return (
    <div className={styles.scrollBar}>
      <h1>This is scroll bar.</h1>
      <form>
        <label>
          Select how many million years ago (mya) for tectonics:
          <input value={mya} onChange={(event) => {changeMya(parseFloat(event.target.value))}}></input>
        </label>
        <br></br>
        <label>
          Select lower range mya with respect to tectonic mya: - 
          <input value={lowerMya} onChange={(event) => {changeLowerMya(parseFloat(event.target.value))}}></input>
        </label>
        <br></br>
        <label>
          Select upper range mya with respect to tectonic mya: + 
          <input value={higherMya} onChange={(event) => {changeHigherMya(parseFloat(event.target.value))}}></input>
        </label>
      </form>
    </div>
  );
}
