/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./webpack.config.js":
/*!***************************!*\
  !*** ./webpack.config.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("var __dirname = \"/\";\nconst path = __webpack_require__(Object(function webpackMissingModule() { var e = new Error(\"Cannot find module 'path'\"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));\r\n\r\nmodule.exports = {\r\n  entry: './src/scene.ts',\r\n  mode:\"development\",\r\n  module: {\r\n    rules: [\r\n      {\r\n        test: /\\.tsx?$/,\r\n        use: 'ts-loader',\r\n        exclude: /node_modules/,\r\n      },\r\n    ],\r\n  },\r\n  resolve: {\r\n    extensions: ['.tsx', '.ts', '.js'],\r\n  },\r\n  output: {\r\n    filename: 'bundle.js',\r\n    path: path.resolve(__dirname, 'dist'),\r\n  },\r\n};\n\n//# sourceURL=webpack://interactive-em/./webpack.config.js?");

/***/ }),

/***/ "./src/base.ts":
/*!*********************!*\
  !*** ./src/base.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Object)\n/* harmony export */ });\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vector */ \"./src/vector.ts\");\n\r\nclass Object {\r\n    constructor(mass, position, rotation = 0) {\r\n        this.render = (ctx) => {\r\n        };\r\n        this.voltageAt = (pos) => {\r\n            return 0;\r\n        };\r\n        this.fieldAt = (pos) => {\r\n            return _vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"].origin();\r\n        };\r\n        this.momentOfInertia = () => {\r\n            return 0;\r\n        };\r\n        this.incrementPosition = (dt) => {\r\n            this.position.x += this.velocity.x * dt;\r\n            this.position.y += this.velocity.y * dt;\r\n        };\r\n        this.physics = (dt, force, torque) => {\r\n            this.incrementPosition(dt);\r\n            this.velocity.add(_vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"].multiply(force, dt / this.mass));\r\n        };\r\n        this.velocity = new _vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\r\n        this.position = position;\r\n        this.mass = mass;\r\n        this.rotation = rotation;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://interactive-em/./src/base.ts?");

/***/ }),

/***/ "./src/charges/finite_line.ts":
/*!************************************!*\
  !*** ./src/charges/finite_line.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FiniteLine)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vector */ \"./src/vector.ts\");\n\r\n\r\nclass FiniteLine extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\r\n    constructor(chargeDensity, mass, position, rotation, length) {\r\n        super(mass, position, rotation);\r\n        this.render = (ctx) => {\r\n            ctx.strokeStyle = this.chargeDensity > 0 ? \"red\" : (this.chargeDensity == 0 ? \"black\" : \"blue\");\r\n            let halfLen = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(new _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"](Math.cos(this.rotation), Math.sin(this.rotation)), this.length / 2);\r\n            let start = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.position, halfLen);\r\n            let end = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.position, _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(halfLen, -1));\r\n            ctx.lineWidth = this.chargeDensity * 25 / (this.chargeDensity + 3);\r\n            ctx.beginPath();\r\n            ctx.moveTo(start.x * 100, start.y * 100);\r\n            ctx.lineTo(end.x * 100, end.y * 100);\r\n            ctx.stroke();\r\n            ctx.closePath();\r\n        };\r\n        this.chargeDensity = chargeDensity;\r\n        this.length = length;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://interactive-em/./src/charges/finite_line.ts?");

/***/ }),

/***/ "./src/charges/infinite_plane.ts":
/*!***************************************!*\
  !*** ./src/charges/infinite_plane.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ InfinitePlane)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vector */ \"./src/vector.ts\");\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants */ \"./src/constants.ts\");\n\r\n\r\n\r\nclass InfinitePlane extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\r\n    constructor(chargeDensity, mass, position, rotation = 0) {\r\n        super(mass, position, rotation);\r\n        this.fieldAt = (pos) => {\r\n            return _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(this.normal, Math.sign(_vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].dot(this.normal, pos)) * 2 * this.chargeDensity * _constants__WEBPACK_IMPORTED_MODULE_2__[\"default\"].K);\r\n        };\r\n        this.render = (ctx) => {\r\n            ctx.strokeStyle = this.chargeDensity > 0 ? \"red\" : (this.chargeDensity == 0 ? \"black\" : \"blue\");\r\n            ctx.lineWidth = this.chargeDensity * 75 / (this.chargeDensity + 3);\r\n            ctx.beginPath();\r\n            let dir = new _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"](40 * Math.cos(this.rotation), 40 * Math.sin(this.rotation));\r\n            ctx.moveTo((this.position.x + dir.x) * 100, (this.position.y + dir.y) * 100);\r\n            ctx.lineTo((this.position.x - dir.x) * 100, (this.position.y - dir.y) * 100);\r\n            ctx.stroke();\r\n            ctx.closePath();\r\n        };\r\n        this.chargeDensity = chargeDensity;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://interactive-em/./src/charges/infinite_plane.ts?");

