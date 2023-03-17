import { Object, ObjectTypes } from "../base";
import Conductor from "./conductor";
import Vector from "../vector";
import Constants from "../constants";
import Scene from "../scene";

export default class RingConductor extends Conductor {
    radius: number;
    constructor(mass: number, position: Vector, rotation: number, detail: number, radius: number, scene: Scene, netCharge: number = 0) {
        let pointRadius = radius * 0.95;
        let testRadiuses = [radius * 1.05, radius * 0.85, radius * 0.6];
        let points = [];
        let testPoints = [];
        for (let i = 0; i < detail; i++) {
            let angle = i / detail * 2 * Math.PI;
            points.push(new Vector(pointRadius * Math.cos(angle), pointRadius * Math.sin(angle)));
            let angleAndHalf = (i + 0.5) / detail * 2 * Math.PI;
            testPoints.push(new Vector(testRadiuses[0] * Math.cos(angle), testRadiuses[0] * Math.sin(angle)));
            testPoints.push(new Vector(testRadiuses[1] * Math.cos(angleAndHalf), testRadiuses[1] * Math.sin(angleAndHalf)));
            testPoints.push(new Vector(testRadiuses[2] * Math.cos(angleAndHalf), testRadiuses[2] * Math.sin(angleAndHalf)));
        }
        super(mass, position, rotation, points, testPoints, scene, netCharge);
        this.radius = radius;
    }

    clone = () => new RingConductor(this.mass, this.position.copy(), this.rotation, this.points.length, this.radius, this.sceneRef, this.netCharge);
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
            ctx.strokeStyle = Scene.chargeColor(this.charges[i] * this.points.length * 1.5);
            ctx.beginPath();
            ctx.arc(this.position.x * 100, this.position.y * 100, this.radius * 100 - 15, this.rotation + step * i, this.rotation + step * (i + 1));
            ctx.stroke();
            ctx.closePath();
        }
    }
    distanceFrom = (pos: Vector) => {
        let dist = Vector.distance(this.position, pos);
        return Math.abs(dist - this.radius);
    }
    getType = (): ObjectTypes => "ring_conductor";
}
