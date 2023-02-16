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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Object)\n/* harmony export */ });\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vector */ \"./src/vector.ts\");\n\nclass Object {\n    constructor(mass, position, rotation = 0) {\n        this.render = (ctx) => {\n        };\n        this.voltageAt = (pos) => {\n            return 0;\n        };\n        this.fieldAt = (pos) => {\n            return _vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"].origin();\n        };\n        this.momentOfInertia = () => {\n            return 0;\n        };\n        this.incrementPosition = (dt) => {\n            this.position.x += this.velocity.x * dt;\n            this.position.y += this.velocity.y * dt;\n        };\n        this.physics = (dt, force, torque) => {\n            this.incrementPosition(dt);\n            this.velocity.add(_vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"].multiply(force, dt / this.mass));\n        };\n        this.velocity = new _vector__WEBPACK_IMPORTED_MODULE_0__[\"default\"](0, 0);\n        this.position = position;\n        this.mass = mass;\n        this.rotation = rotation;\n    }\n}\n\n\n//# sourceURL=webpack://interactive-em/./src/base.ts?");

/***/ }),

/***/ "./src/charges/finite_line.ts":
/*!************************************!*\
  !*** ./src/charges/finite_line.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ FiniteLine)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vector */ \"./src/vector.ts\");\n/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scene */ \"./src/scene.ts\");\n\n\n\nclass FiniteLine extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor(chargeDensity, mass, position, rotation, length) {\n        super(mass, position, rotation);\n        this.render = (ctx) => {\n            ctx.strokeStyle = _scene__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getChargeColor(this.chargeDensity);\n            let halfLen = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(new _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"](Math.cos(this.rotation), Math.sin(this.rotation)), this.length / 2);\n            let start = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.position, halfLen);\n            let end = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.position, _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(halfLen, -1));\n            ctx.lineWidth = Math.abs(this.chargeDensity) * 25 / (Math.abs(this.chargeDensity) + 3);\n            ctx.beginPath();\n            ctx.moveTo(start.x * 100, start.y * 100);\n            ctx.lineTo(end.x * 100, end.y * 100);\n            ctx.stroke();\n            ctx.closePath();\n        };\n        this.chargeDensity = chargeDensity;\n        this.length = length;\n    }\n}\n\n\n//# sourceURL=webpack://interactive-em/./src/charges/finite_line.ts?");

/***/ }),

/***/ "./src/charges/infinite_plane.ts":
/*!***************************************!*\
  !*** ./src/charges/infinite_plane.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ InfinitePlane)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vector */ \"./src/vector.ts\");\n/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../scene */ \"./src/scene.ts\");\n\n\n\nclass InfinitePlane extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor(chargeDensity, mass, position, rotation = 0) {\n        super(mass, position, rotation);\n        this.render = (ctx) => {\n            ctx.strokeStyle = _scene__WEBPACK_IMPORTED_MODULE_2__[\"default\"].getChargeColor(this.chargeDensity);\n            ctx.lineWidth = Math.abs(this.chargeDensity) * 75 / (Math.abs(this.chargeDensity) + 3);\n            ctx.beginPath();\n            let dir = new _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"](40 * Math.cos(this.rotation), 40 * Math.sin(this.rotation));\n            ctx.moveTo((this.position.x + dir.x) * 100, (this.position.y + dir.y) * 100);\n            ctx.lineTo((this.position.x - dir.x) * 100, (this.position.y - dir.y) * 100);\n            ctx.stroke();\n            ctx.closePath();\n        };\n        this.chargeDensity = chargeDensity;\n    }\n}\n\n\n//# sourceURL=webpack://interactive-em/./src/charges/infinite_plane.ts?");

/***/ }),

/***/ "./src/charges/point_charge.ts":
/*!*************************************!*\
  !*** ./src/charges/point_charge.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ PointCharge)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../scene */ \"./src/scene.ts\");\n\n\nclass PointCharge extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n    constructor(charge, mass, position) {\n        super(mass, position);\n        this.render = (ctx) => {\n            ctx.fillStyle = _scene__WEBPACK_IMPORTED_MODULE_1__[\"default\"].getChargeColor(this.charge);\n            ctx.strokeStyle = \"black\";\n            ctx.lineWidth = 3;\n            ctx.beginPath();\n            ctx.arc(this.position.x * 100, this.position.y * 100, this.displayRadius, 0, 2 * Math.PI);\n            ctx.fill();\n            ctx.stroke();\n            ctx.closePath();\n            ctx.fillStyle = \"white\";\n            ctx.strokeStyle = \"none\";\n            ctx.fillText(this.charge.toString() + \"μC\", this.position.x * 100, this.position.y * 100);\n        };\n        this.feildAt = (pos) => {\n            let nVec = pos.unit();\n            return 0;\n        };\n        this.charge = charge;\n        this.displayRadius = 40;\n    }\n}\n\n\n//# sourceURL=webpack://interactive-em/./src/charges/point_charge.ts?");

