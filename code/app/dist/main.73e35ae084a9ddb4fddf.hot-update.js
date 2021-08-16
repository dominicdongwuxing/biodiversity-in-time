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


//import myTree from "../../../../dataset/wikidata/dangling_trees/Q5226073.json"
const myTree = __webpack_require__(/*! ../../../../dataset/wikidata/dangling_trees/Q5226073.json */ "../../dataset/wikidata/dangling_trees/Q5226073.json");
function Tree() {
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _Tree_module_css__WEBPACK_IMPORTED_MODULE_1__.default.tree },
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h1", null, "This is tree."),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, JSON.stringify(myTree))));
}


/***/ }),

/***/ "../../dataset/wikidata/dangling_trees/Q5226073.json":
/*!***********************************************************!*\
  !*** ../../dataset/wikidata/dangling_trees/Q5226073.json ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"","rank":"","id":"Q5226073","children":[{"name":"Lepidodes limbulata","rank":"Q7432","id":"Q13391494"}]}');

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("56c740030e2ec0bd6675")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.73e35ae084a9ddb4fddf.hot-update.js.map