import { Object, ObjectTypes } from "../base";
import Vector from "../vector";
import constants from "../constants";
import Scene from "../scene";

export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;

    fieldAt = (pos: Vector) => {
        return Vector.multiply(Vector.inverseSquareField(pos, this.position), constants.K * this.charge);
    }
    voltageAt = (pos: Vector) => {
        let distance: number = Vector.distance(pos, this.position)
        return ((constants.K * this.charge) / distance);
    }

    constructor(properties: { [key: string]: number | Vector }) {
        super(properties);
        this.charge = properties.charge as number || 1;
    }
    updateProperty = (property: string, value: number | Vector) => {
        if (property == "charge") this.charge = value as number;
        else this.updateBaseProperty(property, value);
    }
    clone = () => new PointCharge({ charge: this.charge, position: this.position.copy(), velocity: this.velocity.copy(), mass: this.mass });
    getType: () => ObjectTypes = () => "point_charge";

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = Scene.getChargeColor(this.charge);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.position.x * 100, this.position.y * 100, 40, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "none";
        ctx.fillText(this.charge.toString() + "μC", this.position.x * 100, this.position.y * 100);
    }

}