/***/ }),

/***/ "./src/charges/solid_charge.ts":
/*!*************************************!*\
  !*** ./src/charges/solid_charge.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"SolidCharge\": () => (/* binding */ SolidCharge),\n/* harmony export */   \"Triangle\": () => (/* binding */ Triangle)\n/* harmony export */ });\n/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ \"./src/base.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vector */ \"./src/vector.ts\");\n\n\nclass Triangle {\n    constructor(p1, p2, p3) {\n        this.points = [p1, p2, p3];\n        let d1 = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].distance(p1, p2);\n        let d2 = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].distance(p2, p3);\n        let d3 = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].distance(p3, p1);\n        let hypot = 2, hypot2 = 0, opposite = 1;\n        if (d1 >= d2 && d1 >= d3)\n            hypot = 0, hypot2 = 1, opposite = 2;\n        else if (d2 >= d1 && d2 >= d3)\n            hypot = 1, hypot2 = 2, opposite = 0;\n        this.hypot1 = hypot;\n        this.hypot2 = hypot2;\n        this.opposite = opposite;\n        this.hypotCenter = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(_vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.points[hypot], this.points[hypot2]), 0.5);\n        let hypotVec = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.points[hypot], _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(this.points[hypot2], -1));\n        this.halfWidth = hypotVec.magnitude() / 2;\n        this.defRotation = -Math.atan2(hypotVec.y, hypotVec.x);\n        this.opTrans = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(this.points[opposite], _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(this.hypotCenter, -1));\n        this.opTrans.rotate(this.defRotation);\n        if (this.opTrans.y < 0) {\n            this.defRotation += Math.PI;\n            this.opTrans.rotate(Math.PI);\n        }\n    }\n    voltageAt(pos) {\n        let p = _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].add(pos, _vector__WEBPACK_IMPORTED_MODULE_1__[\"default\"].multiply(this.hypotCenter, -1));\n        p.rotate(this.defRotation);\n        let halfWidth = this.halfWidth;\n        let height = this.opTrans.y;\n        let ox = this.opTrans.x;\n        let a = height / halfWidth;\n        let b = p.x * a - p.y;\n        let c = height / (ox - halfWidth);\n        let d = (halfWidth * height - p.x * height - p.y * halfWidth + ox * p.y) / (halfWidth - ox);\n        let l0 = -halfWidth - p.x;\n        let l1 = ox - p.x;\n        let l2 = halfWidth - p.x;\n        const f1 = (x) => -p.y * Math.log(Math.abs(-p.y * Math.sqrt(x * x + p.y * p.y) + Math.abs(p.y) * x)) + x * Math.asinh(-p.y / x);\n        const f2 = (x, a, b) => a * (Math.sqrt(Math.pow((a + x / b), 2) + 1) - 1) / (a + x / b);\n        const f3 = (x, a, b) => {\n            let t = f2(x, a, b);\n            let l = Math.sqrt(a * a + 1);\n            return x * Math.asinh(a + b / x) + b / l * Math.log(Math.abs((t + l + 1) / (t - l + 1)));\n        };\n        return f3(l1, a, b) - f3(l0, a, b) + f3(l2, c, d) - f3(l1, c, d) + f1(l0) - f1(l2);\n    }\n}\nwindow.Triangle = Triangle;\nclass SolidCharge extends _base__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n}\n\n\n//# sourceURL=webpack://interactive-em/./src/charges/solid_charge.ts?");

/***/ }),

