import Composition from "./composition";
import Vector from "../vector";
import PointCharge from "../charges/point_charge";
import { Object, ObjectTypes } from "../base";

export default class ElectricDipole extends Composition {
    dist: number;
    charge: number;
    mass: number;
    constructor(properties: { [key: string]: number | Vector | Object[] }) {
        let charge = properties.charge as number ?? 1;
        let dist = properties.dist as number ?? 1;
        let mass = properties.mass as number ?? 1;
        let objs = [new PointCharge({ mass: mass / 2, charge, position: new Vector(dist / 2, 0) }), new PointCharge({ mass: mass / 2, charge: -charge, position: new Vector(-dist / 2, 0) })];
        properties.objs = objs;
        super(properties)
        this.charge = charge;
        this.dist = dist;
        this.mass = mass;
    }
    getType = (): ObjectTypes => {
        return "electric_dipole";
    }
    updateProperty = (property: string, value: number | Vector) => {
        if (property == "mass") {
            this.mass = value as number;
            this.objs[0].updateProperty("mass", this.mass / 2);
            this.objs[1].updateProperty("mass", this.mass / 2);
        }
        else if (property == "charge") {
            this.charge = value as number;
            this.objs[0].updateProperty("charge", this.charge);
            this.objs[1].updateProperty("charge", -this.charge);
        }
        else if (property == "dist") {
            this.dist = value as number;
            this.relPos[0].x = this.dist / 2;
            this.relPos[1].x = -this.dist / 2;
            this.compositionUpdateProperty("position", this.position)
        }
        else this.compositionUpdateProperty(property, value);
    }
    getProperties = (): { [key: string]: number | Vector } => {
        return { mass: this.mass, charge: this.charge, dist: this.dist, position: this.position.copy(), velocity: this.velocity.copy(), angularVelocity: this.angularVelocity, rotation: this.rotation };
    }

}