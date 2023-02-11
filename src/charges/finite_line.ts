import Object from "../base";
import Vector from "../vector";

export default class FiniteLine extends Object {
    //Measured in microcoloumbs per meter
    chargeDensity: number;
    //Measured in meters
    length: number;
}
