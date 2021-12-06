import React, { useEffect, useState, useRef, useContext } from "react";
import styles from "./ScrollBar.module.css";
import * as d3 from "d3";
import intervals from "../../dist/resources/intervalsPhanerozoic.json"
//import intervals from "../../dist/resources/intervalsNew.json"
import { GlobalStateContext } from "./GlobalStateContext"

export default function ScrollBar() {
  const [geologicalTime, setGeologicalTime] = useState("")

  return (
    <div id="scaleBar" className={styles.scrollBar}>
      Current geological time period: {geologicalTime}
      <GeoTimescale setGeologicalTime={setGeologicalTime}/>
    </div>
  );
}

const GeoTimescale = ({ setGeologicalTime }) => {
  const { setMyaMain, setMyaRange, myaMain, myaRange } = useContext(GlobalStateContext)
  const ref = useRef()
  useEffect(() => {
    const {width, height, tickLength, neighborWidth, fontSize, margins} = {
      width: 960,
      height: 125,
      tickLength: 5,
      neighborWidth: 15,
      fontSize: 9,
      margins: { bottom: 40 },
    };

    let hideSmallTicks = true;

    const font = `${fontSize}px sans-serif`;

    // when cell width is less than 14, then hide the label
    const labelVisible = (d) => +(d.x1 - d.x0 > 14);

    // Create a new d3 partition layout
    const hierarchicalData = d3.stratify()(intervals).sum((d) =>
      d.leaf ? d.start - d.end : 0
    );
    const root = d3.partition()
    .size([width, height - margins.bottom])
    .padding(0)(hierarchicalData);


    const svg = d3.select(ref.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font", `${fontSize}px sans-serif`);
    
    // hold both cells(the bricks that show time periods) and ticks into g
    const g = svg.append("g");
    
    // hold the cells in cellGroup
    const cellGroup = g.append("g").attr("id", "cells");

    const cell = cellGroup
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    const rect = cell
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => {
        // use different blues from top to bottom
        const bluePalette = ["#00163d","#08306b","#0a4a90", "#1864aa","#2f7ebc","#4b97c9"]
        return bluePalette[d.depth]
      })
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("cursor", "pointer")
      .on("pointerenter", (_event, focus) => {

          // get the ancestors of the current segment
          const sequence = focus.ancestors();        
          // get direct parent of the current time period segment
          const focusParent = sequence.length > 1 ? sequence[1] : sequence[0]
          // find out index of focus among it's parent's children list
          const focusIndex = focus.depth ? focus.ancestors()[1].children.indexOf(focus) : -1
  
          const parentLength = focusParent.x1 - focusParent.x0
          const focusLength = focus.x1 - focus.x0
          const scaleFactor = (parentLength - (parentLength - focusLength) * 0.1)/focusLength
  
          cell
            .transition()
            .duration(200)
            // Highlight the ancestors
            .attr("fill-opacity", (d) => (sequence.includes(d) ? 1.0 : 0.5))
            .attr("transform", (d) => { 
              // only do the shrinking and expanding when focus depth is no less than 3
              if (focus.depth >= 3){             
                const parentX0 = focusParent.x0
                const parentX1 = focusParent.x1
                const originalOffsetX0 = d.x0 - parentX0
                const originalOffsetX1 = parentX1 - d.x0
                // if time depth is no less than focus depth, and it belongs to the sibling tree of the current focus
                if (d.depth >= focus.depth && d.ancestors().includes(focusParent) && !d.ancestors().includes(focus)){              
                  // find out the position index of its ancestor that is sibling to the focus in focus's parent's children list
                  const ancestorSiblingToFocus = d.ancestors()[d.ancestors().indexOf(focusParent) - 1]
                  const index = ancestorSiblingToFocus.ancestors()[1].children.indexOf(ancestorSiblingToFocus)
                  //console.log(d.data.name, index)
                  let startX0;
                  if (index < focusIndex) {
                    startX0 = parentX0 + originalOffsetX0 * 0.1
                  } else {
                    startX0 = parentX1 - originalOffsetX1 * 0.1
                  }
                  return `translate(${startX0},${d.y0})`
                } 
                // if time depth is no less than focus depth and it belongs to the current focus rooted tree (including focus itself)
                else if(d.depth >= focus.depth && d.ancestors().includes(focus)){
                  const focusStartX0 = parentX0 + (focus.x0 - parentX0) * 0.1
                  const distanceToFocusStartX0 = (d.x0 - focus.x0 ) * scaleFactor
                  const startX0 = focusStartX0 + distanceToFocusStartX0
                  return `translate(${startX0},${d.y0})`
                } else {
                  return `translate(${d.x0},${d.y0})`
                }
              } else {
              return `translate(${d.x0},${d.y0})`
            }
              
            });
            rect
              .transition()
              .duration(200)  
              .attr("width", d => {
                // only do the shrinking and expanding when focus depth is no less than 3
                if (focus.depth >= 3){
                  // if time depth is no less than focus depth, and it belongs to the sibling tree of the current focus
                  if (d.depth >= focus.depth && d.ancestors().includes(focusParent) && !d.ancestors().includes(focus)){              
                    return 0.1 *(d.x1 - d.x0) 
                  } 
                  // if time depth is no less than focus depth and it belongs to the current focus rooted tree (including focus itself)
                  else if(d.depth >= focus.depth && d.ancestors().includes(focus)){
                    const originalLength = d.x1 - d.x0
                    return originalLength * scaleFactor
                  } else {
                    return d.x1 - d.x0
                  }
                } else {
                  return d.x1 - d.x0
                }
              })
        
      })
      .on("pointerleave", () => {
        cell
          .transition()
          .duration(200)
          .attr("fill-opacity", 1)
          .attr("transform", d => `translate(${d.x0},${d.y0})`);
        rect
          .transition()
          .duration(200)
          .attr("width", d => d.x1 -d.x0)
      })
      .on("click", clicked);


      
    cell.append("title").text((d) => {
      const sequence = d
        .ancestors()
        .map((d) => d.data.name)
        .reverse();
  
      return `${sequence.join(" > ")}`;
    });
      
    const text = cell
      .append("text")
      .style("user-select", "none")
      .attr("pointer-events", "none")
      .attr("x", (d) => (d.x1 - d.x0) / 2)
      .attr("y", (d) => (d.y1 - d.y0) / 2)
      .attr("fill", "white")
      .attr("fill-opacity", labelVisible)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => {
        const rectWidth = d.x1 - d.x0;
        const labelWidth = getTextWidth(d.data.name, font);
        const abbrev = d.data.abbr || d.data.name.charAt(0);
  
        return rectWidth - 10 < labelWidth ? abbrev : d.data.name;
      });
      
    // Append ages ticks scale bar
    const ticksGroup = g
      .append("g")
      .attr("id", "ticks")
      .attr("transform", `translate(0,${height - margins.bottom})`); // Move tick group down
  
    ticksGroup.call((g) => ticks(g, makeTicksData(root), hideSmallTicks));


    function clicked(event, node) {
      const ancestorPath = node.ancestors().map(node => node.data.name)
      // disable focusing on Geological time (root) or top levels under Phanerozoic
      if (node == root || (ancestorPath.includes("Phanerozoic") && node.depth < 3)) return null
      // focus = p === focus ? p.parent : p;
      setGeologicalTime(ancestorPath.reverse().slice(1).join(" -> "))
      setMyaMain(Math.floor((node.data.end + node.data.start)/2))
      setMyaRange([node.data.start , node.data.end])
      hideSmallTicks = true//[0, 1, 2].includes(node.depth);

      // before Phanerozoic, focus on Geologic time, otherwise, focus on Phanerozoic
      const focus = ancestorPath.includes("Phanerozoic") ? root.children[2] : root

      const focusAncestors = node.ancestors().slice(1); // Ignore clicked node itself
    
      const t = event ? d3.transition().duration(450) : null; // Can't transition when using input, bit of a hack

      // Show a bit of the neighbouring cells on focus of an interval
      const leftNeighbor =
        focus.data.start === root.data.start ? 0 : neighborWidth;
      const rightNeighbor = focus.data.end === root.data.end ? 0 : neighborWidth;

      root.each((d) => {
        const widthMinusNeighbors = width - rightNeighbor - leftNeighbor;
        const focusWidth = focus.x1 - focus.x0; // partition width of focused node

        const target = {
          x0:
            leftNeighbor + ((d.x0 - focus.x0) / focusWidth) * widthMinusNeighbors,
          x1:
            leftNeighbor + ((d.x1 - focus.x0) / focusWidth) * widthMinusNeighbors,
          y0: d.y0,
          y1: d.y1,
        };

        d.target = target;
      });

      // Reset drag
      g.transition(t).attr("transform", "translate(0,0)");

      cell
        .transition(t)
        .attr("transform", (d) => `translate(${d.target.x0},${d.target.y0})`);

      rect
        .transition(t)
        .attr("width", (d) => +(d.target.x1 - d.target.x0))
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      if (event) {
        d3.select(this)
          .transition(t)
          .attr("stroke", "black")
          .attr("stroke-width", 1.5);

        d3.select(this.parentNode).raise();
      }

      text
        .transition(t)
        .attr("fill-opacity", (d) =>
          focusAncestors.includes(d) ? 1 : labelVisible(d.target)
        )
        .attr("x", (d) => {
          // Position all the ancestors labels in the middle
          // if (focusAncestors.includes(d)) {
          //   return -d.target.x0 + width / 2;
          // }

          // Position Geologic time (root) label in the middle
          if (d == root) return -d.target.x0 + width/2

          const rectWidth = d.target.x1 - d.target.x0;
          const textX = rectWidth / 2;

          return Number.isNaN(textX) ? -10 : textX;
        })
        .text((d) => {
          const rectWidth = d.target.x1 - d.target.x0;
          const labelWidth = getTextWidth(d.data.name, font);
          const abbrev = d.data.abbr || d.data.name.charAt(0);

          return rectWidth - 8 < labelWidth ? abbrev : d.data.name;
        });

      ticksGroup.call((g) => ticks(g, makeTicksData(root), hideSmallTicks));
    }

        // svg.call(
        //   d3.zoom()
        //     .translateExtent([
        //       [0, 0],
        //       [width, height],
        //     ])
        //     .scaleExtent([1, 8])
        //     .on("zoom", zoomed)
        //     .on("end", () => {
        //       rect.attr("cursor", "pointer");
        //     })
        // );

    function zoomed(e) {
      if (!root.target) return;

      const translateX = e.transform.x;

      if (
        translateX + root.target.x0 > 0 ||
        root.x1 - translateX > root.target.x1
      )
        return;

      rect.attr("cursor", "grabbing");
      g.attr("transform", `translate(${translateX},0)`);
    }

    function ticks(g, data, hideSmallTicks) {
      g.selectAll("g")
        .data(data)
        .join(
          (enter) => {
            const tick = enter
              .append("g")
              .attr("transform", (d) => `translate(${d.x}, 0)`)
              .attr("text-anchor", (d) =>
                d.x === 0 ? "start" : d.x === width ? "end" : "middle"
              )
              .attr("opacity", (d) =>
                [4, 5].includes(d.depth) && hideSmallTicks ? 0 : 1
              );

            tick
              .append("line")
              .attr("stroke", "#555")
              .attr("stroke-width", 1)
              .attr("x1", 0)
              .attr("y1", 2)
              .attr("x2", 0)
              .attr(
                "y2",
                (d) => margins.bottom - d.depth * tickLength - fontSize
              );

            tick
              .append("text")
              .attr("x", 0)
              .attr(
                "y",
                (d) => margins.bottom - d.depth * tickLength - fontSize / 2
              )
              .attr("dominant-baseline", "middle")
              .attr("font-size", (d) => `${1 - 0.05 * d.depth}em`)
              .text((d) => d.text)
              .clone(true)
              .lower()
              .attr("stroke-linejoin", "round")
              .attr("stroke-width", 2)
              .attr("stroke", "white");
          },
          (update) =>
            update
              .transition()
              .attr("opacity", (d) =>
                [4, 5].includes(d.depth) && hideSmallTicks ? 0 : 1
              )
              .attr("transform", (d) => `translate(${d.targetX}, 0)`)
              .attr("dominant-baseline", "hanging")
              .attr("text-anchor", (d) =>
                d.targetX === 0 ? "start" : d.targetX === width ? "end" : "middle"
              )
        );
    }


    function makeTicksData(root, width = 960) {
      const uniqueStartAges = new Set(
        root.descendants().map((node) => node.data.start)
      );

      const ticksData = Array.from(uniqueStartAges)
        .map((start) =>
          root.descendants().find((node) => node.data.start === start)
        )
        .map((d) => ({
          x: d.x0,
          depth: d.depth,
          targetX: d?.target?.x0 || 0,
          text: d.data.start,
        }));

      const now = {
        x: root.x1,
        depth: 0,
        targetX: root?.target?.x1 || width,
        text: 0,
      };

      ticksData.push(now);

      return ticksData;
    }

    // Via https://stackoverflow.com/questions/1636842/svg-get-text-element-width
    function getTextWidth(text, font) {
      // re-use canvas object for better performance
      // var canvas =
      //   getTextWidth.canvas ||
      //   (getTextWidth.canvas = document.createElement("canvas"));
      
      const context = document.createElement("canvas").getContext("2d");
      context.font = font;
      const metrics = context.measureText(text);

      return metrics.width;
    }

    // zero in Geologic time > Phanerozoic > Cenozoic > Quaternary > Holocene (0.0117-0 mya)
    //clicked(null, root.children[2].children[2].children[2].children[1])
        
  },[])
  return (
    <svg ref={ref}></svg>
  )
}