/***/ "./src/equipotential.ts":
/*!******************************!*\
  !*** ./src/equipotential.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ VoltCanvas)\n/* harmony export */ });\n/* harmony import */ var _charges_point_charge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./charges/point_charge */ \"./src/charges/point_charge.ts\");\n/* harmony import */ var _charges_finite_line__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./charges/finite_line */ \"./src/charges/finite_line.ts\");\n/* harmony import */ var _charges_infinite_plane__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./charges/infinite_plane */ \"./src/charges/infinite_plane.ts\");\n\n\n\nclass VoltCanvas {\n    setColors(cols) {\n        window.Object.assign(this.colors, cols);\n        for (let i in this.colors) {\n            let col = this.colors[i];\n            this.gl.uniform4f(this.uniLoc[i], col[0], col[1], col[2], col[3]);\n        }\n    }\n    resize(width, height) {\n        this.gl.uniform2f(this.uniLoc[\"resolution\"], width, height);\n        this.canvas.width = window.innerWidth;\n        this.canvas.height = window.innerHeight;\n        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);\n    }\n    constructor(canvas) {\n        this.uniLoc = {};\n        this.colors = {\n            \"positive_color\": [1, 0, 0, 1],\n            \"negative_color\": [0, 0, 1, 1],\n            \"neutral_color\": [0, 0, 0, 1],\n            \"equipotential_color\": [0, 1, 0, 1],\n        };\n        this.updateObjects = (objects) => {\n            let points = objects.filter((obj) => obj instanceof _charges_point_charge__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);\n            let pointData = new Float32Array(points.length * 3);\n            points.forEach((point, i) => {\n                pointData[i * 3] = point.position.x;\n                pointData[i * 3 + 1] = point.position.y;\n                pointData[i * 3 + 2] = point.charge;\n            });\n            this.gl.uniform1i(this.uniLoc.point_count, points.length);\n            this.gl.uniform3fv(this.uniLoc.point_data, pointData);\n            let lines = objects.filter((obj) => obj instanceof _charges_finite_line__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\n            let linePos = new Float32Array(lines.length * 3);\n            let lineData = new Float32Array(lines.length * 2);\n            lines.forEach((line, i) => {\n                linePos[i * 3] = line.position.x;\n                linePos[i * 3 + 1] = line.position.y;\n                linePos[i * 3 + 2] = line.rotation;\n                lineData[i * 2] = line.chargeDensity;\n                lineData[i * 2 + 1] = line.length;\n            });\n            this.gl.uniform1i(this.uniLoc.line_count, lines.length);\n            this.gl.uniform2fv(this.uniLoc.line_data, lineData);\n            this.gl.uniform3fv(this.uniLoc.line_pos, linePos);\n            let planes = objects.filter((obj) => obj instanceof _charges_infinite_plane__WEBPACK_IMPORTED_MODULE_2__[\"default\"]);\n            let planeData = new Float32Array(planes.length * 4);\n            planes.forEach((plane, i) => {\n                planeData[i * 4] = plane.position.x;\n                planeData[i * 4 + 1] = plane.position.y;\n                planeData[i * 4 + 2] = plane.rotation;\n                planeData[i * 4 + 3] = plane.chargeDensity;\n            });\n            this.gl.uniform1i(this.uniLoc.plane_count, planes.length);\n            this.gl.uniform4fv(this.uniLoc.plane_data, planeData);\n        };\n        this.fullscreenRender = () => {\n            const positionAttributeLocation = this.gl.getAttribLocation(this.program, \"a_position\");\n            const positionBuffer = this.gl.createBuffer();\n            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);\n            const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,];\n            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);\n            this.gl.enableVertexAttribArray(positionAttributeLocation);\n            this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);\n            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);\n        };\n        this.canvas = canvas;\n        this.gl = canvas.getContext(\"webgl\");\n        if (!this.gl) {\n            alert(\"WebGL not supported\");\n            return;\n        }\n        this.program = this.gl.createProgram();\n        const vertexShader = VoltCanvas.createShader(this.gl, this.gl.VERTEX_SHADER, VoltCanvas.vertexShader);\n        this.gl.attachShader(this.program, vertexShader);\n        const fragmentShader = VoltCanvas.createShader(this.gl, this.gl.FRAGMENT_SHADER, VoltCanvas.fragmentShader);\n        this.gl.attachShader(this.program, fragmentShader);\n        this.gl.linkProgram(this.program);\n        this.gl.useProgram(this.program);\n        for (let name in this.uniLoc) {\n            this.uniLoc[name] = this.gl.getUniformLocation(this.program, name);\n        }\n        this.setColors({});\n    }\n}\nVoltCanvas.createShader = (gl, type, source) => {\n    const shader = gl.createShader(type);\n    gl.shaderSource(shader, source);\n    gl.compileShader(shader);\n    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);\n    if (success) {\n        return shader;\n    }\n    console.log(\"Shader compilation error\");\n    console.log(gl.getShaderInfoLog(shader));\n    gl.deleteShader(shader);\n};\nVoltCanvas.vertexShader = `\r\n        attribute vec2 a_position;\r\n        void main() {\r\n            gl_Position = vec4(a_position, 0, 1);\r\n        }\r\n    `;\nVoltCanvas.fragmentShader = `\r\n        precision mediump float;\r\n\r\n        uniform float canvas;\r\n\r\n        uniform float point_count;\r\n        uniform vec3 point_data[100];\r\n\r\n        uniform float line_count;\r\n        uniform vec3 line_pos[100];\r\n        uniform vec2 line_data[100];\r\n\r\n        uniform float plane_count;\r\n        uniform vec4 plane_data[100];\r\n\r\n        void main() {\r\n            gl_FragColor = vec4(1, 0, 0.5, 1);\r\n        }\r\n    `;\n\n\n//# sourceURL=webpack://interactive-em/./src/equipotential.ts?");

