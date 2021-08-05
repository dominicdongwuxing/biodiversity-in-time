self["webpackHotUpdatetest"]("main",{

/***/ "./src/components/Tree.tsx":
/*!*********************************!*\
  !*** ./src/components/Tree.tsx ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Tree)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var _Tree_module_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Tree.module.css */ "./src/components/Tree.module.css");
/* harmony import */ var _dataset_wikidata_processed_dangling_trees_Q72288_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../dataset/wikidata/processed/dangling_trees/Q72288.json */ "../../dataset/wikidata/processed/dangling_trees/Q72288.json");
/* harmony import */ var _hooks_useD3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useD3 */ "./src/hooks/useD3.tsx");
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! d3 */ "./node_modules/d3/src/index.js");





function BarChart({ data }) {
    const ref = (0,_hooks_useD3__WEBPACK_IMPORTED_MODULE_3__.useD3)((svg) => {
        const height = 500;
        const width = 500;
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const x = d3__WEBPACK_IMPORTED_MODULE_4__.scaleBand()
            .domain(data.map((d) => d.year))
            .rangeRound([margin.left, width - margin.right])
            .padding(0.1);
        const y1 = d3__WEBPACK_IMPORTED_MODULE_4__.scaleLinear()
            .domain([0, d3__WEBPACK_IMPORTED_MODULE_4__.max(data, (d) => d.sales)])
            .rangeRound([height - margin.bottom, margin.top]);
        const xAxis = (g) => g.attr("transform", `translate(0,${height - margin.bottom})`).call(d3__WEBPACK_IMPORTED_MODULE_4__.axisBottom(x)
            .tickValues(d3__WEBPACK_IMPORTED_MODULE_4__.ticks(...d3__WEBPACK_IMPORTED_MODULE_4__.extent(x.domain()), width / 40)
            .filter((v) => x(v) !== undefined))
            .tickSizeOuter(0));
        const y1Axis = (g) => g
            .attr("transform", `translate(${margin.left},0)`)
            .style("color", "steelblue")
            .call(d3__WEBPACK_IMPORTED_MODULE_4__.axisLeft(y1).ticks(null, "s"))
            .call((g) => g.select(".domain").remove())
            .call((g) => g
            .append("text")
            .attr("x", -margin.left)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(data.y1));
        svg.select(".x-axis").call(xAxis);
        svg.select(".y-axis").call(y1Axis);
        svg
            .select(".plot-area")
            .attr("fill", "steelblue")
            .selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d.year))
            .attr("width", x.bandwidth())
            .attr("y", (d) => y1(d.sales))
            .attr("height", (d) => y1(0) - y1(d.sales));
    }, [data.length]);
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", { ref: ref, style: {
            height: 500,
            width: "100%",
            marginRight: "0px",
            marginLeft: "0px",
        } },
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", { className: "plot-area" }),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", { className: "x-axis" }),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", { className: "y-axis" })));
}
const data = [
    { year: 1980, efficiency: 24.3, sales: 8949000 },
    { year: 1985, efficiency: 27.6, sales: 10979000 },
    { year: 1990, efficiency: 28, sales: 9303000 },
    { year: 1991, efficiency: 28.4, sales: 8185000 },
    { year: 1992, efficiency: 27.9, sales: 8213000 },
    { year: 1993, efficiency: 28.4, sales: 8518000 },
    { year: 1994, efficiency: 28.3, sales: 8991000 },
    { year: 1995, efficiency: 28.6, sales: 8620000 },
    { year: 1996, efficiency: 28.5, sales: 8479000 },
    { year: 1997, efficiency: 28.7, sales: 8217000 },
    { year: 1998, efficiency: 28.8, sales: 8085000 },
    { year: 1999, efficiency: 28.3, sales: 8638000 },
    { year: 2000, efficiency: 28.5, sales: 8778000 },
    { year: 2001, efficiency: 28.8, sales: 8352000 },
    { year: 2002, efficiency: 29, sales: 8042000 },
    { year: 2003, efficiency: 29.5, sales: 7556000 },
    { year: 2004, efficiency: 29.5, sales: 7483000 },
    { year: 2005, efficiency: 30.3, sales: 7660000 },
    { year: 2006, efficiency: 30.1, sales: 7762000 },
    { year: 2007, efficiency: 31.2, sales: 7562000 },
    { year: 2008, efficiency: 31.5, sales: 6769000 },
    { year: 2009, efficiency: 32.9, sales: 5402000 },
    { year: 2010, efficiency: 33.9, sales: 5636000 },
    { year: 2011, efficiency: 33.1, sales: 6093000 },
    { year: 2012, efficiency: 35.3, sales: 7245000 },
    { year: 2013, efficiency: 36.4, sales: 7586000 },
    { year: 2014, efficiency: 36.5, sales: 7708000 },
    { year: 2015, efficiency: 37.2, sales: 7517000 },
    { year: 2016, efficiency: 37.7, sales: 6873000 },
    { year: 2017, efficiency: 39.4, sales: 6081000 },
];
function Tree() {
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _Tree_module_css__WEBPACK_IMPORTED_MODULE_1__.default.tree },
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h1", null, "This is tree."),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, JSON.stringify(_dataset_wikidata_processed_dangling_trees_Q72288_json__WEBPACK_IMPORTED_MODULE_2__)),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement(BarChart, { data: data }))));
}


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("813c31cd2dfeb9c34cb1")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.767f77fe9ba24d095067.hot-update.js.map