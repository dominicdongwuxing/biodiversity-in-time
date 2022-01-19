import React, { useEffect, useState, useRef, useContext } from "react";
import styles from "./Map.module.css";
import * as d3 from "d3";
import * as lasso from "d3-lasso"
import axios from "axios"
import { useQuery } from "@apollo/client";
import {FOSSILLOCATION_QUERY} from "./Queries"
import { GlobalStateContext } from "./GlobalStateContext";
import DataFetcher from "./DataFetcher";



const Tectonics = ({ geojson, fossilData }) => {
  const ref = useRef();
  const {myaValueMap, myaRangeTree, currentTree, treeFocusNode, setNodesOnFocus } = useContext(GlobalStateContext)
  const mapYear = myaValueMap
  useEffect(() => {

    const features = geojson.features
    // parse the fossil data
    let count = 0
    let fossilArray = []
    fossilData.forEach(fossilLocation => {
        count++
        fossilArray.push({coordinate: fossilLocation.coordinate, id: fossilLocation.id, pathFromRoot: fossilLocation.pathFromRoot})
    })
    //console.log(`There are ${count} fossil points to render`)

    const projection = d3.geoEquirectangular()//.scale(110);

    const geoGenerator = d3.geoPath().projection(projection);
    // set up zoom
    const handleZoom = (e) => {
      d3.select(ref.current)
        .select("g")
        .attr("transform",e.transform)
    }
    const zoom = d3.zoom()
      .scaleExtent([-1,50])
      .translateExtent([[0,0],[1000,600]])
      .on("zoom", handleZoom)

    d3.select(ref.current) 
      .call(zoom)
    
    // Remove the last map 
    d3.select(ref.current).select("g").remove("g")

    // Join the FeatureCollection's features array to path elements
    d3.select(ref.current)
      .append("g")
      .selectAll("path")
      .data(features)
      .join("path")
      .attr("d", geoGenerator)
      .attr("fill","#e8ebeb")
      .attr("stroke","black")
      .attr("stroke-width","0.2px")


    // first build a name to color look up from currentTree
    const pathToColor = {}
    currentTree.forEach(node => {
      pathToColor[node.pathFromRoot] = node.color
    })

    const fossilPoints = d3.select(ref.current)
      .select("g")
      .selectAll("circle")
      .data(fossilArray)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection(d.coordinate)[0])
      .attr("cy", (d) => projection(d.coordinate)[1])
      .attr("r", "5px")
      .attr("fill", (d) => pathToColor[d.pathFromRoot])
      .attr("fill-opacity", d => {
        if (!treeFocusNode.length) {
          return 0.2
        } else {
          if (treeFocusNode === d.pathFromRoot) {
            return 1
          } else {
            return 0
          }
        }
      })
      .on("mouseover", (e,d) => {
        setNodesOnFocus([d.pathFromRoot])
        //console.log("fossil id: ",d.id, "name:", d.pathFromRoot.split(",")[d.pathFromRoot.split(",").length-1])
      })
      .on("mouseout", (e,d) => setNodesOnFocus([])) 
    

      //console.log(d3.lasso())
      function lasso_start () {
        lasso.items()
            .attr("r",3.5) // reset size
            .classed("not_possible",true)
            .classed("selected",false);
      };

      function lasso_draw () {
      
          // Style the possible dots
          lasso.possibleItems()
              .classed("not_possible",false)
              .classed("possible",true);

          // Style the not possible dot
          lasso.notPossibleItems()
              .classed("not_possible",true)
              .classed("possible",false);
      };

      function lasso_end () {
          // Reset the color of all dots
          lasso.items()
              .classed("not_possible",false)
              .classed("possible",false);

          // Style the selected dots
          lasso.selectedItems()
              .classed("selected",true)
              .attr("r",7);

          // Reset the style of the not selected dots
          lasso.notSelectedItems()
              .attr("r",3.5);

      };
      
      // const lasso = d3.lasso()
      //     .closePathSelect(true)
      //     .closePathDistance(100)
      //     .items(fossilPoints)
      //     .targetArea(ref.current)
      //     .on("start",lasso_start)
      //     .on("draw",lasso_draw)
      //     .on("end",lasso_end);
      
      // d3.select(ref.current).call(lasso);
      
  },[geojson, fossilData, currentTree, treeFocusNode]);
  
  return (
    <>
    {/* <p>Earth at {mapYear} million year{mapYear > 0 && "s"} ago, viewing life existing from {myaRangeTree[0]} to {myaRangeTree[1]} million years ago</p> */}
    <svg
      ref={ref}
      style={{
        height: "400px",
        width: "100%",
        margin: "0px",
        //border: "1px solid black"
      }}
    ></svg>
    </>
  );
};

export default function Map() {
  const {myaValueMap, searchName, myaRangeTree, currentTree} = useContext(GlobalStateContext)
  const [mapData, setMapData] = useState(null)
  useEffect(() => {
    const urlForMap = "./resources/newMap/Global_coastlines_2015_v1_low_res_reconstructed_" + myaValueMap + "Ma.geojson"
    axios.get(urlForMap).then((res) => {
      setMapData(res.data)
     })
  },[myaValueMap])

  return (
    <DataFetcher query={FOSSILLOCATION_QUERY}>
      {(loading, err, fossilData) => {
        // if (loading) {
        //   return "Loading fossils on map..."
        // }
        return (
          <div className={styles.map}>
            {myaValueMap > 410 ? 
            "Earliest map data is 410 million years ago, please try a more recent time period :)" : 
            mapData && fossilData ? (
              <Tectonics 
                geojson={mapData} 
                fossilData={fossilData.getFossilLocations} 
              />
            ) : mapData ? (
              <Tectonics geojson={mapData} fossilData={[]} />
            ) : "Loading map..."}
          </div>
        )
      }}
    </DataFetcher>

  );
}
