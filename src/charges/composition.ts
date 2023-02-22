import { Object, ObjectTypes } from "../base";
import Vector from "../vector";

export default class Composition extends Object {

    //All coordinate systems of the elements in objs are relative to the center of mass and default rotation of the composition
    objs: Object[];

    constructor(objs: Object[], position: Vector, rotation: number = 0) {
        //Calculate total mass and translate all objects relative to the center of mass
        let mass = 0;
        let COM = Vector.origin();
        objs.forEach(obj => {
            mass += obj.mass;
            COM.add(Vector.multiply(obj.position, obj.mass));
        });
        let negativeCOM = Vector.multiply(COM, -1 / mass);
        objs.forEach(obj => {
            obj.position.add(negativeCOM);
        });
        super(mass, position, rotation);
        this.objs = objs;
    }

    sumForces = (forces: { force: Vector, torque: number }[]): { force: Vector, torque: number } => {
        //TODO: calculate total force and torque based on the force and torque of each object

        return { force: Vector.origin(), torque: 0 };
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.translate(this.position.x * 100, this.position.y * 100);
        ctx.rotate(this.rotation);
        this.objs.forEach(obj => {
            obj.render(ctx);
        });
        ctx.restore();
    }

}