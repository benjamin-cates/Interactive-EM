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
        //Generate charge points and test points in 3d
        let length = properties.length as number ?? 1;
        let pointCount = Math.floor(length * 2.5);
        let separation = length / (pointCount - 1);
        let points = [];
        let testPoints = [];

        for (let i = 0; i < pointCount; i++) {
            let alternate = (1 - 2*(i%2));
            points.push(new Vector((i + 0.00) * separation - length / 2, 0.008 * alternate));
            testPoints.push(new Vector((i + 0.00) * separation - length / 2, -0.008 * alternate));
            testPoints.push(new Vector((i + 0.00) * separation - length / 2, 0));
            if (i != pointCount - 1) {
                testPoints.push(new Vector((i + 0.5) * separation - length / 2, 0));
            }
        }
        properties.points = points;
        properties.testPoints = testPoints;
        properties.zPoints = 4;
        properties.zSpacing = 0.4;
        super(properties);
        this.length = length;
        //Precalculate end points and direction
        if(!properties.skipMatrixCreation) this.updateProperty("position",this.position);
    }
    getProperties = (): { [key: string]: any } => {
        return { mass: this.mass, position: this.position.copy(), rotation: this.rotation, length: this.length, scene: this.sceneRef, angularVelocity: this.angularVelocity, velocity: this.velocity.copy() };
    }
    render = (ctx: CanvasRenderingContext2D) => {
        //Draw grey line
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
            //TODO: possibly batch the stroke calls?
            ctx.strokeStyle = Scene.chargeColor(this.getChargeAt(i) * this.points.length * 1.0);
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
            //Create a new object and set properties that would change
            this.length = value as number;
            let next = this.clone();
            this.charges = next.charges;
            this.points = next.points;
            this.testPoints = next.testPoints;
            this.testPoints3D = next.testPoints3D;
            this.chargePoints3D = next.chargePoints3D;
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
    //Moment of inertia of a line about its center is m*l^2/12
    momentOfInertia = () => this.mass * this.length * this.length / 12;
    //Calulate the distance from the line segment
    distanceFrom = (pos: Vector) => {
        if (this.length == 0) return Vector.distance(pos, this.position);
        let t = Vector.dot(Vector.subtract(pos, this.endPoint), Vector.subtract(this.startPoint, this.endPoint)) / this.length / this.length;
        t = Math.max(0, Math.min(1, t));
        return Vector.distance(pos, Vector.add(this.endPoint, Vector.multiply(Vector.subtract(this.startPoint, this.endPoint), t)));
    }
    getType = (): ObjectTypes => "line_conductor";
}