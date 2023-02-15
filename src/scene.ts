import Object from "./base";
import Conductor from "./charges/conductor";
import FiniteLine from "./charges/finite_line";
import InfinitePlane from "./charges/infinite_plane";
import PointCharge from "./charges/point_charge";
import Vector from "./vector";
import Equipotential from "./equipotential";


export default class Scene {
    static parameters = {
        viewportHeight: 10,
        physicsPerSecond: 100,
        timeSpeed: 1,
        showGridLines: true,
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
    physicsPerSecond: number;
    element: HTMLCanvasElement;
    voltCanvas: Equipotential;
    context: CanvasRenderingContext2D;
    constructor(element: HTMLCanvasElement, voltCanvas: HTMLCanvasElement) {
        this.objects = [];
        this.element = element;
        this.context = element.getContext("2d");
        this.voltCanvas = new Equipotential(voltCanvas);
        this.updateAspectRatio();
        this.sceneDefaults();
        this.render();
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
        return new Vector(x / this.element.width * 2 * Scene.parameters.viewportHeight * aspectRatio, -y / this.element.height * 2 * Scene.parameters.viewportHeight);
    }
    pushObject(object: Object) {
        this.objects.push(object);
        this.updateObjects();
    }
    updateObjects() {
        this.voltCanvas.updateObjects(this.objects);
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
        //Render each object
        this.objects.forEach((object) => {
            object.render(this.context);
        });
    }
    fieldAt = (pos: Vector): Vector => {
        let out = Vector.origin();
        this.objects.forEach((object) => {
            out.add(object.fieldAt(pos));
        });
        return out;
    }

    voltageAt = (pos: Vector): number => {
        let potential = 0;
        this.objects.forEach((object) => {
            potential += object.voltageAt(pos);
        });
        return potential;
    }
    physics(dt: number) {
        this.objects.forEach((object) => {
            object.incrementPosition(dt);
        });
    }

    //Returns the force and torque between two objects. Force is measured on object a and the opposite directional force is on object b. Torque is measured for both from the midpoint of a.position and b.position. Use the parallel axis theorem to find the torque on an objects center of mass.
    forceBetween = (a: Object, b: Object): { force: Vector, torque: number } => {
        if (a instanceof PointCharge) {

        }
        return { force: Vector.origin(), torque: 0 };
    }

}

var scene: Scene;
document.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let voltCanvas = document.getElementById("volt_canvas") as HTMLCanvasElement;
    scene = new Scene(canvas, voltCanvas);
    //@ts-ignore
    window.scene = scene;
    scene.objects.push(new PointCharge(1, 1, new Vector(10, 5)));
    //scene.objects.push(new PointCharge(-1, 1, new Vector(1, 0)));
    //scene.objects.push(new PointCharge(-1, 1, new Vector(1, 1)));
    scene.objects.push(new FiniteLine(0.4, 1, new Vector(0, 0), 0, 10));
    scene.objects.push(new FiniteLine(-0.4, 1, new Vector(0, 4), 0, 10));
    //scene.objects.push(new FiniteLine(-3, 1, new Vector(2, 4), 0.1, 4));
    //scene.objects.push(new FiniteLine(5, 1, new Vector(4, 4), 0.1, 4));
    //scene.objects.push(new InfinitePlane(-5, 1, new Vector(6, -4), -0.4));
    scene.updateObjects();
});
window.addEventListener("resize", () => {
    scene.updateAspectRatio();
    scene.sceneDefaults();
});
window.addEventListener("click", (e) => {
    console.log(scene.getCursorPosition(e as MouseEvent).toString());
});

