import React, {useState, useEffect, useRef, useContext} from "react"
import * as d3 from "d3"
import { GlobalStateContext } from "./GlobalStateContext";


export default function TreeGraph({ data, pathFromRoot }) {
  const { setSearchName, searchName, flatTree, setFlatTree, nodesOnFocus, setNodesOnFocus } = useContext(GlobalStateContext)
  const ref = useRef(null)
  useEffect(() => {

    const {height, width, margins, radius, backgroundColor, fontSize, breadcrumbParams} = {
      height: 380,
      width: 350,
      margins: { top: 20, right: 30, bottom: 30, left: 40 },
      radius: 100,
      backgroundColor: "white",
      fontSize: "0.5em",
      breadcrumbParams: {width: 55, tipWidth: 10, height: 20, padding: 5, gap: 2, fontSize: "0.5em"}
    };

    const partitionLayout = d3.partition().size([2*Math.PI, radius])

    const arcGenerator = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)
    
    const root = d3.stratify()
      .id(d => d.uniqueName)
      .parentId(d => d.parent)
      (data);

    // when doing the roll up, note that if the node is a leaf of the to-be-visualized tree,
    // then use the total count,
    // i.e, all fossil count on this node and below (if it has children but just not shown)
    // but when it is a node, then use the fossil count identified to this node
    // to avoid double counting!
    root.sum(d => d.leaf ? d.count : d.fossilCountIdentifiedToName)

    partitionLayout(root)
    console.log(root)
    const svg = d3.select(ref.current)
      .attr("width", width)
      .attr("height", height)
      //.attr("viewBox", [0, 0, width, width])
    
   
    let colors = ["red","green","yellow","brown","cyan"]
    const firstColor = colors[0]
    const lastColor = colors[colors.length - 1]
    let focusedNodesFromMap = []
    root.each((d) => {
      if (nodesOnFocus.includes(d.data.uniqueName)){
        const ancestors = d.ancestors().map(i => i.data.uniqueName)
        ancestors.forEach(ancestor => {
          if (!focusedNodesFromMap.includes(ancestor)){
            focusedNodesFromMap.push(ancestor)
          }
        })
      }
      // only assign color when d is not the root
      if (d.depth) {
        // if there are still colors left, then pick one to assign to the node
        // and remove this color from the color list
        if (colors.length) {
          const currentColor = colors[0]
          d.color = currentColor
          const nodeInFlatTree = flatTree.find(item => item.uniqueName === d.data.uniqueName)
          if (nodeInFlatTree) nodeInFlatTree.color = currentColor
          colors = colors.splice(1)
        } else { // if no color is left then find the color of its parent
          // but if the parent has no color assgined yet (in case it is depth 1 and colors 
          // are used up) then just use the last color 
          const currentColor = d.ancestors()[1].color || lastColor
          d.color = currentColor 
          const nodeInFlatTree = flatTree.find(item => item.uniqueName === d.data.uniqueName)
          if (nodeInFlatTree) nodeInFlatTree.color = currentColor
        }
      } else {
        // assign blackcolor to points at root
        const nodeInFlatTree = flatTree.find(item => item.uniqueName === d.data.uniqueName)
        if (nodeInFlatTree) nodeInFlatTree.color = "black"
      }
    })

    // renew the flatTree after adding the colors
    setFlatTree(flatTree)

    //


    // make a trail of breadcrumbs from Eukaryota to the current root
    const breadcrumbUpstream = svg
      .append("g")
      .attr("transform", `translate(0,${breadcrumbParams.gap})`)
    makeBreadcrumb (breadcrumbUpstream, pathFromRoot.split(","))
    

    
    // make a trail of breadcrumbs from current root to the item on hover
    const breadcrumbDownstream = svg
      .append("g")
      .attr("transform", `translate(0,${breadcrumbParams.height + breadcrumbParams.gap * 2})`)

    const arc = svg
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`)

    const path = arc
      .selectAll("path")
      .data(root.descendants())
      .join("path")
      .attr("d", arcGenerator)
      .attr("id", d => d.data.uniqueName)
      .attr("fill", d => {
        if (d.depth == 0) return backgroundColor
        return d.color
      })
      .attr("opacity", d => focusedNodesFromMap.includes(d.data.uniqueName) ? 1 : 0.6 )
      .attr("stroke","black")
      .attr("cursor", "pointer")
      .attr("stroke-width", 0.5)
      .on("click", (e, d) => {
        //d3.select(ref.current).remove("g")

        setSearchName(d.data.uniqueName)})

    path
      .on("mouseover", (e, focus) => {
        const ancestorsDescending = focus.ancestors().reverse()
        setNodesOnFocus([focus.data.uniqueName])
        path
          .attr("opacity", (d) => {
            return ancestorsDescending.includes(d) ? 1 : 0.6
          })
        makeBreadcrumb (breadcrumbDownstream, ancestorsDescending.slice(1))
      })
      .on("mouseout", () => {
        setNodesOnFocus([""])
        path
          .attr("opacity", 0.6)
        makeBreadcrumb (breadcrumbDownstream, [])
      })
      .exit().remove()
    
    path
      .append("title")
      .text(d => {
        // in case the unique name is a long name (pathFromRoot) due to repetition
        // break the potential long name in a list and just show the last name
        // i.e., the name on the lowest level
        const nameList = d.data.uniqueName.split(",")
        return nameList[nameList.length - 1]
      })
    
  
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
      .text(d => d.data.uniqueName);
      
    function labelVisible(d) {
      
      const enoughLength = getTextWidth(d.data.uniqueName, fontSize) + d.y1 < width / 2
      const enoughWidth = d.x1 - d.x0 > 0.05
      return enoughWidth && enoughLength ? 1 : 0
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
      if (typeof(d) != "string" && d.data.uniqueName.split(" ").length > 1) {
        name = d.data.uniqueName.slice(d.data.uniqueName.lastIndexOf(",")+1)
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
        .attr("fill",d => typeof(d) == "string" ? "black" : d.color)
        .attr("transform", (d, i) => {
          return `translate(${i * (breadcrumbParams.width + breadcrumbParams.gap)},0)`
        })
        .on("click", (e,d) => {
          const text = typeof(d) == "string" ? d : d.data.uniqueName
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
        .text(d => typeof(d) == "string" ? d : d.data.uniqueName.slice(d.data.uniqueName.lastIndexOf(",") + 1))
        .on("click", (e,d) => {
          setSearchName(typeof(d) == "string" ? d : d.data.uniqueName)
        })
        .attr("cursor","pointer")

        breadcrumb.exit().remove()
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
      console.log(x)
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

  },[data, searchName, flatTree])
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