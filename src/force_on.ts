import { Object, ObjectTypes } from "./base";
import PointCharge from "./charges/point_charge";
import Vector from "./vector";
import Scene from "./scene";

//Returns force and torque on object caused by scene
export default function forceOn(obj: Object, scene: Scene, detail: number = 10): { force: Vector, torque: number } {
    //Skip infinite planes
    if (obj.getType() == "infinite_plane") return { force: new Vector(0, 0), torque: 0 };

    //Decompose object into list of points
    let decomposed = obj.decompose(detail) as PointCharge[];

    let totalTorque = 0;
    let totalForce = Vector.origin();
    for (let i = 0; i < decomposed.length; i++) {
        //Sum up forces caused by each point charge
        let force = scene.fieldAt(decomposed[i].position, obj);
        force.x *= decomposed[i].charge;
        force.y *= decomposed[i].charge;
        totalForce.add(force);
        //Sum up torques caused by each point charge
        // τ = r × F
        totalTorque += Vector.cross2D(Vector.subtract(decomposed[i].position, obj.position), force);
    }
    return { force: totalForce, torque: totalTorque };
}