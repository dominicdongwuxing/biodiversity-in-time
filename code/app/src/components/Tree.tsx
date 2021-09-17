import React, { useEffect, useState, useRef } from "react";
import styles from "./Tree.module.css";
import { TreeByMya,TREE_QUERY } from "./getData";
import trueData from "../../constructedTree.json";
import * as d3 from "d3";
import filePng from "../images/file.png";
import folderPng from "../images/folder.png";
import flare2 from "../../flare-2.json"

const data = {
  "name": "Computer",
  "id": "0",
  "children": [
      {
          "name": "Desktop",
          "id": "1",
          "children": [
              { "name": "TA", "id": "1_1" },
              { "name": "Feedback", "id": "1_2" },
              { "name": "Marks", "id": "1_3" },
              { "name": "Lab5", "id": "1_4" },
              { "name": "Processing", "id": "1_5" },
              { "name": "Arduino", "id": "1_6" },
              { "name": "Internet Explorer", "id": "1_7" }
          ]
      },
      {
          "name": "Documents",
          "id": "2",
          "children": [
              { "name": "Arduino Projects", "id": "2_1" },
              { "name": "Books", "id": "2_2" },
              { "name": "Office Templates", "id": "2_3" },
              { "name": "OneNote Notebooks", "id": "2_4" },
              { "name": "Python Scripts", "id": "2_5" },
              { "name": "GitHub", "id": "2_6" },
              { "name": "UBC", "id": "2_7" }
          ]
      },
      {
          "name":"Downloads",
          "id": "3",
          "children": [
              { "name": "543_Lab5", "id": "3_1" },
              { "name": "543_Lab4", "id": "3_2" },
              { "name": "543_Lab3", "id": "3_3" },
              { "name": "angular-ui-tree", "id": "3_4" },
              { "name": "a1.pdf", "id": "3_5" }
          ]
      },
      {
          "name": "Courses",
          "id": "4",
          "children": [
              { "name": "public_html", "id": "4_1" },
              { "name": "workplace", "id": "4_2" }
          ]
      }
  ]
}



