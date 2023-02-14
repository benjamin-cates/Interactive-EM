import Object from "../base";
import Vector from "../vector";
import constants from "../constants";

export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;
    displayRadius: number;

    fieldAt = (pos: Vector) => {
        return  Vector.multiply(Vector.inverseSquareField(pos, this.position), constants.K * this.charge);
    }
    
    constructor(charge: number, mass: number, position: Vector) {
        super(mass, position);
        this.charge = charge;
        this.displayRadius = 40;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = this.charge > 0 ? "red" : (this.charge == 0 ? "black" : "blue");
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

}