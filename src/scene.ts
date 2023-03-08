import { Object, ObjectTypes } from "./base";
import Conductor from "./charges/conductor";
import FiniteLine from "./charges/finite_line";
import InfinitePlane from "./charges/infinite_plane";
import PointCharge from "./charges/point_charge";
import Triangle from "./charges/triangle";
import Vector from "./vector";
import Equipotential from "./equipotential";
import ObjEditor from "./object_editor";


export default class Scene {
    static parameters = {
        viewportHeight: 10,
        physicsPerSecond: 100,
        timeSpeed: 1,
        showGridLines: true,
        showVectorGrid: true,
        debugField: false,
    };
    static colors = {
        background: "#ffffff",
        gridLines: "#666666",
        neutral: "#000000",
        positive: "#ff0000",
        negative: "#0000ff",
        equipotential: "#ff0000",
        fieldLines: "#cccccc",
    }
    static getChargeColor(charge: number) {
        if (charge < 0) return Scene.colors.negative;
        if (charge > 0) return Scene.colors.positive;
        return Scene.colors.neutral;
    }
    objects: Object[];
    timeSpeed: number;
    width: number;
    height: number;
    element: HTMLCanvasElement;
    voltCanvas: Equipotential;
    objEditor: ObjEditor;
    context: CanvasRenderingContext2D;
    physicsInterval: number;
    constructor(element: HTMLCanvasElement, voltCanvas: HTMLCanvasElement, objectEditor: HTMLElement) {
        this.objects = [] as Object[];
        this.element = element;
        this.context = element.getContext("2d");
        this.voltCanvas = new Equipotential(voltCanvas);
        this.updateAspectRatio();
        this.sceneDefaults();
        this.render();
        this.physicsInterval = window.setInterval(this.physics, 1000 / Scene.parameters.physicsPerSecond, 1 / Scene.parameters.physicsPerSecond);
        this.objEditor = new ObjEditor(objectEditor, this);
    }

    updateAspectRatio = () => {
        let aspectRatio = window.innerWidth / window.innerHeight;
        this.height = Scene.parameters.viewportHeight * 2;
        this.width = aspectRatio * this.height;
        this.element.width = window.innerWidth;
        this.element.height = window.innerHeight;
        this.context.resetTransform();
        this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
        let scale = window.innerHeight / 2 / Scene.parameters.viewportHeight / 100;
        this.context.scale(scale, scale);
        this.voltCanvas.resize(this.width, this.height);
    }

    sceneDefaults = () => {
        this.context.font = "bold 30px Lato";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
    }

