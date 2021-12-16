import React, { useEffect, useState, useRef, useContext } from "react";
import styles from "./Map.module.css";
import * as d3 from "d3";
import { useQuery, gql } from "@apollo/client";
import axios from "axios"
import range from "../../dist/resources/plateID.json"
import {ID_QUERY, MAP_AND_FOSSIL_QUERY, FOSSIL_QUERY } from "./Queries"
import { GlobalStateContext } from "./GlobalStateContext";

const Tectonics = ({ geojson, fossilData }) => {
  const ref = useRef();
  const {myaRangeMap, wikiRefRange, myaValueMap, myaRangeTree} = useContext(GlobalStateContext)
  const mapYear = myaValueMap
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
    console.log(fossilData)
    // parse the fossil data
    let count = 0
    let fossilArray = []
    fossilData.forEach(fossilPointTraces => {
      fossilPointTraces.points.forEach(fossilPoint => {
        count++
        // features.push({
        //   "type": "Feature",
        //   "properties": {
        //     "ANCHOR": 0,
        //     "TIME": fossilPoint.time,
        //     "name": fossilPointTraces.name,
        //     "rank": fossilPointTraces.rank,
        //     "kingdom": fossilPointTraces.kingdom,
        //     "phylum": fossilPointTraces.phylum,
        //     "class": fossilPointTraces.class,
        //     "order": fossilPointTraces.order,
        //     "family": fossilPointTraces.family,
        //     "genus": fossilPointTraces.genus,
        //     "maxma": fossilPointTraces.maxma,
        //     "minma": fossilPointTraces.minma,
        //     "id": fossilPointTraces.id
        //   },
        //   "geometry": {
        //     "type": "Point",
        //     "coordinates": [
        //       fossilPoint.lon,
        //       fossilPoint.lat
        //     ]
        //   }
        // })
        fossilArray.push({coordinate: [fossilPoint.lon, fossilPoint.lat], id: fossilPointTraces.id})
      })
    })
    console.log(`There are ${count} fossil points to render`)

    // let fossilArray = []
    // fossilData.map(fossilCollection => 
    //   fossilCollection.records.map(record => {
    //     fossilArray.push({coordinate: record.coordinate, 
    //                       id: record.id,
    //                       pathFromRootById: fossilCollection.pathFromRootById})
    //   }))
    //console.log(fossilArray.length)
    const projection = d3.geoEquirectangular()//.scale(110);

    const geoGenerator = d3.geoPath().projection(projection).pointRadius(2);
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
        //const colors = d3.scaleOrdinal().domain(range).range(["#cecece","#b4b4b4","#979797","#7a7a7a","#5f5f5f"])
        //["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]
        // if the path is for coastline
        if (d.properties.PLATEID1) {
          const number = typeof(d.properties.PLATEID1) == "string" ? parseInt(d.properties.PLATEID1) : d.properties.PLATEID1
          return "#cecece"
        }
        // if the path is for points
        else {
          //console.log(d.geometry.type)
          const pointColors = ["black","red","green","blue","brown","purple","black","red","green","blue","brown","purple","black","red","green","blue","brown","purple","black","red","green","blue","brown","purple"]
          const color = pointColors[d.properties.TIME/10]
          return color
        }
      })
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
      .attr("r", "1px")
      .attr("fill", (d) => {
        // const colors = d3.scaleOrdinal().domain(wikiRefRange).range(["#800000","#191970","#006400","#9acd32","#ff0000","#ff8c00","#ffd700","#00ff00","#ba55d3","#00fa9a","#00ffff","#0000ff","#ff00ff","#1e90ff","#fa8072","#dda0dd"])
        // const pathArr = d.pathFromRootById.split(",").slice(1)
        // for (let id of pathArr) {
        //   if (wikiRefRange.includes(id)){
        //     return colors(id)
        //   }
        // }
        return "red"
      })
      .on("mouseover", (e,d) => {
        console.log("fossil id: ",d.id, "path from root:", d.pathFromRootById)
      })

      //console.log(wikiRefRange)
      
    
  },[geojson, fossilData, wikiRefRange]);
  
  return (
    <>
    <p>Eearth at {mapYear} million year{!mapYear && "s"} ago, viewing life existing from {myaRangeTree[0]} to {myaRangeTree[1]} million years ago</p>
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

export default function Map() {
  // const { data } = useQuery(MAP_AND_FOSSIL_QUERY, { variables: { mya: myaMain, minma: myaRange[0], maxma: myaRange[1], wikiRef: searchId ? searchId : searchName } });
  //const [data, setData] = useState({"getFossilsDuringMya":[]})
  const {myaValueMap, myaRangeMap, searchName, searchId, myaValueTree, myaRangeTree} = useContext(GlobalStateContext)
  const { data } = useQuery(ID_QUERY, { variables: { name: searchName } })
  const [mapData, setMapData] = useState(null)
  const [fossilData, setFossilData] = useState(null)
  useEffect(() => {
    // let url = "./tectonicData/reconstructed_" + myaMain + ".00Ma.json"
    // console.log("inside url: " + url)
    
    //const urlForMap = "./resources/tectonicData/reconstructed_" + myaMain + ".00Ma.geojson"
    const urlForMap = "./resources/map/Global_coastlines_2015_v1_low_res_reconstructed_" + myaValueMap + ".geojson"
    //const urlForFossil = "./resources/reconstructedAggPbdbForDb/" + myaMain + "mya.json"
    const urlForFossil = "./resources/reconstructedAggPbdbForDb/from" + myaRangeTree[0] + "To" + myaRangeTree[1] + "mean" + myaValueTree + "_reconstructed_" + myaValueTree + ".json"
    axios.get(urlForMap).then((res) => {
      setMapData({"getMapAtMya" : res.data})
      // console.log("inside data is now: ", data)
      // data ? console.log("inside, time is " + data.getMapAtMya.features[0].properties.TIME) : console.log("inside no time")
    })
    // axios.defaults.headers['Access-Control-Allow-Origin'] = "*"
    // axios.defaults.headers['Content-Type'] = 'application/json'
    // ,{headers:{'Access-Control-Allow-Origin': '*',}}
    axios.get("http://127.0.0.1:5000/traces?genus=Homo").then(res => {
      //console.log(res.data)
      setFossilData({"getFossilsDuringMyaByRoot": res.data})
    })

    // this is for getting the fossil from static files
    // axios.get(urlForFossil).then((res) => {
    //   // console.log(res.data["mya"] == myaMain)
    //   let rootId = searchId
    //   if (rootId == "") {
    //     //console.log("Has no root Id")
        
    //     if (data) { 
    //       //console.log("Has no rootId and got data")
    //       //console.log(data)
    //       rootId = data.getWikiIdByName
    //       setFossilData({"getFossilsDuringMyaByRoot": res.data["fossilData"].filter(item => item.pathFromRootById.split(",").includes(rootId))})
    //     }
    //   } else {
    //     //console.log("Has rootId: ", rootId)
    //     setFossilData({"getFossilsDuringMyaByRoot": res.data["fossilData"].filter(item => item.pathFromRootById.split(",").includes(rootId))})
    //   }
    // })
    
  },[myaValueMap, searchName, searchId, myaRangeMap, data])

  
  // console.log("outside  url: " + url)
  // data ? console.log("outside, time is " + data.getMapAtMya.features[0].properties.TIME) : console.log("outside no time")
  //data ? console.log(data.getMapAtMya):"no data"
  //const data = {"getMapAtMya" : mapData, "getFossilsDuringMya": []}
  return (
    <div className={styles.map}>
      {myaValueMap > 410 ? 
      "Earliest map data is 410 million years ago, please try a more recent time period :)" : 
      mapData && mapData.getMapAtMya && fossilData && fossilData.getFossilsDuringMyaByRoot ? (
        <Tectonics 
        geojson={mapData.getMapAtMya} 
        fossilData={fossilData.getFossilsDuringMyaByRoot} 
        />
      ) : mapData && mapData.getMapAtMya ? (
        <Tectonics geojson={mapData.getMapAtMya} fossilData={[]} />
      ) : "Loading map..."}


    </div>
  );
}
