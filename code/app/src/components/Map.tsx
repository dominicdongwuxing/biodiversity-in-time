import React, { useEffect, useState, useRef } from "react";
import styles from "./Map.module.css";
import { FossilArrayAtMya } from "./getData";
import * as d3 from "d3";
import { useQuery, gql } from "@apollo/client";
import { Container } from "@mui/material"

const MAP_AND_FOSSIL_QUERY = gql`
  query retrieveMapAndFossils($mya: Int, $maxma: Float, $minma: Float) {
    getMapAtMya(mya: $mya) {
      mya
      type
      features {
        type
        properties {
          name
        }
        geometry {
          __typename
          ... on MapGeometryMultiPolygon {
            coordinatesMultiPolygon: coordinates
          }
          ... on MapGeometryPolygon {
            coordinatesPolygon: coordinates
          }
        }
      }
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
    const features = geojson.features.map((feature) => {
      const type =
        feature.geometry.__typename === "MapGeometryPolygon"
          ? "Polygon"
          : "MultiPolygon";
      return {
        type: feature.type,
        properties: feature.properties,
        geometry: {
          type: type,
          coordinates: feature.geometry["coordinates" + type],
        },
      };
    });

    // parse the fossil data
    
    const fossilArray = fossilData ? fossilData.map(fossil => [fossil.lat, fossil.lng]) : [];
    console.log(fossilData)
    const projection = d3.geoEquirectangular();

    const geoGenerator = d3.geoPath().projection(projection);

    // Join the FeatureCollection's features array to path elements

    d3.select(ref.current)
      .append("g")
      .selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", geoGenerator);
    
    d3.select(ref.current)
      .selectAll("circle")
      //.data([[-122,37],[110,60]])
      .data(fossilArray)
      .enter()
      .append("circle")
      .attr("cx", (d) => projection(d)[0])
      .attr("cy", (d) => projection(d)[1])
      .attr("r", "2px")
      .attr("fill","red")
  }, []);

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

export default function Map({ myaMain, myaRange }) {
  const { data } = useQuery(MAP_AND_FOSSIL_QUERY, { variables: { mya: myaMain, minma: myaRange[0], maxma: myaRange[1] } });
  // console.log(data)
  return (
    <div className={styles.map}>
      <h1>map section</h1>
      {/* <FossilArrayAtMya /> */}
      {data && data.getMapAtMya ? (
        <Tectonics geojson={data.getMapAtMya} fossilData={data.getFossilsDuringMya} />
      ) : (
        "Try a new search :)"
      )}
    </div>
  );
}

const geojson = {
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