/***/ }),

/***/ "./src/scene.ts":
/*!**********************!*\
  !*** ./src/scene.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Scene)\n/* harmony export */ });\n/* harmony import */ var _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./charges/finite_line */ \"./src/charges/finite_line.ts\");\n/* harmony import */ var _charges_infinite_plane__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./charges/infinite_plane */ \"./src/charges/infinite_plane.ts\");\n/* harmony import */ var _charges_point_charge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./charges/point_charge */ \"./src/charges/point_charge.ts\");\n/* harmony import */ var _vector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vector */ \"./src/vector.ts\");\n/* harmony import */ var _charges_solid_charge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./charges/solid_charge */ \"./src/charges/solid_charge.ts\");\n/* harmony import */ var _equipotential__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./equipotential */ \"./src/equipotential.ts\");\n\n\n\n\n\n\nwindow.Triangle = _charges_solid_charge__WEBPACK_IMPORTED_MODULE_4__.Triangle;\nwindow.Vector = _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"];\nclass Scene {\n    static getChargeColor(charge) {\n        if (charge < 0)\n            return Scene.colors.negative;\n        if (charge > 0)\n            return Scene.colors.positive;\n        return Scene.colors.neutral;\n    }\n    constructor(element, voltCanvas) {\n        this.updateAspectRatio = () => {\n            let aspectRatio = window.innerWidth / window.innerHeight;\n            this.height = Scene.parameters.viewportHeight * 2;\n            this.width = aspectRatio * this.height;\n            this.element.width = window.innerWidth;\n            this.element.height = window.innerHeight;\n            this.context.resetTransform();\n            this.context.translate(window.innerWidth / 2, window.innerHeight / 2);\n            let scale = window.innerHeight / 2 / Scene.parameters.viewportHeight / 100;\n            this.context.scale(scale, scale);\n            this.voltCanvas.resize(this.width, this.height);\n        };\n        this.sceneDefaults = () => {\n            this.context.font = \"bold 30px Lato\";\n            this.context.textAlign = \"center\";\n            this.context.textBaseline = \"middle\";\n        };\n        this.getCursorPosition = (event) => {\n            let rect = this.element.getBoundingClientRect();\n            let x = event.clientX - rect.left - this.element.width / 2;\n            let y = event.clientY - rect.top - this.element.height / 2;\n            let aspectRatio = this.element.width / this.element.height;\n            return new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](x / this.element.width * 2 * Scene.parameters.viewportHeight * aspectRatio, -y / this.element.height * 2 * Scene.parameters.viewportHeight);\n        };\n        this.render = () => {\n            requestAnimationFrame(this.render);\n            this.context.clearRect(-100 * this.width, -100 * this.height, this.width * 200, this.height * 200);\n            this.voltCanvas.fullscreenRender();\n            if (Scene.parameters.showGridLines) {\n                this.context.lineWidth = 1.5;\n                this.context.strokeStyle = Scene.colors.gridLines;\n                this.context.beginPath();\n                for (let i = Math.floor(-this.width); i < this.width; i++) {\n                    this.context.moveTo(i * 100, -this.height * 100);\n                    this.context.lineTo(i * 100, this.height * 100);\n                }\n                for (let i = Math.floor(-this.height); i < this.height; i++) {\n                    this.context.moveTo(-this.width * 100, i * 100);\n                    this.context.lineTo(this.width * 100, i * 100);\n                }\n                this.context.stroke();\n                this.context.closePath();\n            }\n            this.objects.forEach((object) => {\n                object.render(this.context);\n            });\n        };\n        this.fieldAt = (pos) => {\n            let out = _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"].origin();\n            this.objects.forEach((object) => {\n                out.add(object.fieldAt(pos));\n            });\n            return out;\n        };\n        this.voltageAt = (pos) => {\n            let potential = 0;\n            this.objects.forEach((object) => {\n                potential += object.voltageAt(pos);\n            });\n            return potential;\n        };\n        this.forceBetween = (a, b) => {\n            if (a instanceof _charges_point_charge__WEBPACK_IMPORTED_MODULE_2__[\"default\"]) {\n            }\n            return { force: _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"].origin(), torque: 0 };\n        };\n        this.objects = [];\n        this.element = element;\n        this.context = element.getContext(\"2d\");\n        this.voltCanvas = new _equipotential__WEBPACK_IMPORTED_MODULE_5__[\"default\"](voltCanvas);\n        this.updateAspectRatio();\n        this.sceneDefaults();\n        this.render();\n    }\n    pushObject(object) {\n        this.objects.push(object);\n        this.updateObjects();\n    }\n    updateObjects() {\n        this.voltCanvas.updateObjects(this.objects);\n    }\n    physics(dt) {\n        this.objects.forEach((object) => {\n            object.incrementPosition(dt);\n        });\n    }\n}\nScene.parameters = {\n    viewportHeight: 10,\n    physicsPerSecond: 100,\n    timeSpeed: 1,\n    showGridLines: true,\n};\nScene.colors = {\n    background: \"#ffffff\",\n    gridLines: \"#666666\",\n    neutral: \"#000000\",\n    positive: \"#ff0000\",\n    negative: \"#0000ff\",\n    equipotential: \"#ff0000\",\n    fieldLines: \"#cccccc\",\n};\nvar scene;\ndocument.addEventListener(\"DOMContentLoaded\", () => {\n    let canvas = document.getElementById(\"canvas\");\n    let voltCanvas = document.getElementById(\"volt_canvas\");\n    scene = new Scene(canvas, voltCanvas);\n    scene.objects.push(new _charges_point_charge__WEBPACK_IMPORTED_MODULE_2__[\"default\"](1, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](0, 0)));\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](1, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](-2, 4), 0.1, 4));\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](-3, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](2, 4), 0.1, 4));\n    scene.objects.push(new _charges_finite_line__WEBPACK_IMPORTED_MODULE_0__[\"default\"](5, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](4, 4), 0.1, 4));\n    scene.objects.push(new _charges_infinite_plane__WEBPACK_IMPORTED_MODULE_1__[\"default\"](-5, 1, new _vector__WEBPACK_IMPORTED_MODULE_3__[\"default\"](6, -4), -0.4));\n    scene.updateObjects();\n});\nwindow.addEventListener(\"resize\", () => {\n    scene.updateAspectRatio();\n    scene.sceneDefaults();\n});\nwindow.addEventListener(\"click\", (e) => {\n    console.log(scene.getCursorPosition(e).toString());\n});\n\n\n//# sourceURL=webpack://interactive-em/./src/scene.ts?");

/***/ }),

