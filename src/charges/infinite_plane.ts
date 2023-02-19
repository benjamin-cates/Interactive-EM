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
        return Vector.multiply(this.normal, Math.sign(Vector.dot(this.normal, deltaPos)) * 2 * this.chargeDensity * constants.K);
    }

    constructor(chargeDensity: number, mass: number, position: Vector, rotation: number = 0) {
        super(mass, position, rotation);
        this.chargeDensity = chargeDensity;
    }
    getType: () => ObjectTypes = () => "infinite_plane";

    updateRotation = () => {
        this.normal = new Vector(-Math.sin(this.rotation), Math.cos(this.rotation));
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
}