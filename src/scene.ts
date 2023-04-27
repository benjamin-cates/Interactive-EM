import { Object, ObjectTypes } from "./base";
import Conductor from "./conductors/conductor";
import FiniteLine from "./charges/finite_line";
import InfinitePlane from "./charges/infinite_plane";
import PointCharge from "./charges/point_charge";
import Triangle from "./charges/triangle";
import RingConductor from "./conductors/ring";
import LineConductor from "./conductors/line";
import Vector from "./vector";
import Equipotential from "./equipotential";
import ObjEditor from "./object_editor";
import forceOn from "./force_on";
import Properties from "./properties";

export default class Scene {
    static parameters = {
        viewportHeight: 10,
        physicsPerSecond: 150,
        conductionPerSecond: 20,
        timeSpeed: 30,
        showGridLines: true,
        vectorGridSpacing: 1.2,
        vectorGridLength: 0.8,
        showVectorGrid: true,
        debugField: false,
    };
    static colors = {
        background: "#ffffff",
        gridLines: "#00000011",
        neutral: "#862277ff",
        positive: "#e51818ff",
        negative: "#2929cfff",
        equipotential: "#2ec82ec0",
        fieldLines: "#ccccccff",
    }
    updateProperty = (property: string, value: any) => {
        const colorToArray = (color: string) => {
            let col = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16), parseInt(color.slice(7, 9), 16)];
            col = col.map(x => x / 255);
            return col;
        }
        if (property == "viewportHeight") {
            Scene.parameters.viewportHeight = value as number;
            this.updateAspectRatio();
        }
        else if (property == "vectorGridSpacing") Scene.parameters.vectorGridSpacing = value as number;
        else if (property == "vectorGridLength") Scene.parameters.vectorGridLength = value as number;
        else if (property == "showVectorGrid") Scene.parameters.showVectorGrid = value as boolean;
        else if (property == "showGridLines") Scene.parameters.showGridLines = value as boolean;
        else if (property == "timeScale") Scene.parameters.timeSpeed = value as number;
        else if (property == "equipotentialColor") {
            let v = value as string;
            Scene.colors.equipotential = v;
            this.voltCanvas.setColors({ equipotential_color: colorToArray(v) });
        }
        else if (property == "negativeColor") {
            let v = value as string;
            Scene.colors.negative = v;
            this.voltCanvas.setColors({ negative_color: colorToArray(v) });
        }
        else if (property == "positiveColor") {
            let v = value as string;
            Scene.colors.positive = v;
            this.voltCanvas.setColors({ positive_color: colorToArray(v) });
        }
        else if (property == "neutralColor") {
            let v = value as string;
            Scene.colors.neutral = v;
            this.voltCanvas.setColors({ neutral_color: colorToArray(v) });
        }
        else if (property == "fieldLineColor") Scene.colors.fieldLines = value as string;
        else if (property == "objects") {
            this.objects = value as Object[];
            this.updateObjects();
        }
    }
    getProperties = () => {
        return {
            viewportHeight: Scene.parameters.viewportHeight,
            vectorGridSpacing: Scene.parameters.vectorGridSpacing,
            vectorGridLength: Scene.parameters.vectorGridLength,
            showVectorGrid: Scene.parameters.showVectorGrid,
            showGridLines: Scene.parameters.showGridLines,
            equipotentialColor: Scene.colors.equipotential,
            positiveColor: Scene.colors.positive,
            negativeColor: Scene.colors.negative,
            neutralColor: Scene.colors.neutral,
            fieldLineColor: Scene.colors.fieldLines,
            timeScale: Scene.parameters.timeSpeed,
            objects: this.objects
        }

    }
    static chargeColor = (charginess: number) => {
        let percent = 1 / (1 + Math.exp(-charginess));
        return "#" + Math.round(255 * percent).toString(16).padStart(2, "0") + "00" + Math.round(255 * (1 - percent)).toString(16).padStart(2, "0");
    }
    static getChargeColor(charge: number) {
        if (charge < 0) return Scene.colors.negative;
        if (charge > 0) return Scene.colors.positive;
        return Scene.colors.neutral;
    }
    objects: Object[];
    width: number;
    height: number;
    element: HTMLCanvasElement;
    voltCanvas: Equipotential;
    objEditor: ObjEditor;
    context: CanvasRenderingContext2D;
    physicsInterval: number;
    renderIndex: number = 0;
    constructor(element: HTMLCanvasElement, voltCanvas: HTMLCanvasElement, objectEditor: HTMLElement) {
        this.objects = [] as Object[];
        this.element = element;
        this.context = element.getContext("2d");
        this.voltCanvas = new Equipotential(voltCanvas);
        this.updateAspectRatio();
        this.render();
        //Create physics interval
        this.physicsInterval = window.setInterval(this.physics, 1000 / Scene.parameters.physicsPerSecond, 1 / Scene.parameters.physicsPerSecond);
        //Create object editor
        this.objEditor = new ObjEditor(objectEditor, this);
    }
    getType = () => "scene";

    updateAspectRatio = () => {
        //Resize object canvas
        let aspectRatio = window.innerWidth / window.innerHeight;
        this.height = Scene.parameters.viewportHeight * 2;
        this.width = aspectRatio * this.height;
        this.element.width = window.innerWidth;
        this.element.height = window.innerHeight;
        this.context.resetTransform();
        //Translate and scale object canvas
        this.context.translate(window.innerWidth / 2, window.innerHeight / 2);
        let scale = window.innerHeight / 2 / Scene.parameters.viewportHeight / 100;
        this.context.scale(scale, scale);
        //Resize voltage canvas
        this.voltCanvas.resize(this.width, this.height);
        //Fix font settings
        this.context.font = "bold 30px Lato";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
    }

    getCursorPosition = (event: MouseEvent): Vector => {
        //Adjust relative to center of canvas
        let rect = this.element.getBoundingClientRect();
        let x = event.clientX - rect.left - rect.width / 2;
        let y = event.clientY - rect.top - rect.height / 2;
        //Adjust for scaling between screen space and canvas space
        let aspectRatio = rect.width / rect.height;
        return new Vector(x / rect.width * 2 * Scene.parameters.viewportHeight * aspectRatio, y / rect.height * 2 * Scene.parameters.viewportHeight);
    }
    pushObject(object: Object) {
        this.objects.push(object);
        this.updateObjects();
    }
    //Default objects defined in onload at the bottom
    static defaultObjects: { [key: string]: Object };
    pushDefaultObject = (type: ObjectTypes) => {
        let obj = Scene.defaultObjects[type].clone();
        obj.updateProperty("position", new Vector(Math.random() * 6 - 3, Math.random() * 6 - 3));
        this.pushObject(obj);
    }
    updateObjects() {
        this.voltCanvas.updateObjects(this.objects);
    }
    removeObject(object: Object) {
        this.objects.splice(this.objects.indexOf(object), 1);
        this.updateObjects();
    }
    render = () => {
        this.renderIndex++;
        //Setup next render frame
        requestAnimationFrame(this.render);
        //Clear screen
        this.context.clearRect(-100 * this.width, -100 * this.height, this.width * 200, this.height * 200);

        this.voltCanvas.fullscreenRender();

        if (Scene.parameters.showGridLines)
            this.renderGridLines();
        if (Scene.parameters.showVectorGrid)
            this.renderVectorField();

        //Render each object
        this.objects.forEach((object) => {
            object.render(this.context);
        });
    }
    renderGridLines = () => {
        this.context.lineWidth = 4.0;
        this.context.strokeStyle = Scene.colors.gridLines;
        this.context.beginPath();
        //Draw vertical lines
        for (let i = Math.floor(-this.width); i < this.width; i++) {
            this.context.moveTo(i * 100, -this.height * 100);
            this.context.lineTo(i * 100, this.height * 100);
        }
        //Draw horizontal lines
        for (let i = Math.floor(-this.height); i < this.height; i++) {
            this.context.moveTo(-this.width * 100, i * 100);
            this.context.lineTo(this.width * 100, i * 100);
        }
        this.context.stroke();
        this.context.closePath();
    }
    vectorFieldCache: Vector[][] = [];
    renderVectorField = () => {
        //Skip if alpha is zero
        if (Scene.colors.fieldLines.slice(7, 9) == "00") return;
        this.context.strokeStyle = Scene.colors.fieldLines;
        this.context.lineCap = "round";
        let horArrowCount = Math.floor((this.width / 2) / Scene.parameters.vectorGridSpacing);
        let verArrowCount = Math.floor((this.height / 2) / Scene.parameters.vectorGridSpacing);
        //Determine whether to use cache
        let useCache = this.renderIndex % 2 == 0 && this.vectorFieldCache.length > 0;
        if (!useCache) this.vectorFieldCache = [];

        //Sort field vectors by thickness so they can be batch drawn
        let byThickness = [[], [], [], [], [], [], [], [], [], [], [], []];
        for (let i = -horArrowCount; i <= horArrowCount; i++) {
            if (!useCache) this.vectorFieldCache[i + horArrowCount] = [];
            for (let j = -verArrowCount; j <= verArrowCount; j++) {
                //Determine position of grid point
                let pos = new Vector(i * Scene.parameters.vectorGridSpacing, j * Scene.parameters.vectorGridSpacing);
                //If not using cache, update cache
                if (!useCache) this.vectorFieldCache[i + horArrowCount][j + verArrowCount] = this.fieldAt(pos);
                //Set field to cache
                let field = this.vectorFieldCache[i + horArrowCount][j + verArrowCount];
                let fieldMag = field.magnitude();
                //If field is large enough, add to batch by thickness
                if (fieldMag > 0.0003) {
                    let len = Scene.parameters.vectorGridLength * (1 / (1 + Math.exp(-fieldMag * 1000)) - 0.5);
                    if (Scene.parameters.debugField) len = 1;
                    //Thickness = 0.2 * length
                    let size = Math.abs(len) * 0.2 * 100;
                    byThickness[Math.floor(size)].push({ pos: pos, field: field, fieldMag: fieldMag, len: len });
                }
            }
        }
        //Draw each set of vectors by their thickness
        for (let i = 0; i < byThickness.length; i++) {
            if (byThickness[i].length == 0) continue;
            this.context.lineWidth = i;
            this.context.beginPath();
            for (let j = 0; j < byThickness[i].length; j++) {
                let arrow = byThickness[i][j];
                this.drawFieldArrow(arrow.pos, arrow.field, arrow.fieldMag, arrow.len);
            }
            this.context.stroke();
            this.context.closePath();
        }
    }
    private drawFieldArrow(pos: Vector, field: Vector, fieldMag: number, len: number) {
        pos.scale(100);
        let fieldEnd = Vector.add(pos, Vector.multiply(field, 100 * len / fieldMag));
        //Calculate vectors along and perpendicular to the field (to get position of head tips)
        let scale = len / fieldMag * 100 / 5;//One fifth of a unit long
        let normal = new Vector(-field.y * scale, field.x * scale);
        let along = new Vector(field.x * scale, field.y * scale);
        //Body of arrow
        this.context.moveTo(pos.x, pos.y);
        this.context.lineTo(fieldEnd.x, fieldEnd.y);
        //Head of arrow
        this.context.moveTo(fieldEnd.x, fieldEnd.y);//Prevents asymmetrical arrow head
        this.context.lineTo(fieldEnd.x - along.x + normal.x, fieldEnd.y - along.y + normal.y);
        this.context.moveTo(fieldEnd.x, fieldEnd.y);
        this.context.lineTo(fieldEnd.x - along.x - normal.x, fieldEnd.y - along.y - normal.y);
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
    physicsFrameCount: number = 0;
    physics = (dt: number) => {
        this.physicsFrameCount++;
        //Apply forces every 4 physics updates
        let isFullPhysics = this.physicsFrameCount % 4 == 0;
        this.objects.forEach((object) => {
            if (object instanceof Conductor) {
                let physicsPerConduct = Math.floor(Scene.parameters.physicsPerSecond / Scene.parameters.conductionPerSecond);
                if (this.physicsFrameCount % physicsPerConduct == 0)
                    object.conduct();
            }
            object.incrementPosition(dt);
            if (isFullPhysics) {
                //Apply forces
                if (object.mass != Infinity && Scene.parameters.timeSpeed != 0) {
                    let net = forceOn(object, this, 20);
                    let acceleration = Vector.multiply(net.force, Scene.parameters.timeSpeed * dt / object.mass);
                    let angularAcceleration = net.torque * Scene.parameters.timeSpeed * dt / object.momentOfInertia();
                    object.velocity.add(acceleration);
                    object.angularVelocity += angularAcceleration;
                    if (object == this.selected.obj) {
                        this.objEditor.updateDisplay("velocity", object.velocity);
                        this.objEditor.updateDisplay("angularVelocity", object.angularVelocity);
                    }
                }

                //Destroy objects that are more than 100 units away
                if (object.position.x > 100 || object.position.x < -100 || object.position.y > 100 || object.position.y < -100) {
                    this.removeObject(object);
                    return;
                }
                //Update object editor if selected
                if (object == this.selected.obj) {
                    this.objEditor.updateDisplay("position", object.position);
                    this.objEditor.updateDisplay("rotation", object.rotation);
                }
            }
        });
        //Update objects in the voltage canvas
        this.updateObjects();
    }

    getSceneURL = () => {
        let baseURL = window.location.href;
        if (baseURL.includes("?")) baseURL = baseURL.substring(0, baseURL.indexOf("?"));
        if (baseURL.includes("#")) baseURL = baseURL.substring(0, baseURL.indexOf("#"));
        let scene = Properties.stringify({ objects: this.objects, timeSpeed: Scene.parameters.timeSpeed, viewportHeight: Scene.parameters.viewportHeight });
        return baseURL + "?scene=" + encodeURIComponent(scene);
    }

    parseURLArguments = (args: string) => {
        //Remove trailing fragment identifier
        args = args.split("#")[0];
        let argList = args.split("&");
        argList.forEach(arg => {
            let eqPos = arg.indexOf("=");
            let name = arg.slice(0, eqPos);
            let value = arg.slice(eqPos + 1);

            if (name == "scene") {
                let newScene = Properties.parse(decodeURIComponent(value));
                this.objects = newScene.objects as Object[];
                if (newScene.timeSpeed != undefined) Scene.parameters.timeSpeed = newScene.timeSpeed as number;
                if (newScene.viewportHeight != undefined) Scene.parameters.viewportHeight = newScene.viewportHeight as number;
                this.updateAspectRatio();
                this.selected.obj = null;
            }
        });
    }

    private selected: {
        obj?: Object;

        //History of the past five mouse events for dragging
        dragPositions: Vector[];
        //History of the past five mouse event times
        dragTime: number[];
        posOffset: Vector;
        //If being dragged
        isGrab: boolean;
        pointerId: number;
    } = { dragPositions: [Vector.origin()], obj: null, dragTime: [0], posOffset: null, isGrab: false, pointerId: null };

    mouseDown = (event: PointerEvent) => {
        //Return if within the bounding box
        let objEditorRect = this.objEditor.element.getBoundingClientRect();
        if (event.clientX > objEditorRect.left && event.clientY < objEditorRect.bottom && event.clientY > objEditorRect.top) return;
        //Get drag position of current cursor
        this.selected.dragPositions = [this.getCursorPosition(event)];
        this.selected.dragTime = [new Date().getTime()];
        this.selected.pointerId = event.pointerId;
        //Test if each object is being clicked
        for (let i = 0; i < this.objects.length; i++) {
            if (this.objects[i].distanceFrom(this.selected.dragPositions[0]) < 0.5) {
                this.selected.obj = this.objects[i];
                this.selected.obj.updateProperty("velocity", Vector.origin());
                this.objEditor.setObj(this.objects[i])
                this.selected.isGrab = true;
                this.selected.posOffset = Vector.subtract(this.selected.obj.position, this.selected.dragPositions[0]);
                return;
            }
        }
        this.objEditor.hide();
    }

    mouseMove = (event: PointerEvent) => {
        if (this.selected.isGrab == false)
            return;
        if (event.pointerId != this.selected.pointerId) return;
        let pos = this.getCursorPosition(event);
        this.selected.dragPositions.push(pos);
        pos = Vector.add(pos, this.selected.posOffset);
        if (this.selected.dragPositions.length >= 5) {
            this.selected.dragPositions.shift();
            this.selected.dragTime.shift();
        }
        //Update position
        this.selected.obj.updateProperty("position", pos);
        this.selected.obj.updateProperty("velocity", Vector.origin());
        this.objEditor.updateDisplay("position", pos);
        this.updateObjects();
        //Push most recent drag time
        this.selected.dragTime.push(new Date().getTime());
    }

    mouseUp = (event: PointerEvent) => {
        if (this.selected.isGrab == false)
            return;
        if (event.pointerId != this.selected.pointerId) return;
        this.selected.isGrab = false;
        if (this.selected.obj.getType() == "infinite_plane") return;
        let pos = this.getCursorPosition(event);
        if (new Date().getTime() - this.selected.dragTime[this.selected.dragTime.length - 1] < 40) {
            let dt = new Date().getTime() - this.selected.dragTime[0];
            let dx = Vector.add(pos, Vector.multiply(this.selected.dragPositions[0], -1));
            //Set new velocity if greater than 0.6 m/s
            if (dx.magnitude() / (dt / 1000) > 0.6) this.selected.obj.updateProperty("velocity", Vector.multiply(dx, 1000 / dt));
            //Else set to zero
            else this.selected.obj.updateProperty("velocity", Vector.origin());
        }
        else this.selected.obj.updateProperty("velocity", Vector.origin());
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
    Scene.defaultObjects = {
        "point_charge": new PointCharge({}),
        "infinite_plane": new InfinitePlane({ chargeDensity: 20 }),
        "finite_line": new FiniteLine({ chargeDensity: 0.4, length: 10 }),
        "triangle": new Triangle({ chargeDensity: 1, p1: new Vector(0, 0), p2: new Vector(0, 1), p3: new Vector(1, 0) }),
        //@ts-ignore
        "ring_conductor": new RingConductor({ radius: 2, scene: window.scene, skipMatrixCreation: true }),
        //@ts-ignore
        "line_conductor": new LineConductor({ length: 5, scene: window.scene, skipMatrixCreation: true }),
    };
    scene.updateObjects();
    window.addEventListener("pointerdown", scene.mouseDown);
    window.addEventListener("pointerup", scene.mouseUp);
    window.addEventListener("pointermove", scene.mouseMove);
    if (window.location.href.includes("?")) {
        let url = window.location.href;
        scene.parseURLArguments(url.substring(url.indexOf("?") + 1))

    }
});
window.addEventListener("resize", () => {
    scene.updateAspectRatio();
});

//@ts-ignore
window.showMessage = (message: string,len: number=500) => {
    let messageElement = document.querySelector("#message");
    //@ts-ignore
    messageElement.style.transition = "none";
    //@ts-ignore
    messageElement.style.opacity = "1";
    messageElement.textContent = message;
    messageElement.clientWidth;
    if(len == Infinity) return;
    //@ts-ignore
    messageElement.style.transition = `opacity ${len}ms ease 0.6s`;
    //@ts-ignore
    messageElement.style.opacity = "0";
}

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
//@ts-ignore
window.Properties = Properties;
