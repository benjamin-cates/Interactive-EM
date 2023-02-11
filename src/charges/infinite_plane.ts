import Object from "../base";
import Vector from "../vector";
import constants from "../constants";

export default class InfinitePlane extends Object {
    //Measured in microcoulombs per meter
    chargeDensity: number;
    normal: Vector;

    fieldAt = (pos: Vector) => {
        return  Vector.multiply(this.normal, Math.sign(Vector.dot(this.normal, pos)) * 2 * this.chargeDensity * constants.K);
    }
}