import { Object, ObjectTypes } from "../base";
import Vector from "../vector";
import constants from "../constants";
import Scene from "../scene";

export default class InfinitePlane extends Object {
    //Measured in microcoulombs per meter
    chargeDensity: number;
    normal: Vector;

    fieldAt = (pos: Vector) => {
        let deltaPos = Vector.subtract(pos, this.position);
        return Vector.multiply(this.normal, Math.sign(Vector.dot(this.normal, deltaPos)) * 2 * this.chargeDensity * constants.K * Math.PI);
    }

    voltageAt = (pos: Vector) => {
        //V = C - 2πKσr
        return 20 - 2 * this.chargeDensity * constants.K * Math.PI * this.distanceFrom(pos);
    }

    constructor(properties: { [key: string]: number | Vector }) {
        super(properties);
        this.chargeDensity = properties.chargeDensity as number || 0;
        this.updateRotation();
    }
    clone = () => {
        let clone = new InfinitePlane({ chargeDensity: this.chargeDensity, mass: this.mass, position: this.position.copy(), rotation: this.rotation, velocity: this.velocity.copy(), angularVelocity: this.angularVelocity });
        clone.velocity = this.velocity.copy();
        clone.angularVelocity = this.angularVelocity;
        return clone;
    }
    getType: () => ObjectTypes = () => "infinite_plane";

    distanceFrom = (pos: Vector) => {
        let deltaPos = Vector.subtract(pos, this.position);
        return Math.abs(Vector.dot(deltaPos, this.normal));
    }
    updateRotation = () => {
        this.normal = new Vector(-Math.sin(this.rotation), Math.cos(this.rotation));
    }
    momentOfInertia = () => {
        return Infinity;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        //Line width is non linear wrt to charge density
        let lineWidth = Math.abs(this.chargeDensity) * 6 / (Math.abs(this.chargeDensity) + 0.03) + 2;
        ctx.beginPath();
        let dir = new Vector(50 * Math.cos(this.rotation), 50 * Math.sin(this.rotation));
        ctx.moveTo((this.position.x + dir.x) * 100, (this.position.y + dir.y) * 100);
        ctx.lineTo((this.position.x - dir.x) * 100, (this.position.y - dir.y) * 100);
        ctx.lineWidth = lineWidth + 6;
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = Scene.getChargeColor(this.chargeDensity);
        ctx.stroke();
        ctx.closePath();
    }
    decompose = (detail: number) => {
        throw "Infinite Plane cannot be decomposed";
    }
}