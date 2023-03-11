import { Object } from "../base";
import Vector from "../vector";
import PointCharge from "./point_charge";
import Scene from "../scene";

export default class Conductor extends Object {
    //LAYOUT
    points: Vector[];
    normals: Vector[];
    //STATE
    chargeDensities: number[];
    netCharge: number;


}