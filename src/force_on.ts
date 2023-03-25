import { Object, ObjectTypes } from "./base";
import PointCharge from "./charges/point_charge";
import Vector from "./vector";
import Scene from "./scene";

export default function forceOn(obj: Object, scene: Scene, detail: number = 10): { force: Vector, torque: number } {
    let type = obj.getType();
    if (type == "infinite_plane") return { force: new Vector(0, 0), torque: 0 };
    let decomposed = obj.decompose(detail) as PointCharge[];
    let totalTorque = 0;
    let totalForce = new Vector(0, 0);
    for (let i = 0; i < decomposed.length; i++) {
        let force = scene.fieldAt(decomposed[i].position, obj);
        force.x *= decomposed[i].charge;
        force.y *= decomposed[i].charge;
        totalForce.add(force);
        totalTorque += Vector.cross2D(Vector.subtract(decomposed[i].position, obj.position), force);
    }
    return { force: totalForce, torque: totalTorque };
}