import Object from "../base";
import Vector from "../vector";
import Scene from "../scene";

export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;
    displayRadius: number;

    constructor(charge: number, mass: number, position: Vector) {
        super(mass, position);
        this.charge = charge;
        this.displayRadius = 40;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = Scene.getChargeColor(this.charge);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.position.x * 100, this.position.y * 100, this.displayRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "none";
        ctx.fillText(this.charge.toString() + "μC", this.position.x * 100, this.position.y * 100);
    }

    feildAt = (pos: Vector) => {
        let nVec = pos.unit();
        return Vector.origin();
    }
}