import React, { useEffect, useState, useRef, useContext } from "react";
import styles from "./Map.module.css";
import * as d3 from "d3";
import axios from "axios"
import { useQuery } from "@apollo/client";
import {FOSSILPOINT_QUERY, FOSSILLOCATION_QUERY} from "./Queries"
import { GlobalStateContext } from "./GlobalStateContext";
import DataFetcher from "./DataFetcher";

const Tectonics = ({ geojson, fossilData }) => {
  const ref = useRef();
  const {myaValueMap, myaRangeTree, flatTree, nodesOnFocus, setNodesOnFocus } = useContext(GlobalStateContext)
  const mapYear = myaValueMap
  useEffect(() => {

    const features = geojson.features
    // parse the fossil data
    let count = 0
    let fossilArray = []
    fossilData.forEach(fossilLocation => {
        count++
        fossilArray.push({coordinate: fossilLocation.coordinate, id: fossilLocation.id, uniqueName: fossilLocation.uniqueName})
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

    
    const fossilPoints = d3.select(ref.current)
      .select("g")
      .selectAll("circle")
      .data(fossilArray)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection(d.coordinate)[0])
      .attr("cy", (d) => projection(d.coordinate)[1])
      .attr("r", "5px")
      .attr("fill", (d) => {
        return flatTree.find(item => item.uniqueName === d.uniqueName).color
      })
      .attr("fill-opacity", d => {
        if (!nodesOnFocus.length) {
          return 0.2
        } else {
          if (nodesOnFocus.includes(d.uniqueName)) {
            return 1
          } else {
            return 0
          }
        }
      })
      .on("mouseover", (e,d) => {
        //setNodesOnFocus([d.uniqueName])
        console.log("fossil id: ",d.id, "uniqueName:", d.uniqueName)
      })
      //.on("mouseout", (e,d) => setNodesOnFocus([""])) 
      
  },[geojson, fossilData, flatTree, nodesOnFocus]);
  
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
  const {myaValueMap, searchName, myaRangeTree, flatTree} = useContext(GlobalStateContext)
  const [mapData, setMapData] = useState(null)
  useEffect(() => {
    const urlForMap = "./resources/newMap/Global_coastlines_2015_v1_low_res_reconstructed_" + myaValueMap + "Ma.geojson"
    axios.get(urlForMap).then((res) => {
      setMapData({"getMapAtMya" : res.data})
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
            mapData && mapData.getMapAtMya && fossilData && fossilData.getFossilLocationFromTreeWithMya ? (
              <Tectonics 
                geojson={mapData.getMapAtMya} 
                fossilData={fossilData.getFossilLocationFromTreeWithMya} 
              />
            ) : mapData && mapData.getMapAtMya ? (
              <Tectonics geojson={mapData.getMapAtMya} fossilData={[]} />
            ) : "Loading map..."}
          </div>
        )
      }}
    </DataFetcher>

  );
}
