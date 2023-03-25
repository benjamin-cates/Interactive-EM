import { Object, ObjectTypes } from "../base";
import Vector from "../vector";
import Scene from "../scene";
import constants from "../constants";

export default class RingCharge extends Object {
    //in microcolumbs
    charge: number;
    radius: number;
    fieldAt = (pos: Vector) => {
        return Vector.multiply(Vector.inverseSquareField(pos, this.position), constants.K * this.charge);
    }
    voltageAt: (pos: Vector) =>{
        let distance: number = Vector.distance(pos, this.position)
        return ((constants.K * this.charge)/ distance);
    }
    
}