// adapted from https://bl.ocks.org/swkasica/6c2b7784ec654b999397b8bc29b84c08
function RadialTreeKasica ({ data }) {
  const ref = useRef()
  useEffect (()=>{
    function collapse(d) {
      if (d.children) {
          d._children = d.children;
          // d._children.forEach(collapse);
          d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    }
      data.children.forEach(child => child.children.forEach(grandchild => grandchild.children.forEach(collapse)))
      var height = 500;
      var width = 500;
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };

      var svg = d3.select(ref.current),
      // width = +svg.attr("width"),
      // height = +svg.attr("height"),
      radius = 200,
      g = svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");

  // var stratify = d3.stratify()
  //     .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

  var tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var root = tree(d3.hierarchy(data));
    // root.children.forEach(collapse);


    var link = g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
            .angle(function(d) { return d.x; })
            .radius(function(d) { return d.y; }));

    var node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
        .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
         .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; })
        .on("mouseover", function() {
          d3.select(this).classed("active", true);
        }).on("mouseout", function() {
          d3.select(this).classed("active", false);
        }). on("click", function (d) {
          data = d;
          d3.select(ref.current).remove();
          var svg = d3.select(ref.current);
          svg.append("circle").attr("cx",60).attr("cy",60).attr("r",60).attr("fill","red")
      // width = +svg.attr("width"),
      // height = +svg.attr("height"),
      radius = 200,
      g = svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");

  // var stratify = d3.stratify()
  //     .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

  var tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var root = tree(d3.hierarchy(data));
    // root.children.forEach(collapse);


    var link = g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
            .angle(function(d) { return d.x; })
            .radius(function(d) { return d.y; }));

    var node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
        .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
         .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; })
        .on("mouseover", function() {
          d3.select(this).classed("active", true);
        }).on("mouseout", function() {
          d3.select(this).classed("active", false);
        }). on("click", function (d) {
          data = d;
          d3.select(ref.current).remove();
        });
      
      
      node.append("circle")
        .attr("r",2.5)
    // node.append("image")
    //     .attr("x", -6)
    //     .attr("y", -6)
    //     .attr("width", 20)
    //     .attr("height", 20)
    //     .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
    //     .attr("href", function(d) { return d.children ? "images/folder.png" : "images/file.png" });

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
        .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
        .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
        .text(function(d) {return d.data.name; });
        });
      
      
      node.append("circle")
        .attr("r",2.5)
    // node.append("image")
    //     .attr("x", -6)
    //     .attr("y", -6)
    //     .attr("width", 20)
    //     .attr("height", 20)
    //     .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
    //     .attr("href", function(d) { return d.children ? "images/folder.png" : "images/file.png" });

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
        .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
        .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
        .text(function(d) {return d.data.name; });
 

  function radialPoint(x, y) {
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
  }

  },[data]);
  
  return (
    <svg
      ref={ref}
      style={{
        height: 800,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    >

    </svg>
  )
}


// Sontrop's implementation: https://bl.ocks.org/FrissAnalytics/974dc299c5bc79cc5fd7ee9fa1b0b366 

// adapted from https://observablehq.com/@d3/radial-tidy-tree?collection=@d3/d3-hierarchy
function RadialTreeBostock ({ data }) {
  const ref = useRef()
  useEffect (() => {

    const width = 954
      const radius = width / 2

      function autoBox() {
        document.body.appendChild(this);
        const {x, y, width, height} = this.getBBox();
        document.body.removeChild(this);
        return [x, y, width, height];
      }

      //data = d3.hierarchy(data)
      data = d3.hierarchy(data)
        .sort((a, b) => d3.ascending(a.data.name, b.data.name))

      const tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
    
      const root = tree(data);
  
      //svg = d3.create("svg");

      const svg = d3.select(ref.current)

      svg.append("g")
          .attr("fill", "none")
          .attr("stroke", "#555")
          .attr("stroke-opacity", 0.4)
          .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .enter()
        .append("path")
        //.join("path")
          .attr("d", d3.linkRadial()
              .angle(d => d.x)
              .radius(d => d.y));
      
      svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .enter()
        .append("circle")
        //.join("circle")
          .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90})
            translate(${d.y},0)
          `)
          .attr("fill", d => d.children ? "#555" : "#999")
          .attr("r", 2.5);
      
          svg.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("stroke-linejoin", "round")
          .attr("stroke-width", 3)
        .selectAll("text")
        .data(root.descendants())
        .enter()
        .append("text")
        //.join("text")
          .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90}) 
            translate(${d.y},0) 
            rotate(${d.x >= Math.PI ? 180 : 0})
          `)
          .attr("dy", "0.31em")
          .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
          .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
          .text(d => d.data.name)
        .clone(true).lower()
          .attr("stroke", "white");
      
          svg.attr("viewBox", autoBox).node();
  },[data.length])


  return (
    <svg
      ref={ref}
      style={{
        height: 800,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    >

    </svg>
  )
}

function Test () {
  const ref = useRef()
  useEffect (() => {
    const svg = d3.select(ref.current)
    svg.append("g")
      .append("rect")
      .attr("x",20)
      .attr("y",20)
      .attr("width",60)
      .attr("height",30)
      .attr("fill","green")
      .attr("transform","translate(0, 60)")
  },[])
  return (
    <svg ref={ref} style={{border: "2px solid gold"}}>
    </svg>
  )
}

export default function Tree() {
  const fileImage = filePng
  const folderImage = folderPng
  return (
    <div className={styles.tree}>
      <h1>This is tree.</h1>
      <Test />          
    </div>
  );
}
// <div>{JSON.stringify(constructedTree)}</div>
// <div><BarChart data={data} /></div>
// <RadialTree data={data}/>
// <img src={sampleImage}></img>