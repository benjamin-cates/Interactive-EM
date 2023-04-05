import { Object, ObjectTypes } from "../base";
import Vector from "../vector";
import constants from "../constants";
import Scene from "../scene";

const ballRadius = 0.3;
export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;

    fieldAt = (pos: Vector) => {
        let delta = Vector.subtract(pos, this.position);
        let dist = delta.magnitude();
        if (dist < ballRadius) {
            //Derived from field of a solid ball charge
            return delta.scale(constants.K * this.charge / (ballRadius * ballRadius))
        }
        return delta.scale(constants.K * this.charge / (dist * dist * dist));
    }
    voltageAt = (pos: Vector) => {
        let dist: number = Vector.distance(pos, this.position)
        if (dist < ballRadius) {
            //Derived from voltge of a solid ball charge
            return (constants.K * this.charge) / (2 * ballRadius) * (3 - dist * dist / (ballRadius * ballRadius));
        }
        return ((constants.K * this.charge) / dist);
    }

    constructor(properties: { [key: string]: number | Vector }) {
        super(properties);
        this.charge = properties.charge as number || 1;
    }
    updateProperty = (property: string, value: number | Vector) => {
        if (property == "charge") this.charge = value as number;
        else this.updateBaseProperty(property, value);
    }
    getProperties = (): { [key: string]: any } => {
        return { charge: this.charge, position: this.position.copy(), velocity: this.velocity.copy(), mass: this.mass }
    }
    getType: () => ObjectTypes = () => "point_charge";

    render = (ctx: CanvasRenderingContext2D) => {
        //Draw circle with colored fill style and black outline
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