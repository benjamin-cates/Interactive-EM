import { Object } from "../base";
import Vector from "../vector";
import PointCharge from "../charges/point_charge";
import Scene from "../scene";
import Constants from "../constants";
import * as math from "mathjs";

export default class Conductor extends Object {
    points: Vector[];
    testPoints: Vector[];
    charges: number[];
    netCharge: number;
    sceneRef: Scene;
    worldSpacePoints: Vector[];
    worldSpaceTestPoints: Vector[];
    matrix: math.Matrix;
    private voltage: number;

    constructor(properties: { [key: string]: number | Vector | Vector[] | Scene }) {
        //mass: number, position: Vector, rotation: number, points: Vector[], testPoints: Vector[], scene: Scene, netCharge: number = 0) {
        super(properties as { [key: string]: number | Vector });
        if (!properties.points) throw new Error("Conductor must have charge points");
        if (!properties.testPoints) throw new Error("Conductor must have test points");
        if (!properties.scene) throw new Error("Conductor properties must reference a scene");
        this.sceneRef = properties.scene as Scene;
        this.points = properties.points as Vector[];
        this.testPoints = properties.testPoints as Vector[];
        this.netCharge = properties.netCharge as number || 0;
        //Calculate some predefined constants
        this.charges = new Array(this.points.length).fill(this.netCharge / this.points.length);
        let mat = [[]];
        mat[0] = new Array(this.points.length).fill(1);
        mat[0][this.points.length] = 0;
        for (let j = 0; j < this.testPoints.length; j++) {
            mat[j + 1] = [];
            for (let i = 0; i < this.points.length; i++) {
                let delta = Vector.subtract(this.points[i], this.testPoints[j]);
                mat[j + 1][i] = Constants.K / Math.sqrt(delta.x * delta.x + delta.y * delta.y + 0.83);
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
        return this.worldSpacePoints.map((point: Vector, i: number) => new PointCharge({ charge: this.charges[i], position: point }));
    }

    voltageAt = (pos: Vector): number => {
        let volts = 0;
        for (let i = 0; i < this.points.length; i++) {
            let delta = Vector.subtract(pos, this.worldSpacePoints[i]);
            //See overleaf document for the derivation of this approximation
            volts += Constants.K * this.charges[i] / Math.sqrt(delta.x * delta.x + delta.y * delta.y + 0.83);
            if(isNaN(volts)) console.log("NaN", i,Constants.K * 4.0 * this.charges[i], Math.sqrt(delta.x * delta.x + delta.y * delta.y + 0.83));
        }
        return volts;
    }

    fieldAt = (pos: Vector): Vector => {
        let field = new Vector(0, 0);
        for (let i = 0; i < this.points.length; i++) {
            let rhat = Vector.rHat(pos, this.worldSpacePoints[i]);
            let dist = Vector.distance(pos, this.worldSpacePoints[i]);
            //See overleaf document for the derivation of this approximation
            let root = Math.sqrt(dist * dist + 0.83);
            let scale = Constants.K * this.charges[i] * dist / (root * root * root);
            rhat.x *= scale;
            rhat.y *= scale;
            field.add(rhat);
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