/***/ "./src/vector.ts":
/*!***********************!*\
  !*** ./src/vector.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Vector)\n/* harmony export */ });\nclass Vector {\n    constructor(x, y) {\n        this.isZero = () => {\n            return this.x === 0 && this.y === 0;\n        };\n        this.magnitude = () => {\n            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));\n        };\n        this.unit = () => {\n            return Vector.multiply(this, 1 / this.magnitude());\n        };\n        this.copy = () => {\n            return new Vector(this.x, this.y);\n        };\n        this.add = (v) => {\n            this.x += v.x;\n            this.y += v.y;\n        };\n        this.x = x;\n        this.y = y;\n    }\n    toString() {\n        return `<${this.x}, ${this.y}>`;\n    }\n    rotate(angle) {\n        let sin = Math.sin(angle);\n        let cos = Math.cos(angle);\n        let x = this.x * cos - this.y * sin;\n        let y = this.x * sin + this.y * cos;\n        this.x = x;\n        this.y = y;\n    }\n}\nVector.add = (a, b) => {\n    return new Vector(a.x + b.x, a.y + b.y);\n};\nVector.multiply = (a, scalar) => {\n    return new Vector(a.x * scalar, a.y * scalar);\n};\nVector.distance = (a, b) => {\n    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));\n};\nVector.dot = (a, b) => {\n    return a.x * b.x + a.y * b.y;\n};\nVector.fromArray = (a) => {\n    return new Vector(a[0], a[1]);\n};\nVector.origin = () => {\n    return new Vector(0, 0);\n};\n;\n\n\n//# sourceURL=webpack://interactive-em/./src/vector.ts?");

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
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/scene.ts");
/******/ 	
/******/ })()
;