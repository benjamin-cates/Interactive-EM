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
    type: "vector" | "number" | "boolean" | "color" | "string";
    display?: string;
    min?: number | Vector;
    max?: number | Vector;
    for?: "all" | ObjectTypes[];
    unit?: string;
    correction: Correction;
    presets?: Preset[];
}
interface Preset {
    name: string;
    replacementFunc: (x: number | Vector) => (number | Vector);
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
        presets: [
            { name: "stop", replacementFunc: (x) => new Vector(0, 0) },
        ],
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
        display: "Angular Vel.",
        type: "number", unit: "rad/s",
        min: -1.7, max: 1.7,
        for: canRotate,
        correction: powerCorrection,
        presets: [
            { name: "stop", replacementFunc: (x) => 0 },
        ],
    },
    {
        name: "mass",
        type: "number", unit: "kg",
        min: 0.5, max: 1000,
        for: canMove,
        correction: logCorrection,
        presets: [
            { name: "heavy", replacementFunc: (x) => Infinity },
            { name: "light", replacementFunc: (x) => 0.5 },
        ],
    },

    //Point charge
    {
        name: "charge",
        type: "number", unit: "μC",
        min: -3, max: 3,
        for: ["point_charge"],
        correction: powerCorrection,
        presets: [
            { name: "flip", replacementFunc: (x: number | Vector) => -(x as number) },
        ],
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
        presets: [
            { name: "flip", replacementFunc: (x: number | Vector) => -(x as number) },
        ],
    },

    //Infinite Plane
    {
        name: "chargeDensity",
        display: "Charge Density",
        type: "number", unit: "nC/m²",
        min: -40, max: 40,
        for: ["infinite_plane"],
        correction: powerCorrection,
        presets: [
            { name: "flip", replacementFunc: (x: number | Vector) => -(x as number) },
        ],
    },

    //Triangle
    {
        name: "chargeDensity",
        display: "Charge Density",
        type: "number", unit: "μC/m²",
        min: -1.5, max: 1.5,
        for: ["triangle_charge"],
        correction: powerCorrection,
        presets: [
            { name: "flip", replacementFunc: (x: number | Vector) => -(x as number) },
        ],
    },

    //Ring conductor
    {
        name: "radius",
        type: "number", unit: "m",
        min: 0.4, max: 4,
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
    //Scene
    {
        name: "showGridLines",
        display: "Show Grid Lines",
        type: "boolean",
        for: ["scene"],
        correction: noCorrection,
    },
    {
        name: "equipotentialColor",
        display: "Equipotential Color",
        type: "color",
        for: ["scene"],
        correction: noCorrection,
    },
    {
        name: "fieldLineColor",
        display: "Field Color",
        type: "color",
        for: ["scene"],
        correction: noCorrection,
    },
    {
        name: "positiveColor",
        display: "Positive Color",
        type: "color",
        for: ["scene"],
        min: 1,//Turn off alpha slider
        correction: noCorrection,
    },
    {
        name: "neutralColor",
        display: "Neutral Color",
        type: "color",
        for: ["scene"],
        min: 1,//Turn off alpha slider
        correction: noCorrection,
    },
    {
        name: "negativeColor",
        display: "Negative Color",
        type: "color",
        for: ["scene"],
        min: 1,//Turn off alpha slider
        correction: noCorrection,
    },
    {
        name: "timeScale",
        display: "Force Scaling",
        type: "number", unit: "N/N",
        for: ["scene"],
        min: 0, max: 300,
        correction: powerCorrection,
    },
    {
        name: "viewportHeight",
        display: "Viewport Size",
        type: "number", unit: "m",
        for: ["scene"],
        min: 5, max: 15,
        correction: logCorrection,
    },
];
function getSliderId(name: string, type: ObjectTypes) {
    return sliders.findIndex((slider) => (slider.name == name && (slider.for == "all" || slider.for.includes(type))));
}
function prettyToString(val: number | Vector | string) {
    if (typeof val == "number") {
        return val.toFixed(2);
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
    curState?: { [key: string]: Vector | number | string } = {};
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
            if (id == -1) continue;
            let name = sliders[id].name.charAt(0).toUpperCase() + sliders[id].name.slice(1).replace(/_/g, " ");
            if (sliders[id].display) name = sliders[id].display;
            let html = `<div class="input_slider slider_${i}">`;
            html += `<div class="input_slider_name">${name}`;
            if (sliders[id].presets) for (let x = 0; x < sliders[id].presets.length; x++) {
                let preset = sliders[id].presets[x];
                html += `<button class="input_slider_preset" onclick="scene.objEditor.preset('${i}',${x})" id="preset_${i}">${preset.name}</button>`;
            }
            let inputType = sliders[id].type;
            html += "</div>";
            html += `<div class="input_slider_display">`;
            if (inputType == "number" || inputType == "vector")
                html += `<span class="slider_value" id="slider_value${i}">${prettyToString(this.curState[i])}</span>`;
            if (sliders[id].unit)
                html += ` <span class="slider_units">${sliders[id].unit}</span></div>`;
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
                if (val == Infinity) val = max;
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
            else if (sliders[id].type == "color") {
                html += `
                    <div class="input_slider_color">
                        <label id="slider_value${i}" style="background: ${this.curState[i]}" for="slider_color_${i}">${this.curState[i]}</label>
                        <input id="slider_color_${i}" class="color_input" type="color" value="${(this.curState[i] as string).slice(0, 7)}" oninput="scene.objEditor.input('${i}',this.value)"/>
                        <input id="slider_transparency_${i}" class="transparency_slider ${sliders[id].min == 1 ? "hidden" : ""}" type="range" min="0" max="1" step="0.002" value="${parseInt((this.curState[i] as string).slice(7, 9), 16) / 255}" oninput="scene.objEditor.input('${i}',this.value)"/>
                    </div>`;
            }
            else if (sliders[id].type == "string") {
                html += `
                    <div class="input_slider_color">
                        <input id="slider_string_${i}" type="text" value="${this.curState[i]}" oninput="scene.objEditor.input('${i}',this.value)"/>
                    </div>`;
            }
            else if (sliders[id].type == "boolean") {
                html += `
                    <div class="input_slider_boolean">
                        <label class="checkbox-wrapper">
                            <input type="checkbox" ${this.curState[i] ? "checked" : ""} oninput="scene.objEditor.input('${i}',this.checked)">
                            <div class="checkbox-slider">
                                <div class="checkbox-knob"></div>
                            </div>
                        </label>
                    </div>`;
            }
            html += "</div>";

            elements.push({ html, id });
        }
        //Sort by named order in sliders
        elements.sort((a, b) => a.id - b.id);
        //Compile to single html string
        let outHtml = "";
        elements.forEach(v => outHtml += v.html);
        if (!(this.curObj instanceof Scene)) {
            outHtml += `<div class="action_buttons">
                <button class="delete_button" onclick="scene.objEditor.deleteElement()">&times; Destroy</button>
            </div>`;
        }
        this.element.innerHTML = outHtml;
    }
    preset = (name: string, index: number) => {
        let slider = sliders[getSliderId(name, this.curType)];
        let preset = slider.presets[index];
        let value: number | Vector = this.curObj[name];
        let next = preset.replacementFunc(value);
        if (next instanceof Vector) {
            this.input(name, slider.correction.uncorrect(next.x), "x");
            this.input(name, slider.correction.uncorrect(next.y), "y");
        }
        else this.input(name, slider.correction.uncorrect(next));
        this.updateDisplay(name, next);
    }
    input = (name: string, value: number | string, direction?: "x" | "y") => {
        if (!this.curObj) return;
        let slider = sliders[getSliderId(name, this.curType)];
        if (!isNaN(Number(value))) {
            value = slider.correction.correct(Number(value));
            value = Math.round(value * 100) / 100;
        }
        if (slider.type == "vector") {
            if (direction == "x") this.curObj[name].x = value;
            if (direction == "y") this.curObj[name].y = value;
            this.updateDisplay(name, this.curObj[name], false);
            this.curObj.updateProperty(name, this.curObj[name]);
        }
        else if (slider.type == "color") {
            let trans = Number(document.querySelector<HTMLInputElement>("#slider_transparency_" + name).value);
            let col = document.querySelector<HTMLInputElement>("#slider_color_" + name).value;
            let combined = col + Math.floor(trans * 255).toString(16).padStart(2, "0");
            this.updateDisplay(name, combined, false);
            this.curObj.updateProperty(name, combined);
        }
        else {
            this.updateDisplay(name, value, false);
            this.curObj.updateProperty(name, value as number);
        }
        this.scene.updateObjects();
    }
    updateDisplay = (name: string, value: number | Vector | boolean | string, setInput: boolean = true) => {
        let slider = sliders[getSliderId(name, this.curType)]
        if (slider == null) return;
        let uncorrect = slider.correction.uncorrect;
        //Update interface display
        if (slider.type == "vector") {
            document.querySelector("#slider_value" + name).textContent = prettyToString(value as Vector);
            let valx = uncorrect((value as Vector).x);
            let valy = uncorrect((value as Vector).y);
            if (setInput) document.querySelector<HTMLInputElement>("#range_x" + name).value = valx.toString();
            if (setInput) document.querySelector<HTMLInputElement>("#range_y" + name).value = valy.toString();
        }
        else if (slider.type == "number") {
            let roundedValue = Math.round(value as number * 100) / 100;
            document.querySelector("#slider_value" + name).textContent = prettyToString(roundedValue);
            value = uncorrect(value);
            if (value == Infinity) value = 10000;
            if (setInput) document.querySelector<HTMLInputElement>("#slider_range" + name).value = value.toString();
        }
        else if (slider.type == "boolean") {
            if (setInput) document.querySelector<HTMLInputElement>("#slider_boolean_" + name).checked = value as boolean;
        }
        else if (slider.type == "string") {
            if (setInput) document.querySelector<HTMLInputElement>("#slider_string_" + name).value = value as string;
        }
        else if (slider.type == "color") {
            let sliderDisplay = document.querySelector("#slider_value" + name);
            sliderDisplay.textContent = value as string;
            //@ts-ignore
            sliderDisplay.style.backgroundColor = value as string;
            if (typeof value == "number") {
                if (setInput) document.querySelector<HTMLInputElement>("#slider_transparency_" + name).value = value.toString();
            }
            else if (setInput) {
                document.querySelector<HTMLInputElement>("#slider_color_" + name).value = value as string;
            }
        }

    }

    setObj = (obj: Object) => {
        this.curObj = obj;
        this.curType = obj.getType();
        this.curState = obj.getProperties();
        this.generateHTML();
        this.show();
    }

    deleteElement = () => {
        if (!this.curObj) return;
        this.scene.removeObject(this.curObj);
        this.hide();
    }

}
