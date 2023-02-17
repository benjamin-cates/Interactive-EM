import {Object, ObjectTypes} from "../base";
import Vector from "../vector";
import constants from "../constants";
import Scene from "../scene";

export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;
    displayRadius: number;

    fieldAt = (pos: Vector) => {
        return  Vector.multiply(Vector.inverseSquareField(pos, this.position), constants.K * this.charge);
    }
    voltageAt = (pos: Vector) => {
        let distance: number = Vector.distance(pos, this.position)
        return ((constants.K * this.charge)/ distance);
    }

    constructor(charge: number, mass: number, position: Vector) {
        super(mass, position);
        this.charge = charge;
        this.displayRadius = 40;
    }
    getType: () => ObjectTypes = () => "point_charge";

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

}