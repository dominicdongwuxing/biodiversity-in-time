import React, { useEffect, useState, useRef, useContext } from "react";
import {sliderBottom} from "d3-simple-slider"
import styles from "./TimeControl.module.css";
import * as d3 from "d3";
import intervals from "../../dist/resources/intervalsPhanerozoic.json"
//import intervals from "../../dist/resources/intervalsNew.json"
import { GlobalStateContext } from "./GlobalStateContext"
import { margin } from "@mui/system";

// type: [{year: Int, name: String, range: ([start, end])}]
// !! need to fix the very recent years!
const smallestIntervals = []
const tickValues = [0]

intervals.forEach(item => {
  if (item.level == 5) {
    const mya = Math.round((item.start + item.end ) / 2)
    const name = item.name 
    const range = [item.start, item.end]
    smallestIntervals.push({mya: mya,name: name, range: range})
  }
  if (item.level == 3 && item.start > 5){
    tickValues.push(item.start)
  }
})

export default function TimeControl() {
  return (
    <div id="timeControl" className={styles.timeControl}>
      <TimeControlTable />
    </div>
  );
}

function TimeControlTable () {
  const { setMyaValueMap, 
          myaValueMap, 
          setMyaRangeTree, 
         } = useContext(GlobalStateContext)
  const bluePalette = ["#00163d","#08306b","#0a4a90", "#1864aa","#2f7ebc","#4b97c9"]
  const ref = useRef()
  useEffect(() => {
    const {width, offset, padding,tableHeight, tickLength, neighborWidth, fontSize, margins, zoomDepth, gap, extraGap,scrollbarHeight, breadcrumbParams} = {
      width: 960,
      offset: 8,
      tableHeight: 125,//125 + gap * 4 + scrollbarHeight * 2 + breadcrumbParams.height 
      tickLength: 5,
      extraGap: 15, // this is for further bringing down the table
      padding: 15,
      neighborWidth: 15,
      fontSize: 9,
      margins: { bottom: 40 },
      zoomDepth: 3,
      scrollbarHeight: 40,
      gap: 4,
      breadcrumbParams: {width: 100, tipWidth: 15, height: 15, gap: 2, fontSize: 9}
    };

    let hideSmallTicks = true;

    let myaValueMapCurrent = myaValueMap

    const font = `${fontSize}px sans-serif`;

    // when cell width is less than 14, then hide the label
    const labelVisible = (d) => +(d.x1 - d.x0 > 14);

    // Create a new d3 partition layout
    const hierarchicalData = d3.stratify()(intervals).sum((d) =>
      d.leaf ? d.start - d.end : 0
    );
    const root = d3.partition()
    .size([width - padding * 2, tableHeight - margins.bottom])
    .padding(0)(hierarchicalData);


    const svg = d3.select(ref.current)
      .attr("viewBox", [0, 0, width, tableHeight + scrollbarHeight + breadcrumbParams.height + gap * 3 + margins.bottom + extraGap])
      .style("font", `${fontSize}px sans-serif`);
    
    // hold both cells(the bricks that show time periods) and ticks into g
    const g = svg.append("g");
    
    const slider = g
      .append("g")
      .attr("transform",`translate(${padding},${offset})`)
  
    const sliderGenerator = sliderBottom()
      .min(541)
      .max(0)
      .width(width - padding * 2)
      .tickFormat(d3.format('.1f'))
      .marks(smallestIntervals.map(i => i.mya))
      .tickValues(tickValues)
      .default(myaValueMap)
      .handle(
        d3
          .symbol()
          .type(d3.symbolCircle)
          .size(30)()
      )
      .on("onchange", (val) => {
        if (parseInt(val) > myaValueMapCurrent) {
          sliderGenerator.value(myaValueMapCurrent)
        } else {
          const intervalName = smallestIntervals.find(i => i.mya == val).name
          const interval = root.descendants().find(i => i.data.name == intervalName && i.height == 0)
          const path = ["Geologic Time", ...interval.ancestors().reverse().map(i => i.data.name).slice(1)]
          makeBreadcrumb(geologicalBreadcrumb, path)
        }
      })
      .on("end", (val) => {
        if (parseInt(val) <= myaValueMapCurrent) {
          setMyaValueMap(parseInt(val))
        }
      })
  

    slider.call(sliderGenerator)

    const geologicalBreadcrumb = g
      .append("g")
      .attr("transform",`translate(${padding},${gap + scrollbarHeight + gap})`)
    
    const treeOfLifeBreadcrumb = g
      .append("g")
      .attr("transform",`translate(${padding},${gap + scrollbarHeight + gap + gap + breadcrumbParams.height})`)
    
    // makeBreadcrumb (geologicalBreadcrumb, geologicalTime)
    // makeBreadcrumb (treeOfLifeBreadcrumb, treeOfLifeTime)
    
    // const slider = sliderBottom()
    //   .min(timeRange[0])
    //   .max(timeRange[1])
    //   .step(10)
    //   .width(541)
    //   .tickFormat(d3.format("d"))
    //   .ticks((timeRange[1] - timeRange[0]) / 10)
    //   .default(200)
    //   .on("onchange", (val) => {
    //     console.log("changed")
    //   });

    //   mapSliderG.call(slider);

    // hold the cells in cellGroup
    const cellGroup = g
      .append("g")
      .attr("id", "cells")
      .attr("transform",`translate(${padding},${gap + scrollbarHeight + gap + 2 * breadcrumbParams.height + gap + extraGap})`);

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
        return bluePalette[d.depth]
      })
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("cursor", "pointer")
      .on("pointerenter", (_event, focus) => {
        // get the ancestors of the current segment
        const ancestorsDescending = focus.ancestors().reverse();       
        // find the ancestor on the zoom level and the level above
        const ancestorZoomLevel = ancestorsDescending[zoomDepth]
        const ancestorZoomLevelParent = ancestorsDescending[zoomDepth-1]

        // find out index of ancestor on zoom level among it's parent's children list
        const ancestorZoomLevelIndex = ancestorZoomLevelParent ? ancestorZoomLevelParent.children.indexOf(ancestorZoomLevel) : -1

        // find out the scale factor by which the zoomed in object expand
        const ancestorZoomLevelParentLength = ancestorZoomLevelParent ? ancestorZoomLevelParent.x1 - ancestorZoomLevelParent.x0 : null
        const ancestorZoomLevelLength = ancestorZoomLevel ? ancestorZoomLevel.x1 - ancestorZoomLevel.x0 : null
        const scaleFactor = (ancestorZoomLevelParentLength - (ancestorZoomLevelParentLength - ancestorZoomLevelLength) * 0.1)/ancestorZoomLevelLength

        cell
          .transition()
          .duration(200)
          // Highlight the ancestors
          .attr("fill-opacity", (d) => (ancestorsDescending.includes(d) ? 1.0 : 0.5))
          .attr("transform", (d) => { 
            // only do the shrinking and expanding when focus depth is no less than zoom depth 
            if (focus.depth >= zoomDepth){       
              // find out the parent boundaries that don't change
              const parentX0 = ancestorZoomLevelParent.x0
              const parentX1 = ancestorZoomLevelParent.x1
              // find out how fat the d.x0 is from the parent boundaries
              const originalOffsetFromParentX0 = d.x0 - parentX0
              const originalOffsetFromParentX1 = parentX1 - d.x0
              // if time depth is no less than ancestor on zoom level's depth, then it belongs to the sibling tree of the current ancestor on zoom level
              if (d.depth >= ancestorZoomLevel.depth && d.ancestors().includes(ancestorZoomLevelParent) && !d.ancestors().includes(ancestorZoomLevel)){              
                // find out on the sibling list, the position index of its ancestor that is sibling to the ancestor on zoom level 
                const ancestorSiblingToAncestorZoomLevel = d.ancestors()[d.ancestors().indexOf(ancestorZoomLevelParent) - 1]
                const index = ancestorSiblingToAncestorZoomLevel.ancestors()[1].children.indexOf(ancestorSiblingToAncestorZoomLevel)
                let startX0;
                // if this segment belongs to the left side of the zoomed in part
                if (index < ancestorZoomLevelIndex) {
                  // compute x0 from left offset
                  startX0 = parentX0 + originalOffsetFromParentX0 * 0.1
                // if the segment belongs to the right side of the zoomed in part
                } else {
                  // compute x0 from the right offset
                  startX0 = parentX1 - originalOffsetFromParentX1 * 0.1
                }
                d.targetX0 = startX0
                ticksData.find(data => data.text == d.data.start).targetX0 = startX0
                return `translate(${startX0},${d.y0})`
              } 
              // if time depth is no less than ancestor on zoom level depth and it belongs to the current ancestor on zoom level rooted tree (including ancestor on zoom level itself)
              else if(d.depth >= ancestorZoomLevel.depth && d.ancestors().includes(ancestorZoomLevel)){
                const ancestorZoomLevelStartX0 = parentX0 + (ancestorZoomLevel.x0 - parentX0) * 0.1
                const distanceToancestorZoomLevelStartX0 = (d.x0 - ancestorZoomLevel.x0 ) * scaleFactor
                const startX0 = ancestorZoomLevelStartX0 + distanceToancestorZoomLevelStartX0
                d.targetX0 = startX0
                ticksData.find(data => data.text == d.data.start).targetX0 = startX0
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
            // only do the shrinking and expanding when focus depth is no less than zoom depth 
            if (focus.depth >= zoomDepth){
              // if time depth is no less than ancestorZoomLevel depth, and it belongs to the sibling tree of the current ancestorZoomLevel
              if (d.depth >= ancestorZoomLevel.depth && d.ancestors().includes(ancestorZoomLevelParent) && !d.ancestors().includes(ancestorZoomLevel)){ 
                const newWidth = 0.1 * (d.x1 - d.x0)     
                d.targetWidth = newWidth     
                return newWidth
              } 
              // if time depth is no less than ancestorZoomLevel depth and it belongs to the current ancestorZoomLevel rooted tree (including ancestorZoomLevel itself)
              else if(d.depth >= ancestorZoomLevel.depth && d.ancestors().includes(ancestorZoomLevel)){
                const originalLength = d.x1 - d.x0
                const newWidth = originalLength * scaleFactor
                d.targetWidth = newWidth             
                return newWidth
              } else {
                return d.x1 - d.x0
              }
            } else {
              return d.x1 - d.x0
            }
          })

        text
          .transition()
          .duration(200)
          .attr("fill-opacity", (d) => {
            let width
            if (focus.depth >= zoomDepth) {
              
              if (d.ancestors().includes(ancestorZoomLevelParent)) {
                width = d.targetWidth ? d.targetWidth : d.x1 - d.x0
              } else {
                width = d.x1 - d.x0
              }
            } else {
              width = d.x1 - d.x0
            }
            const opcacity = width > 14 ? 1 : 0
            return opcacity
          })
          .attr("x", (d) => {
            // Position all the ancestors labels in the middle
            // if (focusAncestors.includes(d)) {
            //   return -d.target.x0 + width / 2;
            // }
  
            // Position Geologic time (root) label in the middle
            //if (d == root) return -d.target.x0 + width/2
            if (focus.depth >= zoomDepth) {
              if (d.ancestors().includes(ancestorZoomLevelParent)) {
                const width = d.targetWidth ? d.targetWidth : d.x1 - d.x0
                return width / 2;
              } else {
                return (d.x1 - d.x0) / 2
              }
            } else {
              return (d.x1 - d.x0) / 2
            }
          })
          .text((d) => {
            
            const labelWidth = getTextWidth(d.data.name, font);
            const abbrev = d.data.abbr || d.data.name.charAt(0);
            let width
            if (focus.depth >= zoomDepth) {
              
              if (d.ancestors().includes(ancestorZoomLevelParent)) {
                width = d.targetWidth ? d.targetWidth : d.x1 - d.x0
              } else {
                width = d.x1 - d.x0
              }
            } else {
              width = d.x1 - d.x0
            }
            return width - 10 < labelWidth ? abbrev : d.data.name;
          });
        //ticksGroup.call((g) => ticks(g, makeTicksData(root), hideSmallTicks,focus))
        tick
          .transition()
          .duration(200)
          .attr("opacity", (d) => {
            if (focus && focus.depth >= zoomDepth) {
              if (d.ancestors.includes(ancestorZoomLevel)) {
                return 1
              } else if (d.ancestors.includes(ancestorZoomLevelParent) && !d.ancestors.includes(ancestorZoomLevel)) {
                return 0
              } else {
                return [4,5].includes(d.depth) && hideSmallTicks ? 0 : 1
              }
            } else {
              return [4,5].includes(d.depth) && hideSmallTicks ? 0 : 1
            }
          })
          .attr("transform", (d) => {
            if (focus && focus.depth >= zoomDepth) {
              if (d.ancestors.includes(ancestorZoomLevelParent)) {
                return `translate(${d.targetX0}, 0)`
              }
              return `translate(${d.x0}, 0)`
            } else {
              return `translate(${d.x0}, 0)`
            }
          })
      })
      .on("pointerleave", () => {
        const leaveTime = 600
        cell
          .transition()
          .duration(leaveTime)
          .attr("fill-opacity", 1)
          .attr("transform", d => `translate(${d.x0},${d.y0})`);
        rect
          .transition()
          .duration(leaveTime)
          .attr("width", d => d.x1 -d.x0)
        text
          .transition()
          .duration(leaveTime)
          .attr("fill-opacity", labelVisible)
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
          })
        
        tick 
          .transition()
          .duration(leaveTime)
          .attr("transform", (d) => `translate(${d.x0},0)`)
          .attr("opacity", (d) =>
            [4,5].includes(d.depth) && hideSmallTicks ? 0 : 1
          )
        //ticksGroup.call((g) => ticks(g, makeTicksData(root), hideSmallTicks,null))
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
      .attr("transform", `translate(${padding},${gap + scrollbarHeight + gap + 2 * breadcrumbParams.height + gap + extraGap + tableHeight - margins.bottom})`); // Move tick group down
    
    const ticksData = makeTicksData(root)
    const tick = ticksGroup
      .selectAll("g")
      .data(ticksData)
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},0)`)
      .attr("text-anchor", (d) => {
        // if (d.x0 === 0) {
        //   return "start"
        // }

        // if (d.x0 === width) {
        //   return "end"
        // }

        return "middle"
        }
      )
      .attr("opacity", (d) =>
        [4,5].includes(d.depth) && hideSmallTicks ? 0 : 1
      )
    
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
      )

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
    //ticksGroup.call((g) => ticks(g, makeTicksData(root), hideSmallTicks, null));

    function makeTicksData(root, width = 960) {
      const uniqueStartAges = new Set(
        root.descendants().map((node) => node.data.start)
      );

      const ticksData = Array.from(uniqueStartAges)
        .map((start) =>
          root.descendants().find((node) => node.data.start === start)
        )
        .map((d) => ({
          x0: d.x0,
          depth: d.depth,
          targetX0: d.targetX0,
          text: d.data.start,
          ancestors: d.ancestors()
        }));

      const now = {
        x0: root.x1,
        depth: 0,
        targetX0: root.targetX0 + root.targetWidth || width,
        text: 0,
        ancestors: []
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

    function clicked(event, node) {
      const ancestorPath = node.ancestors().map(node => node.data.name).reverse()
      // disable focusing on Geological time (root) or top levels under Phanerozoic
      if (node == root || (ancestorPath.includes("Phanerozoic") && node.depth < 3)) return null
      const middleMyaTree = Math.round((node.data.end + node.data.start)/2)
      const mapInterval = smallestIntervals.find(interval => interval.range[0] >= middleMyaTree && interval.range[1] <= middleMyaTree) 
      const middleMyaMap = mapInterval.mya
      const mapIntervalName = mapInterval.name

      setMyaValueMap(middleMyaMap)
      setMyaRangeTree([node.data.start , node.data.end])
      myaValueMapCurrent = middleMyaMap
      const geologicalTime = ["Geologic Time"].concat(root.descendants().find(i => i.data.name == mapIntervalName).ancestors().map(node => node.data.name).reverse().slice(1))
      const treeOfLifeTime = ["Tree of Life Time"].concat(ancestorPath.slice(1))
      makeBreadcrumb (geologicalBreadcrumb, geologicalTime)
      makeBreadcrumb (treeOfLifeBreadcrumb, treeOfLifeTime)

      sliderGenerator.value(middleMyaMap)
      rect
        .attr("fill", d => {
          return d == node ? "black" : bluePalette[d.depth]
        })
    }

    function breadcrumbPoints (d, i) {
      const points = []
      points.push("0,0")
      points.push(breadcrumbParams.width + ",0")
      points.push(breadcrumbParams.width + breadcrumbParams.tipWidth + "," + (breadcrumbParams.height / 2))
      points.push(breadcrumbParams.width + "," + breadcrumbParams.height)
      points.push(breadcrumbParams.width + "," + breadcrumbParams.height)
      points.push("0," + breadcrumbParams.height)
      if (i) {
        points.push(breadcrumbParams.tipWidth, "," + (breadcrumbParams.height / 2))
      }
      return points.join(" ")
    }

    function makeBreadcrumb (breadcrumb, pathList) {
      breadcrumb
        .selectAll("polygon")
        .data(pathList)
        .join("polygon")
        .attr("points", breadcrumbPoints)
        .attr("fill", (d, i) => bluePalette[i])
        .attr("transform", (d, i) => {
          return `translate(${i * (breadcrumbParams.width + breadcrumbParams.gap)},0)`
        })
      
      breadcrumb
        .selectAll("text")
        .data(pathList)
        .join("text")
        .attr("x", breadcrumbParams.width / 2)
        .attr("transform", (d, i) => i ? 
          `translate(${i * (breadcrumbParams.width + breadcrumbParams.gap) + breadcrumbParams.tipWidth},0)` :
          `translate(0,0)`)
        .attr("y", breadcrumbParams.height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline","middle")
        .attr("fill", "white")
        .attr("fill-opacity", 1)
        .attr("font-size",breadcrumbParams.fontSize)
        .attr("font-weight", 800)
        .text(d => d)
        breadcrumb.exit().remove()
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

    // function zoomed(e) {
    //   if (!root.target) return;

    //   const translateX = e.transform.x;

    //   if (
    //     translateX + root.target.x0 > 0 ||
    //     root.x1 - translateX > root.target.x1
    //   )
    //     return;

    //   rect.attr("cursor", "grabbing");
    //   g.attr("transform", `translate(${translateX},0)`);
    // }

    // zero in Geologic time > Phanerozoic > Cenozoic > Quaternary > Holocene (0.0117-0 mya)
    clicked(null, root.children[0].children[2].children[2].children[1])
  
  },[])
  return (
    <svg ref={ref}></svg>
  )
}

function TimeControlGeologicalBar ({ setGeologicalTime, geologicalTime }) {
  useEffect(() => {

  })
}

function TimeControlTreeOfLifeBar ({ treeOfLifeTime, setTreeOfLifeTime }) {

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




