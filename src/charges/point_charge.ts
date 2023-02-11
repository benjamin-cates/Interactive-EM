import Object from "../base";
import Vector from "../vector";

export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;
    displayRadius: number;

    fieldAt = (pos: Vector): Vector => {
        let nVec = pos.unit();
        return Vector.origin();
    }
}