self["webpackHotUpdatetest"]("main",{

/***/ "./src/components/Tree.tsx":
/*!*********************************!*\
  !*** ./src/components/Tree.tsx ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
var _dataset_wikidata_dangling_trees_Q100582257_json__WEBPACK_IMPORTED_MODULE_2___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Tree)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var _Tree_module_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Tree.module.css */ "./src/components/Tree.module.css");
/* harmony import */ var _dataset_wikidata_dangling_trees_Q100582257_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../dataset/wikidata/dangling_trees/Q100582257.json */ "../../dataset/wikidata/dangling_trees/Q100582257.json");



function Tree() {
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: _Tree_module_css__WEBPACK_IMPORTED_MODULE_1__.default.tree },
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h1", null, "This is tree."),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", null, /*#__PURE__*/ (_dataset_wikidata_dangling_trees_Q100582257_json__WEBPACK_IMPORTED_MODULE_2___namespace_cache || (_dataset_wikidata_dangling_trees_Q100582257_json__WEBPACK_IMPORTED_MODULE_2___namespace_cache = __webpack_require__.t(_dataset_wikidata_dangling_trees_Q100582257_json__WEBPACK_IMPORTED_MODULE_2__, 2))))));
}


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ /* webpack/runtime/create fake namespace object */
/******/ (() => {
/******/ 	var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 	var leafPrototypes;
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 16: return value when it's Promise-like
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = this(value);
/******/ 		if(mode & 8) return value;
/******/ 		if(typeof value === 'object' && value) {
/******/ 			if((mode & 4) && value.__esModule) return value;
/******/ 			if((mode & 16) && typeof value.then === 'function') return value;
/******/ 		}
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		var def = {};
/******/ 		leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 		for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 			Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 		}
/******/ 		def['default'] = () => (value);
/******/ 		__webpack_require__.d(ns, def);
/******/ 		return ns;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("5c2c88edc081684724f7")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=main.5e7d426dcdcf1b2a56af.hot-update.js.map