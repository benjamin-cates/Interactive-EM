import { Object } from "../base";
import Vector from "../vector";
import PointCharge from "../charges/point_charge";
import Scene from "../scene";
import Constants from "../constants";
import * as math from "mathjs";

//Remember to also change in the equipotential code
const conductorDepth = 2;

export default class Conductor extends Object {
    points: Vector[];
    testPoints: Vector[];
    charges: number[];
    netCharge: number;
    sceneRef: Scene;
    worldSpacePoints: Vector[];
    worldSpaceTestPoints: Vector[];
    private matrix: math.Matrix;
    private voltage: number;

    constructor(mass: number, position: Vector, rotation: number, points: Vector[], testPoints: Vector[], scene: Scene, netCharge: number = 0) {
        super(mass, position, rotation);
        this.sceneRef = scene;
        this.points = points;
        this.testPoints = testPoints;
        this.netCharge = netCharge;
        //Calculate some predefined constants
        this.charges = new Array(this.points.length).fill(this.netCharge / this.points.length);
        let mat = [[]];
        mat[0] = new Array(this.points.length).fill(1);
        mat[0][this.points.length] = 0;
        for (let j = 0; j < this.testPoints.length; j++) {
            mat[j + 1] = [];
            for (let i = 0; i < this.points.length; i++) {
                let dist = Vector.distance(this.points[i], this.testPoints[j]);
                let g = Math.sqrt(conductorDepth * conductorDepth + dist * dist);
                mat[j + 1][i] = Constants.K / conductorDepth / 2.0 * Math.log((conductorDepth + g) / (-conductorDepth + g));
            }
            mat[j + 1][this.points.length] = 1;
        }
        console.log(mat);
        let matObj = math.matrix(mat);
        this.matrix = math.multiply(math.inv(math.multiply(math.transpose(matObj), matObj)), math.transpose(matObj));
        console.log("inverse mat", this.matrix);
        this.updateWorldSpace();
    }
    updateWorldSpace = () => {
        let rotationMatrix = Vector.rotationMatrix(this.rotation);
        let transform = (point: Vector) => {
            let out = Vector.transform(point, rotationMatrix);
            out.add(this.position);
            return out;
        };
        this.worldSpacePoints = this.points.map(transform);
        this.worldSpaceTestPoints = this.testPoints.map(transform);
    }
    updateRotation = () => {
        this.updateWorldSpace();
    }
    updatePosition = () => {
        this.updateWorldSpace();
    }

    decompose = (detail: number) => {
        return this.worldSpacePoints.map((point: Vector, i: number) => new PointCharge(this.charges[i], 1, point));
    }

    voltageAt = (pos: Vector): number => {
        let volts = 0;
        for (let i = 0; i < this.points.length; i++) {
            let dist = Vector.distance(pos, this.worldSpacePoints[i]);
            let g = Math.sqrt(dist * dist + conductorDepth * conductorDepth);
            volts += Constants.K * (this.charges[i] / conductorDepth / 2.0) * Math.log((conductorDepth + g) / (-conductorDepth + g));
        }
        return volts;
    }

    fieldAt = (pos: Vector): Vector => {
        let field = new Vector(0, 0);
        for (let i = 0; i < this.points.length; i++) {
            let rhat = Vector.rHat(pos, this.worldSpacePoints[i]);
            let dist = Vector.distance(pos, this.worldSpacePoints[i]);
            let scale = Constants.K * this.charges[i] / dist / Math.sqrt(dist * dist + conductorDepth * conductorDepth);
            field.add(new Vector(rhat.x * scale, rhat.y * scale));
        }
        return field;
    }


    conduct = () => {
        const conductiness = 1.0;
        //See the overleaf document for details on how this works
        let volts = this.worldSpaceTestPoints.map((point: Vector) => -conductiness * this.sceneRef.voltageAt(point, this));
        volts.unshift(this.netCharge);
        let charges = math.multiply(this.matrix, volts);
        this.charges.map((charge: number, i: number) => this.charges[i] = Number(charges.toArray()[i]));
        this.voltage = Number(charges.get([this.points.length - 1]));
    }
}