import { Object, ObjectTypes } from "../base";
import Vector from "../vector";

export default class Composition extends Object {

    //All coordinate systems of the elements in objs are relative to the center of mass and default rotation of the composition
    objs: Object[];
    relPos: Vector[];
    relRot: number[];

    constructor(properties: { [key: string]: number | Vector | Object[] }) {
        if (!properties.objs) throw new Error("Composition must have objs property");
        //Calculate total mass and translate all objects relative to the center of mass
        let mass = 0;
        let COM = Vector.origin();
        let objs = properties.objs as Object[];
        objs.forEach(obj => {
            mass += obj.mass;
            COM.add(Vector.multiply(obj.position, obj.mass));
        });
        super(properties as { [key: string]: number | Vector });
        this.relPos = [];
        this.relRot = [];
        objs.forEach((obj, i) => {
            this.relPos[i] = Vector.subtract(obj.position, COM);
            this.relRot[i] = obj.rotation;
        });
        this.objs = objs;
    }

    sumForces = (forces: { force: Vector, torque: number }[]): { force: Vector, torque: number } => {
        //Torque is the sum of torques plus the sum of the cross products of the position vectors and the forces
        //Force is just the sum of forces

        let netForce = Vector.origin();
        let netTorque = 0;
        for (let i = 0; i < forces.length; i++) {
            netForce.add(forces[i].force);
            netTorque += forces[i].torque;
            netTorque += Vector.cross2D(this.relPos[i], forces[i].force);
        }
        return { force: netForce, torque: netTorque };
    }
    updateProperty = (property: string, value: number | Vector) => {
        if (property == "position" || property == "rotation") {
            if (property == "position") this.position = value as Vector;
            else if (property == "rotation") this.rotation = value as number;
            let rotmat = Vector.rotationMatrix(this.rotation);
            for (let i = 0; i < this.objs.length; i++) {
                this.objs[i].position = Vector.add(this.position, Vector.transform(this.relPos[i], rotmat));
                this.objs[i].updateProperty("position", this.objs[i].position);
                this.objs[i].rotation = this.rotation + this.relRot[i];
                this.objs[i].updateProperty("rotation", this.objs[i].rotation);
            }
        }
        else this.updateBaseProperty(property, value);
    }

    render = (ctx: CanvasRenderingContext2D) => {
        this.objs.forEach(obj => obj.render(ctx));
    }

    fieldAt = (pos: Vector): Vector => {
        let field = Vector.origin();
        this.objs.forEach(obj => field.add(obj.fieldAt(pos)));
        return field;
    }
    voltageAt = (pos: Vector): number => {
        let volt = 0;
        this.objs.forEach(obj => volt += obj.voltageAt(pos));
        return volt;
    }


}