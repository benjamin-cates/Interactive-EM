import { Object, ObjectTypes } from "../base";
import Conductor from "./conductor";
import Vector from "../vector";
import Constants from "../constants";
import Scene from "../scene";

export default class RingConductor extends Conductor {
    radius: number;
    constructor(mass: number, position: Vector, rotation: number, detail: number, radius: number, sphereSize: number, scene: Scene, netCharge: number = 0) {
        let points = [];
        let pointRadius = radius * 0.95;
        for (let i = 0; i < detail; i++) {
            let angle = i / detail * 2 * Math.PI;
            points.push(new Vector(pointRadius * Math.cos(angle), pointRadius * Math.sin(angle)));
        }
        super(mass, position, rotation, points, sphereSize, scene, netCharge);
        this.radius = radius;
    }

    clone = () => new RingConductor(this.mass, this.position.copy(), this.rotation, this.points.length, this.radius, this.sphereSize, this.sceneRef, this.netCharge);
    render = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = "grey";
        ctx.fillStyle = "white";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(this.position.x * 100, this.position.y * 100, this.radius * 100, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }
    getType = (): ObjectTypes => "ring_conductor";
}