/***/ }),

/***/ "./src/charges/point_charge.ts":
/*!*************************************!*\
  !*** ./src/charges/point_charge.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ PointCharge)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vector */ \"./src/vector.ts\");\n/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants */ \"./src/constants.ts\");\n\r\n\r\n\r\nclass PointCharge extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\r\n    constructor(charge, mass, position) {\r\n        super(mass, position);\r\n        this.fieldAt = (pos) => {\r\n            return _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(_vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].inverseSquareField(pos, this.position), _constants__WEBPACK_IMPORTED_MODULE_2__[\"default\"].K * this.charge);\r\n        };\r\n        this.render = (ctx) => {\r\n            ctx.fillStyle = this.charge > 0 ? \"red\" : (this.charge == 0 ? \"black\" : \"blue\");\r\n            ctx.strokeStyle = \"black\";\r\n            ctx.lineWidth = 3;\r\n            ctx.beginPath();\r\n            ctx.arc(this.position.x * 100, this.position.y * 100, this.displayRadius, 0, 2 * Math.PI);\r\n            ctx.fill();\r\n            ctx.stroke();\r\n            ctx.closePath();\r\n            ctx.fillStyle = \"white\";\r\n            ctx.strokeStyle = \"none\";\r\n            ctx.fillText(this.charge.toString() + \"μC\", this.position.x * 100, this.position.y * 100);\r\n        };\r\n        this.feildAt = (pos) => {\r\n            let nVec = pos.unit();\r\n            return 0;\r\n        };\r\n        this.charge = charge;\r\n        this.displayRadius = 40;\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://interactive-em/./src/charges/point_charge.ts?");

/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nconst constants = {\r\n    K: 0.0089875517873681764,\r\n    G: 6.67408e-11,\r\n};\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (constants);\r\n\n\n//# sourceURL=webpack://interactive-em/./src/constants.ts?");

/***/ }),

