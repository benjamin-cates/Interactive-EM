import Object from "../base";
import Vector from "../vector";
import constants from "../constants";

export default class PointCharge extends Object {
    //Stored in microcoloumbs
    charge: number;
    displayRadius: number;

    fieldAt = (pos: Vector) => {
        return  Vector.multiply(Vector.inverseSquareField(pos, this.position), constants.K * this.charge);
    }
}