// function MyaMainScrollBar({ handleChange, myaMain }) {
//   const timeRange = [0, 1000];
//   const ref = useRef();
//   useEffect(() => {
//     const slider = sliderBottom()
//       .min(timeRange[0])
//       .max(timeRange[1])
//       .step(1)
//       .width(1000)
//       .tickFormat(d3.format("d"))
//       .ticks((timeRange[1] - timeRange[0]) / 50)
//       .default(myaMain)
//       .on("onchange", (val) => {
//         handleChange(val);
//       });

//     const g = d3
//       .select(ref.current)
//       .append("g")
//       .attr("transform", "translate(30,30)");

//     g.call(slider);
//   }, []);

//   return (
//     <svg
//       ref={ref}
//       style={{
//         height: 100,
//         width: "100%",
//         marginRight: "0px",
//         marginLeft: "0px",
//       }}
//     ></svg>
//   );
// }

// function MyaRangeScrollBar({ handleChange, myaMain, steps }) {
//   const timeRange = [0, 1000];
//   const ref = useRef();
//   useEffect(() => {
//     const slider = sliderBottom()
//       .min(timeRange[0])
//       .max(timeRange[1])
//       .step(1)
//       .width(1000)
//       .tickFormat(d3.format("d"))
//       .ticks((timeRange[1] - timeRange[0]) / 50)
//       .default([
//         myaMain - steps < 0 ? 0 : myaMain - steps,
//         myaMain + steps > 1000 ? 1000 : myaMain + steps,
//       ])
//       .fill("#2196f3")
//       .on("onchange", (valueArr) => {
//         const selectedRange = valueArr;
//         if (valueArr[0] > myaMain) {
//           slider.value([myaMain, valueArr[1]]);
//           selectedRange[0] = myaMain;
//         }

//         if (valueArr[1] < myaMain) {
//           slider.value([valueArr[0], myaMain]);
//           selectedRange[1] = myaMain;
//         }

//         handleChange(selectedRange);
//       });

//     d3.select(ref.current).select("g").remove();

//     const g = d3
//       .select(ref.current)
//       .append("g")
//       .attr("transform", "translate(30,30)");

//     g.call(slider);
//   }, [myaMain]);

//   return (
//     <svg
//       ref={ref}
//       style={{
//         height: 100,
//         width: "100%",
//         marginRight: "0px",
//         marginLeft: "0px",
//       }}
//     ></svg>
//   );
// }




