/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/base.ts":
/*!*********************!*\
  !*** ./src/base.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Object)\n/* harmony export */ });\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vector */ \"./src/vector.ts\");\n\nclass Object {\n    constructor(mass, position) {\n        this.render = (ctx) => {\n        };\n        this.voltageAt = (pos) => {\n            return 0;\n        };\n        this.fieldAt = (pos) => {\n            return _vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"].origin();\n        };\n        this.momentOfInertia = () => {\n            return 0;\n        };\n        this.incrementPosition = (dt) => {\n            this.position.x += this.velocity.x * dt;\n            this.position.y += this.velocity.y * dt;\n        };\n        this.physics = (dt, force, torque) => {\n            this.incrementPosition(dt);\n            this.velocity.add(_vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"].multiply(force, dt / this.mass));\n        };\n        this.velocity = new _vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.position = position;\n        this.mass = mass;\n    }\n}\n\n\n//# sourceURL=webpack://efield_simulator/./src/base.ts?");

/***/ }),

/***/ "./src/charges/finite_line.ts":
/*!************************************!*\
  !*** ./src/charges/finite_line.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FiniteLine)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vector */ \"./src/vector.ts\");\n\n\nclass FiniteLine extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor(chargeDensity, mass, position, rotation, length) {\n        super(mass, position);\n        this.displayThickness = () => {\n            return this.chargeDensity * 20 / (this.chargeDensity + 3);\n        };\n        this.render = (ctx) => {\n            ctx.strokeStyle = this.chargeDensity > 0 ? \"red\" : (this.chargeDensity == 0 ? \"black\" : \"blue\");\n            let halfLen = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(new _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"](Math.cos(this.rotation), Math.sin(this.rotation)), this.length / 2);\n            let start = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.position, halfLen);\n            let end = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.position, _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(halfLen, -1));\n            ctx.lineWidth = this.displayThickness();\n            ctx.beginPath();\n            ctx.moveTo(start.x * 100, start.y * 100);\n            ctx.lineTo(end.x * 100, end.y * 100);\n            ctx.stroke();\n            ctx.closePath();\n        };\n        this.chargeDensity = chargeDensity;\n        this.rotation = rotation;\n        this.length = length;\n    }\n}\n\n\n//# sourceURL=webpack://efield_simulator/./src/charges/finite_line.ts?");

/***/ }),

/***/ "./src/charges/point_charge.ts":
/*!*************************************!*\
  !*** ./src/charges/point_charge.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ PointCharge)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n\nclass PointCharge extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor(charge, mass, position) {\n        super(mass, position);\n        this.render = (ctx) => {\n            ctx.fillStyle = this.charge > 0 ? \"red\" : (this.charge == 0 ? \"black\" : \"blue\");\n            ctx.strokeStyle = \"black\";\n            ctx.lineWidth = 3;\n            ctx.beginPath();\n            ctx.arc(this.position.x * 100, this.position.y * 100, this.displayRadius, 0, 2 * Math.PI);\n            ctx.fill();\n            ctx.stroke();\n            ctx.closePath();\n            ctx.fillStyle = \"white\";\n            ctx.strokeStyle = \"none\";\n            ctx.fillText(this.charge.toString() + \"μC\", this.position.x * 100, this.position.y * 100);\n        };\n        this.feildAt = (pos) => {\n            let nVec = pos.unit();\n            return 0;\n        };\n        this.charge = charge;\n        this.displayRadius = 40;\n    }\n}\n\n\n//# sourceURL=webpack://efield_simulator/./src/charges/point_charge.ts?");

/***/ }),

