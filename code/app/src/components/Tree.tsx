import React, { useEffect, useState, useRef } from "react";
import styles from "./Tree.module.css";
import * as d3 from "d3";
import { useQuery, gql } from "@apollo/client";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Container
} from "@mui/material";
import { useTreeStyles } from "./TreeStyles";
import { color } from "@mui/system";

const TREE_QUERY = gql`
  query retrieveTreeFromWikiNameOrIdWithMya(
    $name: String
    $maxElement: Int
    $depth: Int
    $id: String
    $minma: Float
    $maxma: Float
  ) {
    getTreeFromWikiNameOrIdWithMya(
      name: $name
      maxElement: $maxElement
      depth: $depth
      id: $id
      minma: $minma
      maxma: $maxma
    ) {
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
`;
// adapted from https://bl.ocks.org/swkasica/6c2b7784ec654b999397b8bc29b84c08
function RadialTreeKasica({ data, onClick, setWikiRefRange}) {
  const ref = useRef();
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
        onClick(d.data.id);
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

function Test() {
  const ref = useRef();
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg
      .append("g")
      .append("rect")
      .attr("x", 20)
      .attr("y", 20)
      .attr("width", 60)
      .attr("height", 30)
      .attr("fill", "green")
      .attr("transform", "translate(0, 60)");
  }, []);
  return <svg ref={ref} style={{ border: "2px solid gold" }}></svg>;
}

const BackToPrevious = ({ data, searchDepth, handleBackToPrevious }) => {
  if (data) {
    const path = data.pathFromRootByName.split(",").slice(1);
    if (path.length > searchDepth) {
      return (
        <Button
          style={{margin: "5px"}}
          variant="contained"
          size="small"
          onClick={handleBackToPrevious}
          color="secondary"
        >
          Back to {path[path.length - searchDepth]}
        </Button>
      );
    }
  }
  return null;
};

export default function Tree({ props }) {
  // note: I didn't use cache!!!

  const makeOptions = (valueArr) => {
    const optionArr = [];
    for (const value of valueArr) {
      optionArr.push(
        <MenuItem value={value} key={value}>
          {value}
        </MenuItem>
      );
    }
    return optionArr;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    props.setSearchName(searchNameBuffer);
    props.setSearchId("");
  };

  const handleBackToTop = () => {
    props.setSearchId("Q2382443");
  };

  const handleClick = (id) => {
    props.setSearchId(id);
  };

  const handleBackToPrevious = () => {
    if (data) {
      const path = data.getTreeFromWikiNameOrIdWithMya.pathFromRootById
        .split(",")
        .slice(1);
      if (path.length < searchDepth) {
        props.setSearchId("Q2382443");
      } else {
        props.setSearchId(path[path.length - searchDepth]);
      }
    }
  };

  // const usePrevious = (value) => {
  //   const ref = useRef()
  //   useEffect(() => {
  //     if (data) {
  //       ref.current = value
  //     }
  //   })
  //   return ref.current
  // }

  const [searchNameBuffer, setSearchNameBuffer] = useState("");
  // const [searchName, setSearchName] = useState("");
  // const [searchId, setSearchId] = useState("Q2382443");
  const [searchDepth, setSearchDepth] = useState(3);
  const [searchMaxElement, setSearchMaxElement] = useState(7);

  const { data } = useQuery(TREE_QUERY, {
    variables: {
      name: props.searchName,
      maxElement: searchMaxElement,
      depth: searchDepth,
      id: props.searchId,
      maxma: props.myaRange[0],
      minma: props.myaRange[1],
    },
    fetchPolicy: "no-cache",
  });

  // useEffect(() => {
  //   console.log(data)
  // }, [data])

  return (
    <div className={styles.tree}>

      <form onSubmit={handleSubmit}>
        <TextField
          variant="filled"
          value={searchNameBuffer}
          size="small"
          label="Try a taxon name"
          onChange={(event) => {
            setSearchNameBuffer(event.target.value);
          }}
        />

        <Button
          className={useTreeStyles().root}
          size="small"
          variant="contained"
          type="submit"
          color="primary"
        >
          Search Root
        </Button>


      </form>

      {data ? (
        <RadialTreeKasica
          data={data.getTreeFromWikiNameOrIdWithMya}
          onClick={handleClick}
          setWikiRefRange={props.setWikiRefRange}
        />
      ) : "This taxon doesn't exist in the time period, pleast try a new search :)"}
      <br></br>
      
        <FormControl>
          <Select
            style={{margin: "5px"}}
            value={searchMaxElement}
            size="small"
            onChange={(event) => {
              setSearchMaxElement(event.target.value as number);
            }}
          >
            {makeOptions(Array.from({ length: 20 }, (_, i) => i + 1))}
          </Select>
          <FormHelperText>max item</FormHelperText>
        </FormControl>

        <FormControl>
          <Select
            style={{margin: "5px"}}
            value={searchDepth}
            size="small"
            onChange={(event) => {
              setSearchDepth(event.target.value as number);
            }}
          >
            {makeOptions(Array.from({ length: 5 }, (_, i) => i + 1))}
          </Select>
          <FormHelperText>depth</FormHelperText>
        </FormControl>
      

      {data && data.getTreeFromWikiNameOrIdWithMya.name !== "Biota" ? (
        <Button 
          style={{margin: "5px"}}
          variant="contained" 
          size="small" 
          onClick={handleBackToTop} 
          color="secondary">
          Back to top
        </Button>
      ) : null}
      {data ? (
        <BackToPrevious
          data={data.getTreeFromWikiNameOrIdWithMya}
          handleBackToPrevious={handleBackToPrevious}
          searchDepth={searchDepth}
        />
      ) : null}
    </div>
  );
}