/***/ "./src/scene.ts":
/*!**********************!*\
  !*** ./src/scene.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Scene)\n/* harmony export */ });\n/* harmony import */ var _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./charges/finite_line */ \"./src/charges/finite_line.ts\");\n/* harmony import */ var _charges_infinite_plane__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./charges/infinite_plane */ \"./src/charges/infinite_plane.ts\");\n/* harmony import */ var _charges_point_charge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./charges/point_charge */ \"./src/charges/point_charge.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vector */ \"./src/vector.ts\");\n\r\n\r\n\r\n\r\nclass Scene {\r\n    constructor(element) {\r\n        this.updateAspectRatio = () => {\r\n            let aspectRatio = window.innerWidth / window.innerHeight;\r\n            this.height = Scene.parameters.viewportHeight * 2;\r\n            this.width = aspectRatio * this.height;\r\n            this.element.width = window.innerWidth;\r\n            this.element.height = window.innerHeight;\r\n            this.context.resetTransform();\r\n            this.context.translate(0.5, 0.5);\r\n            this.context.translate(window.innerWidth / 2, window.innerHeight / 2);\r\n            let scale = window.innerHeight / 2 / Scene.parameters.viewportHeight / 100;\r\n            this.context.scale(scale, scale);\r\n        };\r\n        this.render = () => {\r\n            requestAnimationFrame(this.render);\r\n            this.context.clearRect(-100 * this.width, -100 * this.height, this.width * 200, this.height * 200);\r\n            this.objects.forEach((object) => {\r\n                object.render(this.context);\r\n            });\r\n        };\r\n        this.fieldAt = (pos) => {\r\n            let out = _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"].origin();\r\n            this.objects.forEach((object) => {\r\n                out.add(object.fieldAt(pos));\r\n            });\r\n            return out;\r\n        };\r\n        this.voltageAt = (pos) => {\r\n            let potential = 0;\r\n            this.objects.forEach((object) => {\r\n                potential += object.voltageAt(pos);\r\n            });\r\n            return potential;\r\n        };\r\n        this.forceBetween = (a, b) => {\r\n            if (a instanceof _charges_point_charge__WEBPACK_IMPORTED_MODULE_2__[\"default\"]) {\r\n            }\r\n            return { force: _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"].origin(), torque: 0 };\r\n        };\r\n        this.objects = [];\r\n        this.element = element;\r\n        this.context = element.getContext(\"2d\");\r\n        this.updateAspectRatio();\r\n        this.render();\r\n        this.context.textAlign = \"center\";\r\n        this.context.textBaseline = \"middle\";\r\n        this.context.font = \"bold 30px Lato\";\r\n    }\r\n    physics(dt) {\r\n        this.objects.forEach((object) => {\r\n            object.incrementPosition(dt);\r\n        });\r\n    }\r\n}\r\nScene.parameters = {\r\n    viewportHeight: 10,\r\n    physicsPerSecond: 100,\r\n    timeSpeed: 1,\r\n};\r\nvar scene;\r\ndocument.addEventListener(\"DOMContentLoaded\", () => {\r\n    let canvas = document.getElementById(\"canvas\");\r\n    scene = new Scene(canvas);\r\n    scene.objects.push(new _charges_point_charge__WEBPACK_IMPORTED_MODULE_2__[\"default\"](1, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](0, 0)));\r\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](1, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](-2, 4), 0.1, 4));\r\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](3, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](2, 4), 0.1, 4));\r\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](5, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](4, 4), 0.1, 4));\r\n    scene.objects.push(new _charges_infinite_plane__WEBPACK_IMPORTED_MODULE_1__[\"default\"](5, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](6, -4), -0.4));\r\n});\r\n\n\n//# sourceURL=webpack://interactive-em/./src/scene.ts?");

/***/ }),

/***/ "./src/vector.ts":
/*!***********************!*\
  !*** ./src/vector.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Vector)\n/* harmony export */ });\nclass Vector {\r\n    constructor(x, y) {\r\n        this.isZero = () => {\r\n            return this.x === 0 && this.y === 0;\r\n        };\r\n        this.magnitude = () => {\r\n            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));\r\n        };\r\n        this.unit = () => {\r\n            return Vector.multiply(this, 1 / this.magnitude());\r\n        };\r\n        this.copy = () => {\r\n            return new Vector(this.x, this.y);\r\n        };\r\n        this.add = (v) => {\r\n            this.x += v.x;\r\n            this.y += v.y;\r\n        };\r\n        this.x = x;\r\n        this.y = y;\r\n    }\r\n}\r\nVector.add = (a, b) => {\r\n    return new Vector(a.x + b.x, a.y + b.y);\r\n};\r\nVector.subtract = (a, sub) => {\r\n    return new Vector(a.x - sub.x, a.y - sub.y);\r\n};\r\nVector.multiply = (a, scalar) => {\r\n    return new Vector(a.x * scalar, a.y * scalar);\r\n};\r\nVector.distance = (a, b) => {\r\n    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));\r\n};\r\nVector.dot = (a, b) => {\r\n    return a.x * b.x + a.y * b.y;\r\n};\r\nVector.fromArray = (a) => {\r\n    return new Vector(a[0], a[1]);\r\n};\r\nVector.rHat = (pos, chargePos) => {\r\n    return Vector.subtract(chargePos, pos).unit();\r\n};\r\nVector.inverseSquareField = (pos, ForcePoint) => {\r\n    return Vector.multiply(Vector.rHat(pos, ForcePoint), 1 / Math.pow(Vector.distance(pos, ForcePoint), 2));\r\n};\r\nVector.origin = () => {\r\n    return new Vector(0, 0);\r\n};\r\n;\r\n\n\n//# sourceURL=webpack://interactive-em/./src/vector.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	__webpack_require__("./src/scene.ts");
/******/ 	var __webpack_exports__ = __webpack_require__("./webpack.config.js");
/******/ 	
/******/ })()
;