import React, { useEffect, useState, useRef } from "react";
import styles from "./Map.module.css";
import * as d3 from "d3";
import { useQuery, gql } from "@apollo/client";
import { Container } from "@mui/material"
import axios from "axios"

const MAP_AND_FOSSIL_QUERY = gql`
  query retrieveMapAndFossils($mya: Int, $maxma: Float, $minma: Float) {
    getMapAtMya(mya: $mya) {
      mya
      # type
      # features {
      #   type
      #   properties {
      #     name
      #   }
      #   geometry {
      #     __typename
      #     ... on MapGeometryMultiPolygon {
      #       coordinatesMultiPolygon: coordinates
      #     }
      #     ... on MapGeometryPolygon {
      #       coordinatesPolygon: coordinates
      #     }
      #   }
      # }
    }

    getFossilsDuringMya (minma: $minma, maxma: $maxma) {
      lat
      lng
      name
      wikiRef
    }
  }
`;

const FOSSIL_QUERY = gql`
  query retrieveFossilsDuringMya($minma: Float, $maxma: Float) {
    getFossilsDuringMya(mya: $mya) {
      wikiRef
      lat
      lng
    }
  }
`;

const Tectonics = ({ geojson, fossilData }) => {
  const ref = useRef();
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

    // parse the fossil data
    
    const fossilArray = fossilData ? fossilData.map(fossil => [fossil.lng, fossil.lat]) : [];
    console.log(fossilArray)
    const projection = d3.geoEquirectangular().scale(100);

    const geoGenerator = d3.geoPath().projection(projection);
    // const bounds = features.map(feature => geoGenerator.bounds(feature))
    // const xmin = d3.min(bounds.map(bound => d3.min(bound[0])))
    // const xmax = d3.max(bounds.map(bound => d3.max(bound[0])))
    // const ymin = d3.min(bounds.map(bound => d3.min(bound[1])))
    // const ymax = d3.max(bounds.map(bound => d3.max(bound[1])))
    // console.log(xmin, xmax, ymin, ymax)
    // set up zoom
    const handleZoom = (e) => {
      //console.log(e.sourceEvent.stopPropagation)
      d3.select(ref.current)
        .select("g")
        .attr("transform",e.transform)
    }
    const zoom = d3.zoom()
      .scaleExtent([-5,5])
      .translateExtent([[0,0],[1800,1600]])
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
    
    d3.select(ref.current)
      .select("g")
      .selectAll("circle")
      //.data([[-122,37],[110,60]])
      .data(fossilArray)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection(d)[0])
      .attr("cy", (d) => projection(d)[1])
      .attr("r", "2px")
      .attr("fill","red")

    
  },[geojson, fossilData]);

  return (
    <svg
      ref={ref}
      style={{
        height: 600,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    ></svg>
  );
};

export default function Map({ myaMain, myaRange, url }) {
  const { data } = useQuery(MAP_AND_FOSSIL_QUERY, { variables: { mya: myaMain, minma: myaRange[0], maxma: myaRange[1] } });
  const [mapData, setMapData] = useState(null)
  useEffect(() => {
    // let url = "./tectonicData/reconstructed_" + myaMain + ".00Ma.json"
    // console.log("inside url: " + url)
    axios.get(url).then((res) => {
      setMapData({"getMapAtMya" : res.data})
      // console.log("inside data is now: ", data)
      // data ? console.log("inside, time is " + data.getMapAtMya.features[0].properties.TIME) : console.log("inside no time")
    })
    
  },[url])
  

  // console.log("outside  url: " + url)
  // data ? console.log("outside, time is " + data.getMapAtMya.features[0].properties.TIME) : console.log("outside no time")
  //data ? console.log(data.getMapAtMya):"no data"
  //const data = {"getMapAtMya" : mapData, "getFossilsDuringMya": []}
  return (
    <div className={styles.map}>
      <h1>map section</h1>
      {mapData && mapData.getMapAtMya && data && data.getFossilsDuringMya ? (
        <Tectonics geojson={mapData.getMapAtMya} fossilData={data.getFossilsDuringMya} />
      ) : (
        <Tectonics geojson={exampleGeojson} fossilData={[]} />
      )}
    </div>
  );
}

const exampleGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Africa",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6, 36],
            [33, 30],
            [43, 11],
            [51, 12],
            [29, -33],
            [18, -35],
            [7, 5],
            [-17, 14],
            [-6, 36],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Australia",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [143, -11],
            [153, -28],
            [144, -38],
            [131, -31],
            [116, -35],
            [114, -22],
            [136, -12],
            [140, -17],
            [143, -11],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Timbuktu",
      },
      geometry: {
        type: "Point",
        coordinates: [-3.0026, 16.7666],
      },
    },
  ],
};
