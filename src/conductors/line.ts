import { Object, ObjectTypes } from "../base";
import Conductor from "./conductor";
import Vector from "../vector";
import Constants from "../constants";
import Scene from "../scene";

export default class LineConductor extends Conductor {
    length: number;
    private startPoint: Vector;
    private endPoint: Vector;
    constructor(properties: { [key: string]: number | Vector | Vector[] | Scene }) {
        let length = properties.length as number || 1;
        let pointCount = Math.floor(length * 4);
        let separation = length / (pointCount - 1);
        let points = [];
        let testPoints = [];
        for (let i = 0; i < pointCount; i++) {
            points.push(new Vector(i * separation - length / 2, 0));
            testPoints.push(new Vector((i + 0.00) * separation - length / 2, -0.1));
            testPoints.push(new Vector((i + 0.00) * separation - length / 2, 0.1));
            if (i != pointCount - 1) {
                testPoints.push(new Vector((i + 0.33) * separation - length / 2, -0.05));
                testPoints.push(new Vector((i + 0.33) * separation - length / 2, 0.05));
                testPoints.push(new Vector((i + 0.66) * separation - length / 2, 0.05));
                testPoints.push(new Vector((i + 0.66) * separation - length / 2, -0.05));
            }
        }
        properties.points = points;
        properties.testPoints = testPoints;
        super(properties);
        this.length = length;
        let dir = new Vector(Math.cos(this.rotation), Math.sin(this.rotation));
        this.startPoint = Vector.add(this.position, Vector.multiply(dir, -this.length / 2));
        this.endPoint = Vector.add(this.position, Vector.multiply(dir, this.length / 2));
    }

    clone = () => new LineConductor({ mass: this.mass, position: this.position.copy(), rotation: this.rotation, length: this.length, scene: this.sceneRef, netCharge: this.netCharge, angularVelocity: this.angularVelocity, velocity: this.velocity.copy() });
    render = (ctx: CanvasRenderingContext2D) => {
        //Draw ring
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 30;
        ctx.lineCap = "round";
        ctx.beginPath();
        let dir = new Vector(1, 0);
        dir.rotate(this.rotation);
        ctx.moveTo((this.position.x - dir.x * this.length / 2) * 100, (this.position.y - dir.y * this.length / 2) * 100);
        ctx.lineTo((this.position.x + dir.x * this.length / 2) * 100, (this.position.y + dir.y * this.length / 2) * 100);
        ctx.stroke();
        ctx.closePath();
        //Draw charges along edge
        ctx.lineWidth = 10;
        ctx.lineCap = "butt";
        let step = this.length / this.points.length;
        for (let i = 0; i < this.points.length; i++) {
            ctx.strokeStyle = Scene.chargeColor(this.charges[i] * this.points.length * 0.1);
            ctx.beginPath();
            ctx.moveTo((this.position.x - dir.x * this.length / 2 + dir.x * step * i) * 100, (this.position.y - dir.y * this.length / 2 + dir.y * step * i) * 100);
            ctx.lineTo((this.position.x - dir.x * this.length / 2 + dir.x * step * (i + 1)) * 100, (this.position.y - dir.y * this.length / 2 + dir.y * step * (i + 1)) * 100);
            ctx.stroke();
            ctx.closePath();
        }
    }

    updateProperty = (property: string, value: number | Vector) => {
        let updateEndPoints = false;
        if (property == "length") {
            this.length = value as number;
            let next = this.clone();
            this.charges = next.charges;
            this.points = next.points;
            this.testPoints = next.testPoints;
            this.matrix = next.matrix;
            this.updateWorldSpace();
            updateEndPoints = true;
            this.conduct();
        }
        else if (property == "netCharge") {
            this.netCharge = value as number;
            this.conduct();
        }
        else if (property == "position") {
            this.position = value as Vector;
            this.updateWorldSpace();
            updateEndPoints = true;
        }
        else if (property == "rotation") {
            this.rotation = value as number;
            this.updateWorldSpace();
            updateEndPoints = true;
        }
        else this.updateBaseProperty(property, value);
        if (updateEndPoints) {
            let dir = new Vector(Math.cos(this.rotation), Math.sin(this.rotation));
            this.startPoint = Vector.add(this.position, Vector.multiply(dir, -this.length / 2));
            this.endPoint = Vector.add(this.position, Vector.multiply(dir, this.length / 2));
        }
    }
    distanceFrom = (pos: Vector) => {
        if (this.length == 0) return Vector.distance(pos, this.position);
        let t = Vector.dot(Vector.subtract(pos, this.endPoint), Vector.subtract(this.startPoint, this.endPoint)) / this.length / this.length;
        t = Math.max(0, Math.min(1, t));
        return Vector.distance(pos, Vector.add(this.endPoint, Vector.multiply(Vector.subtract(this.startPoint, this.endPoint), t)));
    }
    getType = (): ObjectTypes => "line_conductor";
}