    getCursorPosition = (event: MouseEvent): Vector => {
        let rect = this.element.getBoundingClientRect();
        let x = event.clientX - rect.left - this.element.width / 2;
        let y = event.clientY - rect.top - this.element.height / 2;
        let aspectRatio = this.element.width / this.element.height;
        return new Vector(x / this.element.width * 2 * Scene.parameters.viewportHeight * aspectRatio, y / this.element.height * 2 * Scene.parameters.viewportHeight);
    }
    pushObject(object: Object) {
        this.objects.push(object);
        this.updateObjects();
    }
    static defaultObjects: { [key: string]: Object } = {
        "point_charge": new PointCharge(1, 1, new Vector(0, 0)),
        "infinite_plane": new InfinitePlane(0.02, 1, new Vector(0, 0)),
        "finite_line": new FiniteLine(0.4, 1, new Vector(0, 0), 0, 10),
    };
    pushDefaultObject = (type: ObjectTypes) => {
        this.pushObject(Scene.defaultObjects[type].clone());
    }
    updateObjects() {
        this.voltCanvas.updateObjects(this.objects);
    }
    removeObject(object: Object) {
        this.objects.splice(this.objects.indexOf(object), 1);
        this.updateObjects();
    }
    render = () => {
        //Request next animation frame
        requestAnimationFrame(this.render);
        //Clear rectangle
        this.context.clearRect(-100 * this.width, -100 * this.height, this.width * 200, this.height * 200);
        this.voltCanvas.fullscreenRender();
        //Render grid lines if enabled
        if (Scene.parameters.showGridLines) {
            this.context.lineWidth = 1.5;
            this.context.strokeStyle = Scene.colors.gridLines;
            this.context.beginPath();
            for (let i = Math.floor(-this.width); i < this.width; i++) {
                this.context.moveTo(i * 100, -this.height * 100);
                this.context.lineTo(i * 100, this.height * 100);
            }
            for (let i = Math.floor(-this.height); i < this.height; i++) {
                this.context.moveTo(-this.width * 100, i * 100);
                this.context.lineTo(this.width * 100, i * 100);
            }
            this.context.stroke();
            this.context.closePath();
        }
        if (Scene.parameters.showVectorGrid) {
            //Set stroke color and line cap
            this.context.strokeStyle = Scene.colors.fieldLines;
            this.context.lineCap = "round";
            //Iterate over grid with step size 2
            for (let i = Math.floor(-this.width - 1); i < this.width + 1; i += 2) {
                for (let j = Math.floor(-this.height - 1); j < this.height + 1; j += 2) {
                    //Get field at grid point
                    let pos = new Vector(i, j);
                    let field = this.fieldAt(pos);
                    let fieldMag = field.magnitude();
                    if (fieldMag > 0.0001) {
                        this.context.beginPath();
                        let unit = field.unit();
                        let len = 1 / (1 + Math.exp(-fieldMag * 1000)) - 0.5;
                        if (Scene.parameters.debugField) len = 1;
                        let size = Math.abs(len) * 20;
                        this.context.lineWidth = size;
                        let fieldEnd = Vector.add(pos, Vector.multiply(unit, len));
                        let normal = new Vector(-unit.y * size, unit.x * size);
                        let along = new Vector(unit.x * size, unit.y * size);
                        //Draw arrow shape
                        this.context.moveTo(pos.x * 100, pos.y * 100);
                        this.context.lineTo(fieldEnd.x * 100, fieldEnd.y * 100);
                        this.context.moveTo(fieldEnd.x * 100, fieldEnd.y * 100);
                        this.context.lineTo(fieldEnd.x * 100 - along.x + normal.x, fieldEnd.y * 100 - along.y + normal.y);
                        this.context.moveTo(fieldEnd.x * 100, fieldEnd.y * 100);
                        this.context.lineTo(fieldEnd.x * 100 - along.x - normal.x, fieldEnd.y * 100 - along.y - normal.y);
                        if (Scene.parameters.debugField) {
                            this.context.moveTo(pos.x * 100, pos.y * 100);
                            this.context.lineTo(pos.x * 100 + normal.x, pos.y * 100 + normal.y);
                            this.context.moveTo(pos.x * 100, pos.y * 100);
                            this.context.lineTo(pos.x * 100 - normal.x, pos.y * 100 - normal.y);
                        }
                        this.context.stroke();
                        this.context.closePath();
                    }
                }
            }
        }
        //Render each object
        this.objects.forEach((object) => {
            object.render(this.context);
        });
    }
    fieldAt = (pos: Vector, ignored?: Object): Vector => {
        let out = Vector.origin();
        this.objects.forEach((object) => {
            if (object == ignored) return;
            out.add(object.fieldAt(pos));
        });
        return out;
    }

    voltageAt = (pos: Vector, ignored?: Object): number => {
        let potential = 0;
        this.objects.forEach((object) => {
            if (object == ignored) return;
            potential += object.voltageAt(pos);
        });
        return potential;
    }
    physics = (dt: number) => {
        this.objects.forEach((object) => {
            object.incrementPosition(dt);
            //Destroy objects that are more than 100 units away
            if (object.position.x > 100 || object.position.x < -100 || object.position.y > 100 || object.position.y < -100) {
                this.removeObject(object);
                return;
            }
            if (object == this.selected.obj) {
                this.objEditor.updateDisplay("position", object.position);
                this.objEditor.updateDisplay("rotation", object.rotation);
            }
        });
        this.updateObjects();
    }

