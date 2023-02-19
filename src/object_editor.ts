import PointCharge from "./charges/point_charge";
import InfinitePlane from "./charges/infinite_plane";
import Conductor from "./charges/conductor";
import FiniteLine from "./charges/finite_line";
import { SolidCharge } from "./charges/solid_charge";
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
    min?: number | Vector;
    max?: number | Vector;
    step?: number;
    for?: "all" | ObjectTypes[];
    unit?: string;
    correction: Correction;
}
const canMove: ObjectTypes[] = ["point_charge", "finite_line", "solid_charge", "conductor"];
const canRotate: ObjectTypes[] = ["finite_line", "infinite_plane", "solid_charge", "conductor"];
const sliders: Slider[] = [

    //Universal
    {
        name: "position",
        type: "vector", unit: "m",
        min: new Vector(-20, -20), max: new Vector(20, 20), step: 0.1,
        for: "all",
        correction: noCorrection,
    },
    {
        name: "velocity",
        type: "vector", unit: "m/s",
        min: new Vector(-20, -20), max: new Vector(20, 20), step: 0.1,
        for: canMove,
        correction: powerCorrection,
    },
    {
        name: "rotation",
        type: "number", unit: "rad",
        min: -Math.PI, max: Math.PI, step: 0.1,
        for: canRotate,
        correction: noCorrection,
    },
    {
        name: "angular_velocity",
        type: "number", unit: "rad/s",
        min: -1.7, max: 1.7, step: 0.1,
        for: canRotate,
        correction: powerCorrection,
    },
    {
        name: "mass",
        type: "number", unit: "kg",
        min: 0.5, max: 1000, step: 0.05,
        for: canMove,
        correction: logCorrection,
    },

    //Point charge
    {
        name: "charge",
        type: "number", unit: "μC",
        min: -3, max: 3, step: 0.05,
        for: ["point_charge"],
        correction: powerCorrection,
    },

    //Finite line
    {
        name: "length",
        type: "number", unit: "m",
        min: 0.4, max: 20, step: 0.05,
        for: ["finite_line"],
        correction: logCorrection,
    },
    {
        name: "charge_density",
        type: "number", unit: "μC/m",
        min: -1.5, max: 1.5, step: 0.05,
        for: ["finite_line"],
        correction: powerCorrection,
    },

    //Infinite Plane
    {
        name: "charge_density",
        type: "number", unit: "nC/m²",
        min: -40, max: 40, step: 0.05,
        for: ["infinite_plane"],
        correction: powerCorrection,
    },

];
function getSliderId(name: string, type: ObjectTypes) {
    return sliders.findIndex((slider) => (slider.name == name && (slider.for == "all" || slider.for.includes(type))));
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
    }
    generateHTML = () => {
        interface Element { html: string; id: number; }
        let elements: Element[] = [];
        //For each element in curState
        for (let i in this.curState) {
            let id = getSliderId(i,this.curType);
            let name = sliders[id].name.charAt(0).toUpperCase() + sliders[id].name.slice(1).replace(/_/g, " ");
            let html = `<div class="input_slider slider_${i}">`;
            html += `<div class="input_slider_name">${name}</div>`;
            html += `<div class="input_slider_display">
                <span class="slider_value" id="slider_value${i}">${this.curState[i].toString()}</span>
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
                        <input id="slider_range${i}" type="range" min="${min}" max="${max}" value="${val}" step="${sliders[id].step}" oninput="scene.objEditor.input('${i}',this.value)"/></div>
                `;
            }
            //Vector inputs
            else if (sliders[id].type == "vector") {
                let min = sliders[id].min as Vector;
                let max = sliders[id].max as Vector;
                let val = this.curState[i] as Vector;
                html += `
                    <div class="input_slider_vector">
                        <input id="range_x${i}" type="range" min="${uncorrect(min.x)}" max="${uncorrect(max.x)}" step="${sliders[id].step}" value="${uncorrect(val.x)}" oninput="scene.objEditor.input('${i}',this.value,'x')"/>
                        <input id="range_y${i}" type="range" min="${uncorrect(min.y)}" max="${uncorrect(max.y)}" step="${sliders[id].step}" value="${uncorrect(val.y)}" oninput="scene.objEditor.input('${i}',this.value,'y')"/>
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
            this.curObj.updatePosition();
            return;
        }
        else if (name == "velocity") {
            if (direction == "x") this.curObj.velocity.x = value;
            if (direction == "y") this.curObj.velocity.y = value;
            this.updateDisplay("velocity", this.curObj.velocity, false);
            return;
        }
        else if (name == "rotation") {
            this.curObj.rotation = value;
            this.curObj.updateRotation();
        }
        else if (name == "angular_velocity") this.curObj.angularVelocity = value;
        else if (name == "mass") this.curObj.mass = value;
        else if (name == "charge") (this.curObj as PointCharge).charge = value;
        else if (name == "length") {
            (this.curObj as FiniteLine).length = value;
            this.curObj.updatePosition();
        }
        else if (name == "charge_density") {
            if (this.curType == "finite_line") (this.curObj as FiniteLine).chargeDensity = value;
            else if (this.curType == "infinite_plane") (this.curObj as InfinitePlane).chargeDensity = value / 1000;
        }
        this.scene.updateObjects();
        this.updateDisplay(name, value, false);
    }
    updateDisplay = (name: string, value: number | Vector, setInput: boolean = true) => {
        let slider = sliders[getSliderId(name, this.curType)]
        let uncorrect = slider.correction.uncorrect;
        //Update interface display
        if (value instanceof Vector) {
            document.querySelector("#slider_value" + name).innerHTML = value.toString();
            let valx = uncorrect(value.x);
            let valy = uncorrect(value.y);
            if (setInput) document.querySelector<HTMLInputElement>("#range_x" + name).value = valx.toString();
            if (setInput) document.querySelector<HTMLInputElement>("#range_y" + name).value = valy.toString();
        }
        else if (typeof value == "number") {
            let roundedValue = Math.round(value * 100) / 100;
            document.querySelector("#slider_value" + name).innerHTML = roundedValue.toString();
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
            if (slider.for == "all" || slider.for.includes(this.curType)) {
                //Universal
                if (slider.name == "position") this.curState[slider.name] = obj.position;
                else if (slider.name == "velocity") this.curState[slider.name] = obj.velocity;
                else if (slider.name == "rotation") this.curState[slider.name] = obj.rotation;
                else if (slider.name == "angular_velocity") this.curState[slider.name] = obj.angularVelocity;
                else if (slider.name == "mass") this.curState[slider.name] = obj.mass;
                //Specific
                else if (slider.name == "charge") this.curState[slider.name] = (obj as PointCharge).charge;
                else if (slider.name == "length") this.curState[slider.name] = (obj as FiniteLine).length;
                else if (slider.name == "charge_density") {
                    if (this.curType == "finite_line") this.curState[slider.name] = (obj as FiniteLine).chargeDensity;
                    else if (this.curType == "infinite_plane") this.curState[slider.name] = (obj as InfinitePlane).chargeDensity * 1000;
                }
            }
        }
        this.generateHTML();
    }



}
