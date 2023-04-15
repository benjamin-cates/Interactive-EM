import { Object, ObjectTypes } from "../base";
import Vector from "../vector";
import constants from "../constants";
import Scene from "../scene";

export default class InfinitePlane extends Object {
    //Measured in nanocoloumbs per meter squared
    chargeDensity: number;
    normal: Vector;

    fieldAt = (pos: Vector) => {
        //Field at is parallel to normal facing away from the plane
        let deltaPos = Vector.subtract(pos, this.position);
        let direction = Math.sign(Vector.dot(this.normal, deltaPos));
        //Convert nC/m^2 to μC/m^2
        let density = this.chargeDensity / 1000;
        // E = 2πKσ away from plane
        return Vector.multiply(this.normal, direction * 2 * constants.K * Math.PI * density);
    }

    voltageAt = (pos: Vector) => {
        //Convert nC/m^2 to μC/m^2
        let density = this.chargeDensity / 1000;
        //V = C - 2πKσr
        return 20 - 2 * Math.PI * constants.K * density * this.distanceFrom(pos);
    }

    constructor(properties: { [key: string]: number | Vector }) {
        super(properties);
        this.chargeDensity = properties.chargeDensity as number ?? 0;
        //Calculate normal vector
        this.updateProperty("rotation", this.rotation);
    }
    getProperties = (): { [key: string]: any } => {
        return { chargeDensity: this.chargeDensity, mass: this.mass, position: this.position.copy(), rotation: this.rotation, velocity: this.velocity.copy(), angularVelocity: this.angularVelocity };
    }
    updateProperty = (property: string, value: number | Vector) => {
        if (property == "chargeDensity") this.chargeDensity = value as number;
        else if (property == "rotation") {
            this.rotation = value as number;
            this.normal = new Vector(-Math.sin(this.rotation), Math.cos(this.rotation));
        }
        else this.updateBaseProperty(property, value);
    }
    getType: () => ObjectTypes = () => "infinite_plane";

    distanceFrom = (pos: Vector) => {
        //Distance from the plane is the dot product of the difference in position and the normal vector
        let deltaPos = Vector.subtract(pos, this.position);
        return Math.abs(Vector.dot(deltaPos, this.normal));
    }
    momentOfInertia = () => {
        return Infinity;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        //Calculate thickness
        let lineWidth = Math.abs(this.chargeDensity / 1000) * 6 / (Math.abs(this.chargeDensity / 1000) + 0.03) + 2;
        let dir = new Vector(50 * Math.cos(this.rotation), 50 * Math.sin(this.rotation));
        //Create line path
        ctx.beginPath();
        ctx.moveTo((this.position.x + dir.x) * 100, (this.position.y + dir.y) * 100);
        ctx.lineTo((this.position.x - dir.x) * 100, (this.position.y - dir.y) * 100);
        //Stoke black background
        ctx.lineWidth = lineWidth + 6;
        ctx.strokeStyle = "black";
        ctx.stroke();
        //Stroke colored interior
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = Scene.getChargeColor(this.chargeDensity);
        ctx.stroke();
        ctx.closePath();
    }
    decompose = (detail: number) => {
        throw "Infinite Plane cannot be decomposed";
    }
}