    //Returns the force and torque between two objects. Force is measured on object a and the opposite directional force is on object b. Torque is measured for both from the midpoint of a.position and b.position. Use the parallel axis theorem to find the torque on an objects center of mass.
    forceBetween = (a: Object, b: Object): { force: Vector, torque: number } => {
        if (a instanceof PointCharge) {

        }
        return { force: Vector.origin(), torque: 0 };
    }

    private selected: {
        obj?: Object;

        //History of the past ten mouse events for dragging
        dragPositions: Vector[];
        //History of the past ten mouse event times
        dragTime: number[];
        posOffset: Vector;
        //If being dragged
        isGrab: boolean;
    } = { dragPositions: [Vector.origin()], obj: null, dragTime: [0], posOffset: null, isGrab: false }

    mouseDown = (event: MouseEvent) => {
        //Return if within the bounding box
        let objEditorRect = this.objEditor.element.getBoundingClientRect();
        if (event.clientX > objEditorRect.left && event.clientY < objEditorRect.bottom && event.clientY > objEditorRect.top) return;
        //Get drag position of current cursor
        this.selected.dragPositions = [this.getCursorPosition(event)];
        this.selected.dragTime = [new Date().getTime()];
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].distanceFrom(this.selected.dragPositions[0]) < 0.5) {
                this.selected.obj = this.objects[i];
                this.selected.obj.velocity = Vector.origin();
                this.objEditor.setObj(this.objects[i])
                this.selected.isGrab = true;
                this.selected.posOffset = Vector.subtract(this.selected.obj.position, this.selected.dragPositions[0]);
                return;
            }
        }
        this.objEditor.hide();
    }

    mouseMove = (event: MouseEvent) => {
        if (this.selected.isGrab == false)
            return;
        let pos = this.getCursorPosition(event);
        this.selected.dragPositions.push(pos);
        pos = Vector.add(pos, this.selected.posOffset);
        if (this.selected.dragPositions.length >= 10) {
            this.selected.dragPositions.shift();
            this.selected.dragTime.shift();
        }
        this.selected.obj.position = pos;
        this.selected.obj.updatePosition();
        this.objEditor.updateDisplay("position", pos);
        this.updateObjects();
        this.selected.dragTime.push(new Date().getTime());
    }

    mouseUp = (event: MouseEvent) => {
        if (this.selected.isGrab == false)
            return;
        this.selected.isGrab = false;
        if (this.selected.obj.getType() == "infinite_plane") return;
        let pos = this.getCursorPosition(event);
        if (new Date().getTime() - this.selected.dragTime[this.selected.dragTime.length - 1] < 60) {
            let dt = new Date().getTime() - this.selected.dragTime[0];
            let dx = Vector.add(pos, Vector.multiply(this.selected.dragPositions[0], -1));
            this.selected.obj.velocity = Vector.multiply(dx, 1000 / dt);
        }
        else this.selected.obj.velocity = Vector.origin();
        this.objEditor.updateDisplay("velocity", this.selected.obj.velocity);
        this.updateObjects();
    }

}

var scene: Scene;
document.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let voltCanvas = document.getElementById("volt_canvas") as HTMLCanvasElement;
    let objectEditor = document.querySelector("#properties") as HTMLElement;
    scene = new Scene(canvas, voltCanvas, objectEditor);
    //@ts-ignore
    window.scene = scene;
    scene.updateObjects();
    window.addEventListener("mousedown", scene.mouseDown);
    window.addEventListener("mouseup", scene.mouseUp);
    window.addEventListener("mousemove", scene.mouseMove);
});
window.addEventListener("resize", () => {
    scene.updateAspectRatio();
    scene.sceneDefaults();
});

//Export classes
//@ts-ignore
window.Scene = Scene;
//@ts-ignore
window.Base = Object;
//@ts-ignore
window.PointCharge = PointCharge;
//@ts-ignore
window.FiniteLine = FiniteLine;
//@ts-ignore
window.InfinitePlane = InfinitePlane;
//@ts-ignore
window.Vector = Vector;
//@ts-ignore
window.Conductor = Conductor;
