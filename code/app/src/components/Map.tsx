import React, { useEffect, useState, useRef, useContext } from "react";
import styles from "./Map.module.css";
import * as d3 from "d3";
import { useQuery, gql } from "@apollo/client";
import axios from "axios"
import range from "../../dist/resources/plateID.json"
import { GlobalStateContextConsumer } from "./globalStateContext";
import {ID_QUERY, MAP_AND_FOSSIL_QUERY, FOSSIL_QUERY } from "./queries"
import { GlobalStateContext } from "./globalStateContext";

const Tectonics = ({ geojson, fossilData, wikiRefRange }) => {
  const ref = useRef();
  const {myaRange} = useContext(GlobalStateContext)
  const mapYear = Math.round(myaRange[1]-myaRange[0]/2)
  useEffect(() => {
    // parse the map data   
    // const features = geojson.features.map((feature) => {
    //   const type =
    //     feature.geometry.__typename === "MapGeometryPolygon"
    //       ? "Polygon"
    //       : "MultiPolygon";
    //   return {
    //     type: feature.type,
    //     properties: feature.properties,
    //     geometry: {
    //       type: type,
    //       coordinates: feature.geometry["coordinates" + type],
    //     },
    //   };
    // });

    const features = geojson.features

    //const range = [...new Set(features.map(shape => shape.properties.PLATEID1))]
    //console.log(range)
  
    // parse the fossil data
    let fossilArray = []
    fossilData.map(fossilCollection => 
      fossilCollection.records.map(record => {
        if (record.id=="866953") {
          console.log(record, fossilCollection.pathFromRootById)}
        fossilArray.push({coordinate: record.coordinate, 
                          id: record.id,
                          pathFromRootById: fossilCollection.pathFromRootById})
      }))
    console.log(fossilArray.length)
    const projection = d3.geoEquirectangular()//.scale(110);

    const geoGenerator = d3.geoPath().projection(projection);
    // const bounds = features.map(feature => geoGenerator.bounds(feature))
    // const xmin = d3.min(bounds.map(bound => d3.min(bound[0])))
    // const xmax = d3.max(bounds.map(bound => d3.max(bound[0])))
    // const ymin = d3.min(bounds.map(bound => d3.min(bound[1])))
    // const ymax = d3.max(bounds.map(bound => d3.max(bound[1])))
    // console.log(xmin, xmax, ymin, ymax)
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
      .attr("fill",d => {
        const colors = d3.scaleOrdinal().domain(range).range(["#cecece","#b4b4b4","#979797","#7a7a7a","#5f5f5f"])
        //["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]
        
        const number = typeof(d.properties.PLATEID1) == "string" ? parseInt(d.properties.PLATEID1) : d.properties.PLATEID1
        return colors(number) 
      })
    
    
    const fossilPoints = d3.select(ref.current)
      .select("g")
      .selectAll("circle")
      .data(fossilArray)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection(d.coordinate)[0])
      .attr("cy", (d) => projection(d.coordinate)[1])
      .attr("r", "1px")
      .attr("fill", (d) => {
        const colors = d3.scaleOrdinal().domain(wikiRefRange).range(["#800000","#191970","#006400","#9acd32","#ff0000","#ff8c00","#ffd700","#00ff00","#ba55d3","#00fa9a","#00ffff","#0000ff","#ff00ff","#1e90ff","#fa8072","#dda0dd"])
        const pathArr = d.pathFromRootById.split(",").slice(1)
        for (let id of pathArr) {
          if (wikiRefRange.includes(id)){
            return colors(id)
          }
        }
        return "black"
      })
      .on("mouseover", (e,d) => {
        console.log("fossil id: ",d.id, "path from root:", d.pathFromRootById)
      })

      //console.log(wikiRefRange)
      
    
  },[geojson, fossilData, wikiRefRange]);
  
  return (
    <>
    <p>Eearth at {mapYear} million year{!mapYear && "s"} ago, viewing life existing from {myaRange[0]} to {myaRange[1]} million years ago</p>
    <svg
      ref={ref}
      style={{
        height: "500px",
        width: "100%",
        margin: "0px",
        border: "1px solid black"
      }}
    ></svg>
    </>
  );
};

export default function Map({ myaMain, myaRange, searchName, searchId}) {
  // const { data } = useQuery(MAP_AND_FOSSIL_QUERY, { variables: { mya: myaMain, minma: myaRange[0], maxma: myaRange[1], wikiRef: searchId ? searchId : searchName } });
  //const [data, setData] = useState({"getFossilsDuringMya":[]})
  const { data } = useQuery(ID_QUERY, { variables: { name: searchName } })
  const [mapData, setMapData] = useState(null)
  const [fossilData, setFossilData] = useState(null)
  
  useEffect(() => {
    // let url = "./tectonicData/reconstructed_" + myaMain + ".00Ma.json"
    // console.log("inside url: " + url)
    
    //const urlForMap = "./resources/tectonicData/reconstructed_" + myaMain + ".00Ma.geojson"
    const urlForMap = "./resources/map/Global_coastlines_2015_v1_low_res_reconstructed_" + myaMain + ".geojson"
    //const urlForFossil = "./resources/reconstructedAggPbdbForDb/" + myaMain + "mya.json"
    const urlForFossil = "./resources/reconstructedAggPbdbForDb/from" + myaRange[0] + "To" + myaRange[1] + "mean" + myaMain + "_reconstructed_" + myaMain + ".json"
    axios.get(urlForMap).then((res) => {
      setMapData({"getMapAtMya" : res.data})
      // console.log("inside data is now: ", data)
      // data ? console.log("inside, time is " + data.getMapAtMya.features[0].properties.TIME) : console.log("inside no time")
    })

    
    axios.get(urlForFossil).then((res) => {
      // console.log(res.data["mya"] == myaMain)
      let rootId = searchId
      if (rootId == "") {
        //console.log("Has no root Id")
        
        if (data) { 
          //console.log("Has no rootId and got data")
          //console.log(data)
          rootId = data.getWikiIdByName
          setFossilData({"getFossilsDuringMyaByRoot": res.data["fossilData"].filter(item => item.pathFromRootById.split(",").includes(rootId))})
        }
      } else {
        //console.log("Has rootId: ", rootId)
        setFossilData({"getFossilsDuringMyaByRoot": res.data["fossilData"].filter(item => item.pathFromRootById.split(",").includes(rootId))})
      }
    })
    
  },[myaMain, searchName, searchId, myaRange, data])

  
  // console.log("outside  url: " + url)
  // data ? console.log("outside, time is " + data.getMapAtMya.features[0].properties.TIME) : console.log("outside no time")
  //data ? console.log(data.getMapAtMya):"no data"
  //const data = {"getMapAtMya" : mapData, "getFossilsDuringMya": []}
  return (
    <div className={styles.map}>
      {myaMain > 410 ? 
      "Earliest map data is 410 million years ago, please try a more recent time period :)" : 
      mapData && mapData.getMapAtMya && fossilData && fossilData.getFossilsDuringMyaByRoot ? (
         <GlobalStateContextConsumer>
           {({wikiRefRange}) => (
             <Tectonics 
              geojson={mapData.getMapAtMya} 
              fossilData={fossilData.getFossilsDuringMyaByRoot} 
              wikiRefRange={wikiRefRange} />
           )}
         </GlobalStateContextConsumer>
        
      ) : mapData && mapData.getMapAtMya ? (
        <Tectonics geojson={mapData.getMapAtMya} fossilData={[]} wikiRefRange={[]} />
      ) : "Loading map..."}


    </div>
  );
}
