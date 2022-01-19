import React, {useState, useEffect, useRef, useContext} from "react"
import * as d3 from "d3"
import { GlobalStateContext } from "./GlobalStateContext";


export default function TreeGraph() {
  const { setSearchName, searchName, currentTree, setCurrentTree, nodesOnFocus, setTreeFocusNode } = useContext(GlobalStateContext)

  const ref = useRef(null)
  useEffect(() => {

    const {height, width, margins, radius, backgroundColor, paddingTop, fontSize, breadcrumbParams, opacities} = {
      height: 315,
      width: 350,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      paddingTop: 5,
      radius: 90,
      backgroundColor: "white",
      fontSize: "0.5em",
      breadcrumbParams: {width: 90, tipWidth: 4, height: 18, gap: 1, fontSize: 12},
      opacities:{normal: 0.7, unFocus: 0.2}
    };

    const partitionLayout = d3.partition().size([2*Math.PI, radius])

    const arcGenerator = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)
    
    const root = d3.stratify()
      .id(d => d.pathFromRoot)
      .parentId(d => d.parent)
      (currentTree);

    // when doing the roll up, note that if the node is a leaf of the to-be-visualized tree,
    // then use the total count,
    // i.e, all fossil count on this node and below (if it has children but just not shown)
    // but when it is a node, then use the fossil count identified to this node
    // to avoid double counting!
    root.sum(d => d.fossils.length)

    partitionLayout(root)

    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      //.attr("viewBox", [0, 0, width, width])
    
    let focusedNodesRender = []
    root.each((d) => {
      if (nodesOnFocus.includes(d.data.pathFromRoot)){
        const ancestors = d.ancestors().map(i => i.data.pathFromRoot)
        ancestors.forEach(ancestor => {
          if (!focusedNodesRender.includes(ancestor)){
            focusedNodesRender.push(ancestor)
          }
        })
      }
    })

    // renew the flatTree after adding the colors
    setCurrentTree(currentTree)

    //
    svg.selectAll("g").remove()

    // make a trail of breadcrumbs from Eukaryota to the current root
    const breadcrumbUpstream = svg
      .append("g")
      .attr("transform", `translate(0,${breadcrumbParams.gap + paddingTop})`)
    
    const pathFromRoot = currentTree.find(node => node.parent === null).pathFromRoot
    makeBreadcrumb (breadcrumbUpstream, pathFromRoot.split(","))
    

    
    // make a trail of breadcrumbs from current root to the item on hover
    const breadcrumbDownstream = svg
      .append("g")
      .attr("transform", `translate(0,${breadcrumbParams.height + breadcrumbParams.gap * 2 + paddingTop})`)

    // if there is only one single focus then we can even show the breadcrumb
    if (nodesOnFocus.length === 1) {
      const node = root.descendants().find(i => i.data.pathFromRoot === nodesOnFocus[0])
      makeBreadcrumb (breadcrumbDownstream, node.ancestors().reverse().slice(1))
    }
    

    const arc = svg
      .append("g")
      .attr("transform", `translate(${width/2 + 70},${height/2 + breadcrumbParams.height})`)

    const path = arc
      .selectAll("path")
      .data(root.descendants())
      .join("path")
      .attr("d", arcGenerator)
      .attr("id", d => d.data.pathFromRoot)
      .attr("fill", d => d.data.color)
      .attr("opacity", d => focusedNodesRender.includes(d.data.pathFromRoot) ? 1 : nodesOnFocus.length ? opacities.unFocus : opacities.normal )
      .attr("stroke","black")
      .attr("cursor", "pointer")
      .attr("stroke-width", 0.5)
      .on("click", (e, d) => {
        setSearchName(d.data.name)})

    path
      .on("mouseover", (e, focus) => {
        const ancestorsDescending = focus.ancestors().reverse()
        setTreeFocusNode(focus.data.pathFromRoot)
        path
          .attr("opacity", (d) => ancestorsDescending.includes(d) ? 1 : opacities.unFocus)
        labelOuterCircle
          .attr("fill-opacity", d => {
            if (!labelVisible(d)) return 0
            return ancestorsDescending.includes(d) ? 1 : opacities.unFocus
          })
        makeBreadcrumb (breadcrumbDownstream, ancestorsDescending.slice(1))
      })
      .on("mouseout", () => {
        setTreeFocusNode("")
        path
          .attr("opacity", opacities.normal)
        labelOuterCircle
          .attr("fill-opacity", labelVisible)
        makeBreadcrumb (breadcrumbDownstream, [])
      })
      
    
    path
      .append("title")
      .text(d => d.data.name)
    
  
    const labelOuterCircle = arc
      .append("g")
      .attr("pointer-events", "none")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .filter(d => d.height == 0)
      .attr("text-anchor", d => (d.x0 + d.x1) / 2 < Math.PI ? "start" : "end")
      .attr("dominant-baseline", "middle")
      .attr("fill","black")
      .attr("font-size", fontSize)
      .attr("fill-opacity", labelVisible)
      .attr("transform", d => {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI
        const y = d.y1 + 0.05 * d.y1//(d.y0 + d.y1) / 2 
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
      })
      .text(getName);
    
    function getName(d) {
      const nameList = d.data.name.split(" ")
      if (nameList.length === 1) return nameList[0] 
      else if (nameList.length === 2) return nameList[0].charAt(0).toUpperCase() + ". " + nameList[1]
      else if(nameList.length === 3) return nameList[0].charAt(0).toUpperCase() + ". " + nameList[1] + nameList[2]
    }

    function labelVisible(d) {
      const name = getName(d)
      const enoughLength = getTextWidth(name, fontSize) + d.y1 < width / 2
      const enoughWidth = d.x1 - d.x0 > 0.09
      if (enoughWidth && enoughLength) {
        if (nodesOnFocus.length) {
          if (nodesOnFocus.includes(d.data.pathFromRoot)){
            return 1
          } else {
            return opacities.unFocus
          }
        } else {
          return 1
        }
      } else {
        return 0
      }
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

    // measure final width of a breadcrumb, if the name is not a specie/subspecies then 
    // just return the defined width, otherwise measure a new, longer width and return it
    function getBreadcrumbFinalWidth (d) {
      let finalWidth = breadcrumbParams.width
      // if the name is a species/subspecies then it should have a gap 
      let name
      if (typeof(d) != "string" && d.data.pathFromRoot.split(" ").length > 1) {
        name = d.data.pathFromRoot.slice(d.data.pathFromRoot.lastIndexOf(",")+1)
        finalWidth = 2 * breadcrumbParams.gap + getTextWidth(name, breadcrumbParams.fontSize)
      } else if (typeof(d) == "string" && d.split(" ").length > 1) {
        name = d.slice(d.lastIndexOf(",")+1)
        finalWidth = 2 * breadcrumbParams.gap + getTextWidth(name, breadcrumbParams.fontSize)
      }
      return finalWidth
    }

    function makeBreadcrumb (breadcrumb, pathList) {

      breadcrumb
        .selectAll("polygon")
        .data(pathList)
        .join("polygon")
        .attr("points", breadcrumbPoints)
        .attr("fill",d => typeof(d) == "string" ? "black" : d.data.color)
        .attr("transform", (d, i) => {
          return `translate(${i * (breadcrumbParams.width + breadcrumbParams.gap)},0)`
        })
        .on("click", (e,d) => {
          const text = typeof(d) == "string" ? d : d.data.pathFromRoot
          setSearchName(text)
        })
        .attr("cursor","pointer")
      
      breadcrumb
        .selectAll("text")
        .data(pathList)
        .join("text")
        .attr("x", d => getBreadcrumbFinalWidth(d) / 2)
        .attr("transform", (d, i) => i || typeof(d) != "string"? 
          `translate(${i * (breadcrumbParams.width + breadcrumbParams.gap) + breadcrumbParams.tipWidth},0)` :
          `translate(0,0)`)
        .attr("y", breadcrumbParams.height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline","middle")
        .attr("fill", d => typeof(d) == "string" ? "white" : "black")
        .attr("fill-opacity", 1)
        .attr("font-size",breadcrumbParams.fontSize)
        .attr("font-weight", 800)
        .text(d => {
          let name
          if (typeof(d) == "string") {
            name = d
          } else {
            const fullName = d.data.pathFromRoot.slice(d.data.pathFromRoot.lastIndexOf(",") + 1)
            const nameList = fullName.split(" ")
            if (nameList.length === 1) return nameList[0] 
            else if (nameList.length === 2) name = nameList[0].charAt(0).toUpperCase() + ". " + nameList[1]
            else if(nameList.length === 3) name = nameList[0].charAt(0).toUpperCase() + ". " + nameList[1] + nameList[2]

            
          }
          return name 
        })
        .on("click", (e,d) => {
          setSearchName(typeof(d) == "string" ? d : d.data.pathFromRoot)
        })
        .attr("cursor","pointer")
    }


    function breadcrumbPoints (d, i) {
      const points = []
      const finalWidth = getBreadcrumbFinalWidth (d)
      points.push("0,0")
      points.push(finalWidth + ",0")
      points.push(finalWidth + breadcrumbParams.tipWidth + "," + (breadcrumbParams.height / 2))
      points.push(finalWidth + "," + breadcrumbParams.height)
      points.push(finalWidth + "," + breadcrumbParams.height)
      points.push("0," + breadcrumbParams.height)
      if (i || typeof(d) != "string") {
        points.push(breadcrumbParams.tipWidth, "," + (breadcrumbParams.height / 2))
      }
      return points.join(" ")
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

  },[searchName, currentTree, nodesOnFocus])
  return (
    <svg ref={ref} style={{
      width: "100%",
      background: "white",
      margin: "0px",
    }}></svg>
  );
}

// // adapted from https://bl.ocks.org/swkasica/6c2b7784ec654b999397b8bc29b84c08
// export default function TreeGraph({ data }) {
//     const {setSearchId, setWikiRefRange} = useContext(GlobalStateContext)
//     const ref = useRef(null);
//     useEffect(() => {
//       const sideLength = 380;
//       const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  
//       const svg = d3.select(ref.current).
//                       attr("height", sideLength).
//                       attr("width", sideLength),
//         radius = 100,
//         g = svg
//           .append("g")
//           .attr(
//             "transform",
//             "translate(" + (sideLength / 2 + 30) + "," + (sideLength / 2 - 10) + ")"
//           );
  
//       // var stratify = d3.stratify()
//       //     .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });
  
//       const tree = d3
//         .tree()
//         .size([2 * Math.PI, radius])
//         .separation(function (a, b) {
//           return (a.parent == b.parent ? 1 : 2) / a.depth;
//         });
  
//       const root = tree(d3.hierarchy(data));
//       // root.children.forEach(collapse);
  
//       // build a color palete for the outmost children
//       const wikiRefRange = root.descendants().filter(node => node.data.children.length === 0).map(node => node.data.id)
//       setWikiRefRange(wikiRefRange)
//       const colors = d3.scaleOrdinal().domain(wikiRefRange).range(["#800000","#191970","#006400","#9acd32","#ff0000","#ff8c00","#ffd700","#00ff00","#ba55d3","#00fa9a","#00ffff","#0000ff","#ff00ff","#1e90ff","#fa8072","#dda0dd"])
  
//       const link = g
//         .selectAll(".link")
//         .data(root.links())
//         .enter()
//         .append("path")
//         .attr("class", "link")
//         .attr(
//           "d",
//           d3
//             .linkRadial()
//             .angle(function (d) {
//               return d.x;
//             })
//             .radius(function (d) {
//               return d.y;
//             })
//         );
  
//       const node = g
//         .selectAll(".node")
//         .data(root.descendants())
//         .enter()
//         .append("g")
//         .attr("class", function (d) {
//           return "node" + (d.children ? " node--internal" : " node--leaf");
//         })
//         .attr("transform", function (d) {
//           return "translate(" + radialPoint(d.x, d.y) + ")";
//         })
//         .on("mouseover", function (e,d) {
//           d3.select(this).classed("active", true);
//           d3.select(this).select("circle").attr("r",5)
//           if (!(d.depth === 0 || d.data.children.length === 0)){
            
//             d3.select(this).append("title").text(d.data.name)
//           }
//         })
//         .on("mouseout", function (e,d) {
//           d3.select(this).classed("active", false);
//           d3.select(this).select("circle").attr("r", d => d.depth ? 2.5 : 4.5)
//         })
//         .on("click", function (e, d) {
//           // var svg = d3.select(ref.current);
//           // svg.remove("g")
//           // setData(exampleData);
//           //console.log(d.data)
//           //d3.select(ref.current).remove();
//           setSearchId(d.data.id);
//         });
      
//       node.append("circle")
//         .attr("r", (d) => {
//           return d.depth ? 2.5 : 4.5
//         })
//         //.on("mouseover", handleMouseOver);
      
      
//       // node.append("image")
//       //     .attr("x", -6)
//       //     .attr("y", -6)
//       //     .attr("width", 20)
//       //     .attr("height", 20)
//       //     .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
//       //     .attr("href", function(d) { return d.children ? "images/folder.png" : "images/file.png" });
  
//       node
//         .append("text")
//         .attr("dy", "0.31em")
//         .attr("x", function (d) {
//           return d.x < Math.PI === !d.children ? 6 : -6;
//         })
//         .attr("text-anchor", function (d) {
//           return d.x < Math.PI === !d.children ? "start" : "end";
//         })
//         .attr("transform", function (d) {
//           return (
//             "rotate(" +
//             ((d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180) /
//               Math.PI +
//             ")"
//           );
//         })
//         .text(function (d) {
//           return d.depth === 0 || d.data.children.length === 0 ? d.data.name : null
//         })
//         .style("fill", function (d) {
//           return wikiRefRange.includes(d.data.id) ? colors(d.data.id) : "black" 
//         })
  
//         // .on("mouseover", (e,d) => {
//         //   if (!(d.depth === 0 || d.depth === searchDepth - 1)){
//         //     return this.text
//         //   }
//         // });
  
//       function radialPoint(x, y) {
//         return [(y = +y) * Math.cos((x -= Math.PI / 2)), y * Math.sin(x)];
//       }
//     }, [data]);
  
//     return (
//       <svg
//         ref={ref}
//         style={{
//           width: "100%",
//           margin: "0px",
//         }}
//       ></svg>
//     );
//   }
  

// Sontrop's implementation: https://bl.ocks.org/FrissAnalytics/974dc299c5bc79cc5fd7ee9fa1b0b366
// Bostock's implementation: https://observablehq.com/@d3/radial-tidy-tree?collection=@d3/d3-hierarchy