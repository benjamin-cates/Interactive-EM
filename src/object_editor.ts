import PointCharge from "./charges/point_charge";
import InfinitePlane from "./charges/infinite_plane";
import Conductor from "./conductors/conductor";
import FiniteLine from "./charges/finite_line";
import Triangle from "./charges/triangle";
import RingConductor from "./conductors/ring";
import Vector from "./vector";
import constants from "./constants";
import { Object, ObjectTypes } from "./base";
import Scene from "./scene";


interface Correction {
    correct: (number) => number;
    uncorrect: (number) => number;
};

const noCorrection = {
    correct: (x) => x,
    uncorrect: (x) => x,
} as Correction;
const logCorrection = {
    correct: (x) => Math.exp(x),
    uncorrect: (x) => Math.log(x),
} as Correction;
const powerCorrection = {
    correct: (x) => Math.sign(x) * Math.pow(Math.abs(x), 2.6),
    uncorrect: (x) => Math.sign(x) * Math.pow(Math.abs(x), 1 / 2.6),
} as Correction;

interface Slider {
    name: string;
    type: "vector" | "number" | "boolean";
    display?: string;
    min?: number | Vector;
    max?: number | Vector;
    for?: "all" | ObjectTypes[];
    unit?: string;
    correction: Correction;
}
const canMove: ObjectTypes[] = ["point_charge", "finite_line", "triangle_charge", "ring_conductor", "line_conductor"];
const canRotate: ObjectTypes[] = ["finite_line", "infinite_plane", "triangle_charge", "conductor", "line_conductor"];
const conductor: ObjectTypes[] = ["conductor", "ring_conductor", "line_conductor"];
const sliders: Slider[] = [

    //Universal
    {
        name: "position",
        type: "vector", unit: "m",
        min: new Vector(-20, -20), max: new Vector(20, 20),
        for: "all",
        correction: noCorrection,
    },
    {
        name: "velocity",
        type: "vector", unit: "m/s",
        min: new Vector(-20, -20), max: new Vector(20, 20),
        for: canMove,
        correction: powerCorrection,
    },
    {
        name: "rotation",
        type: "number", unit: "rad",
        min: -Math.PI, max: Math.PI,
        for: canRotate,
        correction: noCorrection,
    },
    {
        name: "angularVelocity",
        display: "Angular Velocity",
        type: "number", unit: "rad/s",
        min: -1.7, max: 1.7,
        for: canRotate,
        correction: powerCorrection,
    },
    {
        name: "mass",
        type: "number", unit: "kg",
        min: 0.5, max: 1000,
        for: canMove,
        correction: logCorrection,
    },

    //Point charge
    {
        name: "charge",
        type: "number", unit: "μC",
        min: -3, max: 3,
        for: ["point_charge"],
        correction: powerCorrection,
    },

    //Finite line
    {
        name: "length",
        type: "number", unit: "m",
        min: 0.4, max: 20,
        for: ["finite_line"],
        correction: logCorrection,
    },
    {
        name: "chargeDensity",
        display: "Charge Density",
        type: "number", unit: "μC/m",
        min: -1.5, max: 1.5,
        for: ["finite_line"],
        correction: powerCorrection,
    },

    //Infinite Plane
    {
        name: "chargeDensity",
        display: "Charge Density",
        type: "number", unit: "nC/m²",
        min: -40, max: 40,
        for: ["infinite_plane"],
        correction: powerCorrection,
    },

    //Triangle
    {
        name: "chargeDensity",
        display: "Charge Density",
        type: "number", unit: "μC/m²",
        min: -1.5, max: 1.5,
        for: ["triangle_charge"],
        correction: powerCorrection,
    },

    //Ring conductor
    {
        name: "radius",
        type: "number", unit: "m",
        min: 0.4, max: 5,
        for: ["ring_conductor"],
        correction: logCorrection,
    },
    {
        name: "netCharge",
        display: "Net Charge",
        type: "number", unit: "μC",
        min: -3, max: 3,
        for: conductor,
        correction: powerCorrection,
    },
    //Line conductor
    {
        name: "length",
        type: "number", unit: "m",
        min: 1, max: 10,
        for: ["line_conductor"],
        correction: logCorrection,
    },
];
function getSliderId(name: string, type: ObjectTypes) {
    return sliders.findIndex((slider) => (slider.name == name && (slider.for == "all" || slider.for.includes(type))));
}
function prettyToString(val: number | Vector) {
    if (typeof val == "number") {
        let negativeBuffer = val < 0 ? "" : "&nbsp;";
        return negativeBuffer + val.toFixed(2);
    }
    else return val.toString();

}
export default class ObjEditor {
    static correction(value: number, isNonLinear: boolean = false): number {
        if (isNonLinear) return Math.sign(value) * Math.pow(Math.abs(value), 2.6);
        else return value;
    }
    static unCorrection(value: number, isNonLinear: boolean = false): number {
        if (isNonLinear) return Math.sign(value) * Math.pow(Math.abs(value), 1 / 2.6);
        else return value;
    }
    element: HTMLElement;
    curObj?: Object;
    curType?: ObjectTypes;
    curState?: { [key: string]: Vector | number } = {};
    scene: Scene;
    constructor(element: HTMLElement, scene: Scene) {
        this.element = element;
        this.scene = scene;
        if (scene.objects[0]) this.setObj(scene.objects[0]);
        else this.hide();
    }
    hideTimeout = -1;
    show = () => {
        window.clearTimeout(this.hideTimeout);
        this.element.style.display = "block";
        this.element.clientWidth;
        this.element.classList.add("show");
    }
    hide = () => {
        this.element.classList.remove("show");
        this.hideTimeout = setTimeout(_ => this.element.style.display = "none", 400);
    }
    generateHTML = () => {
        interface Element { html: string; id: number; }
        let elements: Element[] = [];
        //For each element in curState
        for (let i in this.curState) {
            let id = getSliderId(i, this.curType);
            let name = sliders[id].name.charAt(0).toUpperCase() + sliders[id].name.slice(1).replace(/_/g, " ");
            if (sliders[id].display) name = sliders[id].display;
            let html = `<div class="input_slider slider_${i}">`;
            html += `<div class="input_slider_name">${name}</div>`;
            html += `<div class="input_slider_display">
                <span class="slider_value" id="slider_value${i}">${prettyToString(this.curState[i])}</span>
                <span class="slider_units">${sliders[id].unit}</span></div>`;
            let uncorrect = sliders[id].correction.uncorrect;
            //Number sliders
            if (sliders[id].type == "number") {
                //Do not display angular velocity or rotation for point charges
                if ((sliders[id].name == "angular_velocity" || sliders[id].name == "rotation") && this.curObj instanceof PointCharge) continue;
                if (sliders[id].name == "mass" && this.curObj instanceof InfinitePlane) continue;
                //Calculate corrected min and max values according to non-linear input
                let min = uncorrect(sliders[id].min as number);
                let max = uncorrect(sliders[id].max as number);
                let val = uncorrect(this.curState[i] as number);
                html += `
                    <div class="input_slider_range">
                        <input id="slider_range${i}" type="range" min="${min}" max="${max}" value="${val}" step="0.001" oninput="scene.objEditor.input('${i}',this.value)"/></div>
                `;
            }
            //Vector inputs
            else if (sliders[id].type == "vector") {
                let min = sliders[id].min as Vector;
                let max = sliders[id].max as Vector;
                let val = this.curState[i] as Vector;
                html += `
                    <div class="input_slider_vector">
                        <input id="range_x${i}" type="range" min="${uncorrect(min.x)}" max="${uncorrect(max.x)}" step="0.001" value="${uncorrect(val.x)}" oninput="scene.objEditor.input('${i}',this.value,'x')"/>
                        <input id="range_y${i}" type="range" min="${uncorrect(min.y)}" max="${uncorrect(max.y)}" step="0.001" value="${uncorrect(val.y)}" oninput="scene.objEditor.input('${i}',this.value,'y')"/>
                    </div>
                `;
            }
            //Add value and units
            html += "</div>";

            elements.push({ html, id });
        }
        //Sort by named order in sliders
        elements.sort((a, b) => a.id - b.id);
        //Compile to single html string
        let outHtml = "";
        elements.forEach(v => outHtml += v.html);
        outHtml += `<div class="action_buttons">
                <button class="delete_button" onclick="scene.objEditor.deleteElement()">&times; Destroy</button>
        </div>`;
        this.element.innerHTML = outHtml;
    }
    input = (name: string, value: number | string, direction?: "x" | "y") => {
        if (!this.curObj) return;
        let slider = sliders[getSliderId(name, this.curType)];
        value = slider.correction.correct(Number(value));
        value = Math.round(value * 100) / 100;
        if (name == "position") {
            if (direction == "x") this.curObj.position.x = value;
            if (direction == "y") this.curObj.position.y = value;
            this.updateDisplay("position", this.curObj.position, false);
            this.curObj.updateProperty("position", this.curObj.position);
            return;
        }
        else if (name == "velocity") {
            if (direction == "x") this.curObj.velocity.x = value;
            if (direction == "y") this.curObj.velocity.y = value;
            this.updateDisplay("velocity", this.curObj.velocity, false);
            return;
        }
        else this.curObj.updateProperty(name, value);
        this.scene.updateObjects();
        this.updateDisplay(name, value, false);
    }
    updateDisplay = (name: string, value: number | Vector, setInput: boolean = true) => {
        let slider = sliders[getSliderId(name, this.curType)]
        if (slider == null) return;
        let uncorrect = slider.correction.uncorrect;
        //Update interface display
        if (value instanceof Vector) {
            document.querySelector("#slider_value" + name).innerHTML = prettyToString(value);
            let valx = uncorrect(value.x);
            let valy = uncorrect(value.y);
            if (setInput) document.querySelector<HTMLInputElement>("#range_x" + name).value = valx.toString();
            if (setInput) document.querySelector<HTMLInputElement>("#range_y" + name).value = valy.toString();
        }
        else if (typeof value == "number") {
            let roundedValue = Math.round(value * 100) / 100;
            document.querySelector("#slider_value" + name).innerHTML = prettyToString(roundedValue);
            value = uncorrect(value);
            if (setInput) document.querySelector<HTMLInputElement>("#slider_range" + name).value = value.toString();
        }
    }

    setObj = (obj: Object) => {
        this.curObj = obj;
        this.curType = obj.getType();
        this.curState = {};
        //Update curState to match sliders
        for (let i = 0; i < sliders.length; i++) {
            let slider = sliders[i];
            if (slider.for == "all" || slider.for.includes(this.curType))
                this.curState[slider.name] = obj[slider.name];
        }
        this.generateHTML();
        this.show();
    }

    deleteElement = () => {
        if (!this.curObj) return;
        this.scene.removeObject(this.curObj);
        this.hide();
    }

}
