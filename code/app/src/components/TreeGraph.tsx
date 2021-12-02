import React, {useState, useEffect, useRef} from "react"
import * as d3 from "d3"

// adapted from https://bl.ocks.org/swkasica/6c2b7784ec654b999397b8bc29b84c08
export default function TreeGraph({ data, setSearchId, setWikiRefRange}) {
    const ref = useRef(null);
    useEffect(() => {
      //data.children.forEach(child => child.children.forEach(grandchild => grandchild.children.forEach(collapse)))
      const sideLength = 380;
      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  
      const svg = d3.select(ref.current).
                      attr("height", sideLength).
                      attr("width", sideLength),
        radius = 100,
        g = svg
          .append("g")
          .attr(
            "transform",
            "translate(" + (sideLength / 2 + 30) + "," + (sideLength / 2 - 10) + ")"
          );
  
      // var stratify = d3.stratify()
      //     .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
  
      const tree = d3
        .tree()
        .size([2 * Math.PI, radius])
        .separation(function (a, b) {
          return (a.parent == b.parent ? 1 : 2) / a.depth;
        });
  
      const root = tree(d3.hierarchy(data));
      // root.children.forEach(collapse);
  
      // build a color palete for the outmost children
      const wikiRefRange = root.descendants().filter(node => node.data.children.length === 0).map(node => node.data.id)
      setWikiRefRange(wikiRefRange)
      const colors = d3.scaleOrdinal().domain(wikiRefRange).range(["#800000","#191970","#006400","#9acd32","#ff0000","#ff8c00","#ffd700","#00ff00","#ba55d3","#00fa9a","#00ffff","#0000ff","#ff00ff","#1e90ff","#fa8072","#dda0dd"])
  
      const link = g
        .selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr(
          "d",
          d3
            .linkRadial()
            .angle(function (d) {
              return d.x;
            })
            .radius(function (d) {
              return d.y;
            })
        );
  
      const node = g
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", function (d) {
          return "node" + (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function (d) {
          return "translate(" + radialPoint(d.x, d.y) + ")";
        })
        .on("mouseover", function (e,d) {
          d3.select(this).classed("active", true);
          d3.select(this).select("circle").attr("r",5)
          if (!(d.depth === 0 || d.data.children.length === 0)){
            
            d3.select(this).append("title").text(d.data.name)
          }
        })
        .on("mouseout", function (e,d) {
          d3.select(this).classed("active", false);
          d3.select(this).select("circle").attr("r", d => d.depth ? 2.5 : 4.5)
        })
        .on("click", function (e, d) {
          // var svg = d3.select(ref.current);
          // svg.remove("g")
          // setData(exampleData);
          //console.log(d.data)
          //d3.select(ref.current).remove();
          setSearchId(d.data.id);
        });
      
      node.append("circle")
        .attr("r", (d) => {
          return d.depth ? 2.5 : 4.5
        })
        //.on("mouseover", handleMouseOver);
      
      
      // node.append("image")
      //     .attr("x", -6)
      //     .attr("y", -6)
      //     .attr("width", 20)
      //     .attr("height", 20)
      //     .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
      //     .attr("href", function(d) { return d.children ? "images/folder.png" : "images/file.png" });
  
      node
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", function (d) {
          return d.x < Math.PI === !d.children ? 6 : -6;
        })
        .attr("text-anchor", function (d) {
          return d.x < Math.PI === !d.children ? "start" : "end";
        })
        .attr("transform", function (d) {
          return (
            "rotate(" +
            ((d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180) /
              Math.PI +
            ")"
          );
        })
        .text(function (d) {
          return d.depth === 0 || d.data.children.length === 0 ? d.data.name : null
        })
        .style("fill", function (d) {
          return wikiRefRange.includes(d.data.id) ? colors(d.data.id) : "black" 
        })
  
        // .on("mouseover", (e,d) => {
        //   if (!(d.depth === 0 || d.depth === searchDepth - 1)){
        //     return this.text
        //   }
        // });
  
      function radialPoint(x, y) {
        return [(y = +y) * Math.cos((x -= Math.PI / 2)), y * Math.sin(x)];
      }
    }, [data]);
  
    return (
      <svg
        ref={ref}
        style={{
          width: "100%",
          margin: "0px",
        }}
      ></svg>
    );
  }
  

// Sontrop's implementation: https://bl.ocks.org/FrissAnalytics/974dc299c5bc79cc5fd7ee9fa1b0b366
// Bostock's implementation: https://observablehq.com/@d3/radial-tidy-tree?collection=@d3/d3-hierarchy