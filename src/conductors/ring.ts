import { Object, ObjectTypes } from "../base";
import Conductor from "./conductor";
import Vector from "../vector";
import Constants from "../constants";
import Scene from "../scene";

export default class RingConductor extends Conductor {
    radius: number;
    constructor(properties: { [key: string]: number | Vector | Vector[] | Scene }) {
        let radius = properties.radius as number || 1;
        let pointRadius = radius - 0.05;
        let testRadiuses = [radius - 0.1, radius - 0.2];
        let points = [];
        let testPoints = [];
        let detail = Math.floor(radius * 8);
        for (let i = 0; i < detail; i++) {
            let angle = i / detail * 2 * Math.PI;
            points.push(new Vector(pointRadius * Math.cos(angle), pointRadius * Math.sin(angle)));
            let angleAndHalf = (i + 0.5) / detail * 2 * Math.PI;
            testPoints.push(new Vector(testRadiuses[0] * Math.cos(angle), testRadiuses[0] * Math.sin(angle)));
            if (i % 2 == 0) testPoints.push(new Vector(testRadiuses[1] * Math.cos(angleAndHalf), testRadiuses[1] * Math.sin(angleAndHalf)));
        }
        properties.points = points;
        properties.testPoints = testPoints;
        properties.zPoints = 4;
        properties.zSpacing = (radius + 2) * 0.4 / 2;
        super(properties);
        this.radius = radius;
    }

    getProperties = (): { [key: string]: any } => {
        return { mass: this.mass, position: this.position.copy(), rotation: this.rotation, radius: this.radius, scene: this.sceneRef, netCharge: this.netCharge, angularVelocity: this.angularVelocity, velocity: this.velocity.copy() }
    }
    render = (ctx: CanvasRenderingContext2D) => {
        //Draw ring
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.arc(this.position.x * 100, this.position.y * 100, this.radius * 100 - 15, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        //Draw charges along edge
        ctx.lineWidth = 10;
        let step = 2 * Math.PI / this.points.length;
        for (let i = 0; i < this.points.length; i++) {
            ctx.strokeStyle = Scene.chargeColor(this.getChargeAt(i) * this.points.length * 1.0);
            ctx.beginPath();
            ctx.arc(this.position.x * 100, this.position.y * 100, this.radius * 100 - 15, this.rotation + step * (i - 0.5), this.rotation + step * (i + 0.5));
            ctx.stroke();
            ctx.closePath();
        }
    }

    updateProperty = (property: string, value: number | Vector) => {
        if (property == "radius") {
            this.radius = value as number;
            let next = this.clone();
            this.charges = next.charges;
            this.points = next.points;
            this.testPoints = next.testPoints;
            this.chargePoints3D = next.chargePoints3D;
            this.testPoints3D = next.testPoints3D;
            this.matrix = next.matrix;
            this.updateWorldSpace();
            this.conduct();
        }
        else if (property == "detail") {
            this.points.length = value as number;
            window.Object.assign(this, this.clone());
        }
        else if (property == "netCharge") {
            this.netCharge = value as number;
            this.conduct();
        }
        else if (property == "position") {
            this.position = value as Vector;
            this.updateWorldSpace();
        }
        else if (property == "rotation") {
            this.rotation = value as number;
            this.updateWorldSpace();
        }
        else this.updateBaseProperty(property, value);
    }
    momentOfInertia = () => Infinity;
    distanceFrom = (pos: Vector) => {
        let dist = Vector.distance(this.position, pos);
        return Math.abs(dist - this.radius);
    }
    getType = (): ObjectTypes => "ring_conductor";
}
