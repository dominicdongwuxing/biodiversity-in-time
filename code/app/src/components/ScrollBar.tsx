import React, { useEffect, useState, useRef } from "react";
import styles from "./ScrollBar.module.css";
import * as d3 from "d3";
import { sliderBottom } from "d3-simple-slider";

function MyaMainScrollBar({ handleChange, myaMain }) {
  const timeRange = [0, 1000];
  const ref = useRef();
  useEffect(() => {
    const slider = sliderBottom()
      .min(timeRange[0])
      .max(timeRange[1])
      .step(1)
      .width(1000)
      .tickFormat(d3.format("d"))
      .ticks((timeRange[1] - timeRange[0]) / 50)
      .default(myaMain)
      .on("onchange", (val) => {
        handleChange(val);
      });

    const g = d3
      .select(ref.current)
      .append("g")
      .attr("transform", "translate(30,30)");

    g.call(slider);
  }, []);

  return (
    <svg
      ref={ref}
      style={{
        height: 100,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    ></svg>
  );
}

function MyaRangeScrollBar({ handleChange, myaMain, steps }) {
  const timeRange = [0, 1000];
  const ref = useRef();
  useEffect(() => {
    const slider = sliderBottom()
      .min(timeRange[0])
      .max(timeRange[1])
      .step(1)
      .width(1000)
      .tickFormat(d3.format("d"))
      .ticks((timeRange[1] - timeRange[0]) / 50)
      .default([
        myaMain - steps < 0 ? 0 : myaMain - steps,
        myaMain + steps > 1000 ? 1000 : myaMain + steps,
      ])
      .fill("#2196f3")
      .on("onchange", (valueArr) => {
        const selectedRange = valueArr;
        if (valueArr[0] > myaMain) {
          slider.value([myaMain, valueArr[1]]);
          selectedRange[0] = myaMain;
        }

        if (valueArr[1] < myaMain) {
          slider.value([valueArr[0], myaMain]);
          selectedRange[1] = myaMain;
        }

        handleChange(selectedRange);
      });

    d3.select(ref.current).select("g").remove();

    const g = d3
      .select(ref.current)
      .append("g")
      .attr("transform", "translate(30,30)");

    g.call(slider);
  }, [myaMain]);

  return (
    <svg
      ref={ref}
      style={{
        height: 100,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    ></svg>
  );
}

export default function ScrollBar({
  changeMyaMain,
  changeMyaRange,
  myaMain,
  myaRange,
  steps,
}) {
  return (
    <div className={styles.scrollBar}>
      <h1>scroll bar section</h1>
      Select how many million years ago (mya) to view the map: {myaMain}
      <MyaMainScrollBar handleChange={changeMyaMain} myaMain={myaMain} />
      Fine tune the range around the mya value to view the tree: from{" "}
      {myaRange[0]} mya to {myaRange[1]} mya:
      <MyaRangeScrollBar
        handleChange={changeMyaRange}
        myaMain={myaMain}
        steps={steps}
      />
    </div>
  );
}
