import PointCharge from "./charges/point_charge";
import InfinitePlane from "./charges/infinite_plane";
import Conductor from "./charges/conductor";
import FiniteLine from "./charges/finite_line";
import { SolidCharge } from "./charges/solid_charge";
import Vector from "./vector";
import constants from "./constants";
import { Object, ObjectTypes } from "./base";
import Scene from "./scene";


interface Slider {
    name: string;
    type: "vector" | "number" | "boolean";
    min?: number | Vector;
    max?: number | Vector;
    step?: number;
    for?: ObjectTypes;
    unit?: string;
}
const sliders: Slider[] = [

    //Universal
    {
        "name": "position",
        "type": "vector", "unit": "m",
        "min": new Vector(-20, -20), "max": new Vector(20, 20), "step": 0.1,
        "for": "all",
    },
    {
        "name": "velocity",
        "type": "vector", "unit": "m/s",
        "min": new Vector(-1, -1), "max": new Vector(1, 1), "step": 0.1,
        "for": "all",
    },
    {
        "name": "rotation",
        "type": "number", "unit": "rad",
        "min": -Math.PI, "max": Math.PI, "step": 0.1,
        "for": "all",
    },
    {
        "name": "angular_velocity",
        "type": "number", "unit": "rad/s",
        "min": -1.7, "max": 1.7, "step": 0.1,
        "for": "all",
    },
    {
        "name": "mass",
        "type": "number", "unit": "kg",
        "min": -10, "max": 10, "step": 0.1,
        "for": "all",
    },

    //Point charge
    {
        "name": "charge",
        "type": "number", "unit": "μC",
        "min": -10, "max": 10, "step": 0.1,
        "for": "point_charge",
    },

    //Finite line
    {
        "name": "length",
        "type": "number",
        "min": 0, "max": 10, "step": 0.1,
        "for": "finite_line",
        "unit": "m",
    },
    {
        "name": "charge_density",
        "type": "number",
        "min": -1.5, "max": 1.5, "step": 0.05,
        "for": "finite_line",
        "unit": "μC/m",
    },

    //Infinite Plane
    {
        "name": "charge_density",
        "type": "number",
        "min": -1.5, "max": 1.5, "step": 0.05,
        "for": "infinite_plane",
        "unit": "μC/m²",
    },

];
export default class ObjEditor {
    element: HTMLElement;
    curObj?: Object;
    curType?: string;
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
            let id = sliders.findIndex((slider) => slider.name == i);
            let html = `<div class="input_slider slider_${i}">`;
            html += `<div class="input_slider_name">${sliders[id].name}</div>`;
            html += `<div class="input_slider_display">
                <span class="slider_value" id="slider_value${i}">${this.curState[i].toString()}</span>
                <span class="slider_units">${sliders[id].unit}</span></div>`;
            //Number sliders
            if (sliders[id].type == "number") {
                html += `
                    <div class="input_slider_range">
                        <input id="slider_range${i}" type="range" min="${sliders[id].min}" max="${sliders[id].max}" value="${(this.curState[i] as number).toString()}" step="${sliders[id].step}" oninput="scene.objEditor.input('${i}',this.value)"/></div>
                `;
            }
            //Vector inputs
            else if (sliders[id].type == "vector") {
                html += `
                    <div class="input_slider_vector">
                        <input id="range_x${i}" type="range" min="${(sliders[id].min as Vector).x}" max="${(sliders[id].max as Vector).x}" step="${sliders[id].step}" value="${(this.curState[i] as Vector).x}" oninput="scene.objEditor.input('${i}_x',this.value)"/>
                        <input id="range_y${i}" type="range" min="${(sliders[id].min as Vector).y}" max="${(sliders[id].max as Vector).y}" step="${sliders[id].step}" value="${(this.curState[i] as Vector).y}" oninput="scene.objEditor.input('${i}_y',this.value)"/>
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
    input = (name: string, value: number) => {
        value = Number(value);
        if (!this.curObj) return;
        if (name.startsWith("position")) {
            console.log(name, value);
            if (name == "position_x") this.curObj.position.x = value;
            if (name == "position_y") this.curObj.position.y = value;
            this.updateDisplay("position", this.curObj.position);
            return;
        }
        else if (name.startsWith("velocity")) {
            if (name == "velocity_x") this.curObj.velocity.x = value;
            if (name == "velocity_y") this.curObj.velocity.y = value;
            this.updateDisplay("velocity", this.curObj.velocity);
            return;
        }
        else if (name == "rotation") this.curObj.rotation = value;
        else if (name == "angular_velocity") this.curObj.angularVelocity = value;
        else if (name == "mass") this.curObj.mass = value as number;
        else if (name == "charge") (this.curObj as PointCharge).charge = value;
        else if (name == "length") (this.curObj as FiniteLine).length = value;
        else if (name == "charge_density") {
            if (this.curType == "finite_line") (this.curObj as FiniteLine).chargeDensity = value;
            else if (this.curType == "infinite_plane") (this.curObj as InfinitePlane).chargeDensity = value;
        }
        this.scene.updateObjects();
        this.updateDisplay(name, value, false);
    }
    updateDisplay = (name: string, value: number | Vector, setInput: boolean = true) => {
        //Update interface display
        if (value instanceof Vector) {
            if (setInput) document.querySelector<HTMLInputElement>("#range_x" + name).value = value.x.toString();
            if (setInput) document.querySelector<HTMLInputElement>("#range_y" + name).value = value.y.toString();
            document.querySelector("#slider_value" + name).innerHTML = value.toString();
        }
        else if (typeof value == "number") {
            if (setInput) document.querySelector<HTMLInputElement>("#slider_range" + name).value = value.toString();
            document.querySelector("#slider_value" + name).innerHTML = value.toString();
        }

    }

    setObj = (obj: Object) => {
        this.curObj = obj;
        this.curType = obj.getType();
        this.curState = {};
        //Update curState to match sliders
        for (let i = 0; i < sliders.length; i++) {
            let slider = sliders[i];
            if (slider.for == "all" || slider.for == this.curType) {
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
                    else if (this.curType == "infinite_plane") this.curState[slider.name] = (obj as InfinitePlane).chargeDensity;
                }
            }
        }
        this.generateHTML();
    }



}
