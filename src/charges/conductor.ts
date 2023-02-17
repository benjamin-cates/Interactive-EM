import {Object, ObjectTypes} from "../base";
import Vector from "../vector";

export default class Conductor extends Object {
    width: number;
    height: number;
    chargeState: number[];
    getType: () => ObjectTypes = () => "conductor";

}