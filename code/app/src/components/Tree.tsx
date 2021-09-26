import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import styles from "./Tree.module.css";
import * as d3 from "d3";
import { useQuery, gql, InMemoryCache } from "@apollo/client";

// import { TreeByMya,TREE_QUERY } from "./getData";
// import filePng from "../images/file.png";
// import folderPng from "../images/folder.png";
// import flare2 from "../../flare-2.json"
// import trueData from "../../constructedTree.json";

const TREE_QUERY = gql `
    query retrieveTreeFromWikiNameOrIdWithMya ($name: String, $maxElement: Int, $depth: Int, $id: String, $minma: Float, $maxma: Float) {
        getTreeFromWikiNameOrIdWithMya (name: $name, maxElement: $maxElement, depth: $depth, id: $id, minma: $minma, maxma: $maxma) {
            name
            id
            rank
            count
            pathFromRootByName
            pathFromRootById
            children {
                name
                id
                rank
                count
                children {
                    name
                    id
                    rank
                    count
                    children {
                        name
                        id
                        rank
                        count
                        children {
                            name
                            id
                            rank
                            count
                            children {
                                name
                                id
                                rank
                                count
                                children {
                                    name
                                    id
                                    rank
                                    count
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`


const exampleData = {
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
function RadialTreeKasica ({ data, onClick }) {
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
      //data.children.forEach(child => child.children.forEach(grandchild => grandchild.children.forEach(collapse)))
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
          // var svg = d3.select(ref.current);
          // svg.remove("g")
          // setData(exampleData);
          //console.log(d.data)
          //d3.select(ref.current).remove();
          onClick(d.data.id)
          
          
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
        height: 600,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    >

    </svg>
  )
}


// Sontrop's implementation: https://bl.ocks.org/FrissAnalytics/974dc299c5bc79cc5fd7ee9fa1b0b366 

// Bostock's implementation: https://observablehq.com/@d3/radial-tidy-tree?collection=@d3/d3-hierarchy

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

const BackToPrevious = ({data, searchDepth, handleBackToPrevious}) => {
  if (data) {
    const path = data.pathFromRootByName.split(",").slice(1)
    if (path.length > searchDepth) {
      return (
        <button onClick={handleBackToPrevious}>Back to {path[path.length - searchDepth]} </button>
      )
    }
  } 
  return null
}

export default function Tree({ props }) {
  // note: I didn't use cache!!!


  // const fileImage = filePng
  // const folderImage = folderPng

  const handleSubmit = (event) => {
    event.preventDefault()
    setSearchName(searchNameBuffer)
    setSearchId("")
  }

  const handleBackToTop = () => {
    setSearchId("Q2382443")
  }

  const handleClick = (id) => {
    setSearchId(id)
  }

  const handleBackToPrevious = () => {
    if (data) {
      const path = data.getTreeFromWikiNameOrId.pathFromRootById.split(",").slice(1)
      if (path.length < searchDepth) {
        setSearchId("Q2382443")
      } else {
        setSearchId(path[path.length - searchDepth])
      }
      
    }
  }

  

  // const usePrevious = (value) => {
  //   const ref = useRef()
  //   useEffect(() => {
  //     if (data) {
  //       ref.current = value
  //     }
  //   })
  //   return ref.current
  // }
  
  const [searchNameBuffer, setSearchNameBuffer] = useState("")
  const [searchName, setSearchName] = useState("")
  const [searchId, setSearchId] = useState("Q2382443")
  // const prevSearchName = usePrevious(searchName)
  const [searchDepth, setSearchDepth] = useState(3)
  const [searchMaxElement, setSearchMaxElement] = useState(7)
  
  const { data } = useQuery(TREE_QUERY, 
    {variables: { name: searchName, maxElement: searchMaxElement, depth: searchDepth, id: searchId, minma: props.mya-props.lowerMya, maxma: props.mya+props.higherMya},
    fetchPolicy: "no-cache"
  });

    
  // useEffect(() => {
  //   console.log(data)
  // }, [data])

  return (
    <div className={styles.tree}>
      <h1>This is tree.</h1>

      <form onSubmit={handleSubmit}>
        <label>
          New root name: 
          <input value={searchNameBuffer} onChange = {(event) => {setSearchNameBuffer(event.target.value)}}></input>
        </label>
        <input type="submit" value="Search Root" />
      

        <br></br>
        <label>
          Max number of elements to show for each level (sorted by number of fossil count in descending order):
          <select value={searchMaxElement} onChange = {(event) => {
            setSearchMaxElement(parseInt(event.target.value))
            }} >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
            <option value={13}>13</option>
            <option value={14}>14</option>
            <option value={15}>15</option>
            <option value={16}>16</option>
            <option value={17}>17</option>
            <option value={18}>18</option>
            <option value={19}>19</option>
            <option value={20}>20</option>
          </select>
        </label>

        <br></br>

        <label>
          Number of taxon levels to retrieve from the new root:
          <select value={searchDepth} onChange = {(event) => {
            setSearchDepth(parseInt(event.target.value))
            }} >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
          </select>
        </label>



      </form>
       
      {data ? <RadialTreeKasica data={data.getTreeFromWikiNameOrIdWithMya} onClick={handleClick}/>:"Try a new search :)"}

      {(data && data.getTreeFromWikiNameOrIdWithMya.name !== "Biota")? <button onClick={handleBackToTop} >Back to top</button> : null}

      
        
      {data ? <BackToPrevious data = {data.getTreeFromWikiNameOrIdWithMya} handleBackToPrevious = {handleBackToPrevious} searchDepth = {searchDepth} /> : null}
    </div>
  );
}
// 
// <div>{JSON.stringify(constructedTree)}</div>
// <div><BarChart data={data} /></div>
// <RadialTree data={data}/>
// <img src={sampleImage}></img>

// {(data && data.getTreeFromWikiNameOrId.pathFromRootById.split(",").slice(1).length > searchDepth) ? <button onClick={handleBackToPrevious}>Back to {data.getTreeFromWikiNameOrId.pathFromRootByName.split(",").slice(2,3)} </button>  : "nothing"} 