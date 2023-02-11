import Object from "../base";
import Vector from "../vector";

export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;
    displayRadius: number;

    constructor(charge: number, mass: number, position: Vector) {
        super(mass, position);
        this.charge = charge;
        this.displayRadius = 0.4;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = this.charge > 0 ? "red" : (this.charge == 0 ? "black" : "blue");
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.displayRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    feildAt = (pos: Vector) => {
        let nVec = pos.unit();
        return 0;
    }
}