/***/ "./src/scene.ts":
/*!**********************!*\
  !*** ./src/scene.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Scene)\n/* harmony export */ });\n/* harmony import */ var _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./charges/finite_line */ \"./src/charges/finite_line.ts\");\n/* harmony import */ var _charges_point_charge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./charges/point_charge */ \"./src/charges/point_charge.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vector */ \"./src/vector.ts\");\n\n\n\nclass Scene {\n    constructor(element) {\n        this.updateAspectRatio = () => {\n            let aspectRatio = window.innerWidth / window.innerHeight;\n            this.height = Scene.parameters.viewportHeight * 2;\n            this.width = aspectRatio * this.height;\n            this.element.width = window.innerWidth;\n            this.element.height = window.innerHeight;\n            this.context.resetTransform();\n            this.context.translate(0.5, 0.5);\n            this.context.translate(window.innerWidth / 2, window.innerHeight / 2);\n            let scale = window.innerHeight / 2 / Scene.parameters.viewportHeight / 100;\n            this.context.scale(scale, scale);\n        };\n        this.render = () => {\n            requestAnimationFrame(this.render);\n            this.context.clearRect(-100 * this.width, -100 * this.height, this.width * 200, this.height * 200);\n            this.objects.forEach((object) => {\n                object.render(this.context);\n            });\n        };\n        this.fieldAt = (pos) => {\n            let out = _vector__WEBPACK_IMPORTED_MODULE_2__[\"default\"].origin();\n            this.objects.forEach((object) => {\n                out.add(object.fieldAt(pos));\n            });\n            return out;\n        };\n        this.voltageAt = (pos) => {\n            let potential = 0;\n            this.objects.forEach((object) => {\n                potential += object.voltageAt(pos);\n            });\n            return potential;\n        };\n        this.forceBetween = (a, b) => {\n            if (a instanceof _charges_point_charge__WEBPACK_IMPORTED_MODULE_1__[\"default\"]) {\n            }\n            return { force: _vector__WEBPACK_IMPORTED_MODULE_2__[\"default\"].origin(), torque: 0 };\n        };\n        this.objects = [];\n        this.element = element;\n        this.context = element.getContext(\"2d\");\n        this.updateAspectRatio();\n        this.render();\n        this.context.textAlign = \"center\";\n        this.context.textBaseline = \"middle\";\n        this.context.font = \"bold 30px Lato\";\n    }\n    physics(dt) {\n        this.objects.forEach((object) => {\n            object.incrementPosition(dt);\n        });\n    }\n}\nScene.parameters = {\n    viewportHeight: 10,\n    physicsPerSecond: 100,\n    timeSpeed: 1,\n};\nvar scene;\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n    let canvas = document.getElementById(\"canvas\");\n    scene = new Scene(canvas);\n    scene.objects.push(new _charges_point_charge__WEBPACK_IMPORTED_MODULE_1__[\"default\"](1, 1, new _vector__WEBPACK_IMPORTED_MODULE_2__[\"default\"](0, 0)));\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](1, 1, new _vector__WEBPACK_IMPORTED_MODULE_2__[\"default\"](-2, 4), 0.1, 4));\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](3, 1, new _vector__WEBPACK_IMPORTED_MODULE_2__[\"default\"](2, 4), 0.1, 4));\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](5, 1, new _vector__WEBPACK_IMPORTED_MODULE_2__[\"default\"](4, 4), 0.1, 4));\n});\n\n\n//# sourceURL=webpack://efield_simulator/./src/scene.ts?");

/***/ }),

/***/ "./src/vector.ts":
/*!***********************!*\
  !*** ./src/vector.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Vector)\n/* harmony export */ });\nclass Vector {\n    constructor(x, y) {\n        this.isZero = () => {\n            return this.x === 0 && this.y === 0;\n        };\n        this.magnitude = () => {\n            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));\n        };\n        this.unit = () => {\n            return Vector.multiply(this, 1 / this.magnitude());\n        };\n        this.copy = () => {\n            return new Vector(this.x, this.y);\n        };\n        this.add = (v) => {\n            this.x += v.x;\n            this.y += v.y;\n        };\n        this.x = x;\n        this.y = y;\n    }\n}\nVector.add = (a, b) => {\n    return new Vector(a.x + b.x, a.y + b.y);\n};\nVector.multiply = (a, scalar) => {\n    return new Vector(a.x * scalar, a.y * scalar);\n};\nVector.distance = (a, b) => {\n    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));\n};\nVector.dot = (a, b) => {\n    return a.x * b.x + a.y * b.y;\n};\nVector.fromArray = (a) => {\n    return new Vector(a[0], a[1]);\n};\nVector.origin = () => {\n    return new Vector(0, 0);\n};\n;\n\n\n//# sourceURL=webpack://efield_simulator/./src/vector.ts?");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/scene.ts");
/******/ 	
/******/ })()
;