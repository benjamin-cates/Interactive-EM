import { Object } from "../base";
import Vector from "../vector";
import PointCharge from "../charges/point_charge";
import Scene from "../scene";
import Constants from "../constants";
import * as math from "mathjs";

const zPointsDefault = 3;
const zSpacingDefault = 0.8;

export default class Conductor extends Object {
    points: Vector[];
    testPoints: Vector[];
    chargePoints3D: Vector[];
    testPoints3D: Vector[];
    zPoints: number;
    zSpacing: number;
    charges: number[];
    netCharge: number;
    sceneRef: Scene;
    worldSpacePoints: Vector[];
    worldSpaceTestPoints: Vector[];
    voltageCache: number[];
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
        this.zSpacing = properties.zSpacing as number || zSpacingDefault;
        this.zPoints = properties.zPoints as number || zPointsDefault;

        //Extrude charge points in 3d
        this.chargePoints3D = [];
        for (let i = 0; i < this.points.length; i++) {
            for (let z = 0; z < this.zPoints; z++) {
                this.points[i].z = (z + 0.5) * this.zSpacing;
                this.chargePoints3D.push(this.points[i].copy());
            }
            this.points[i].z = 0;
        }
        //Extrude test points in 3d
        this.testPoints3D = [];
        for (let i = 0; i < this.testPoints.length; i++) {
            for (let z = 0; z < this.zPoints; z++) {
                this.testPoints[i].z = (z + 0.1) * this.zSpacing;
                this.testPoints3D.push(this.testPoints[i].copy());
            }
            this.testPoints[i].z = 0;
        }
        this.voltageCache = [];
        this.charges = new Array(this.chargePoints3D.length).fill(this.netCharge / 2 / this.chargePoints3D.length);
        let mat = [[]];
        mat[0] = new Array(this.chargePoints3D.length).fill(2);
        mat[0][this.chargePoints3D.length] = 0;
        for (let j = 0; j < this.testPoints3D.length; j++) {
            mat[j + 1] = [];
            for (let i = 0; i < this.chargePoints3D.length; i++) {
                let dist1 = Vector.subtract(this.chargePoints3D[i], this.testPoints3D[j]).magnitude();
                this.chargePoints3D[i].z = -this.chargePoints3D[i].z;
                let dist2 = Vector.subtract(this.chargePoints3D[i], this.testPoints3D[j]).magnitude();
                this.chargePoints3D[i].z = -this.chargePoints3D[i].z;
                mat[j + 1][i] = Constants.K * (1 / dist1 + 1 / dist2);
            }
            mat[j + 1][this.chargePoints3D.length] = 1;
        }
        let matObj = math.matrix(mat);
        let matObjTranspose = math.transpose(matObj);
        this.matrix = math.multiply(math.inv(math.multiply(matObjTranspose, matObj)), matObjTranspose);
        this.updateWorldSpace();
    }
    updateWorldSpace = () => {
        let rotationMatrix = Vector.rotationMatrix(this.rotation);
        let transform = (point: Vector) => {
            let out = Vector.transform2D(point, rotationMatrix);
            out.add(this.position);
            out.z = point.z;
            return out;
        };
        this.worldSpacePoints = this.chargePoints3D.map(transform);
        this.worldSpaceTestPoints = this.testPoints3D.map(transform);
    }

    decompose = (detail: number) => {
        return this.worldSpacePoints.map((point: Vector, i: number) => new PointCharge({ charge: this.charges[i], position: point }));
    }

    getChargeAt = (index: number) => {
        let sum = 0;
        for (let i = 0; i < this.zPoints; i++) {
            sum += this.charges[index * this.zPoints + i];
        }
        return sum * 2 / this.zPoints;
    }

    voltageAt = (pos: Vector): number => {
        let volts = 0;
        for (let i = 0; i < this.worldSpacePoints.length; i++) {
            let delta = Vector.subtract(pos, this.worldSpacePoints[i]);
            let dist = delta.magnitude();
            //See overleaf document for the derivation of this approximation
            volts += this.charges[i] / dist;
        }
        return 2 * Constants.K * volts;
    }

    fieldAt = (pos: Vector): Vector => {
        let field = new Vector(0, 0);
        for (let i = 0; i < this.worldSpacePoints.length; i++) {
            let delta = Vector.subtract(pos, this.worldSpacePoints[i]);
            let dist = delta.magnitude();
            field.add(delta.scale(this.charges[i] / (dist * dist * dist)));
        }
        field.z = 0;
        field.scale(2 * Constants.K)
        return field;
    }

    conductCount: number = 0;
    conduct = () => {
        //See the overleaf document for details on how this works
        let volts = this.worldSpaceTestPoints.map((point: Vector, i: number) => {
            let cache = this.voltageCache[i];
            if (this.conductCount % 4 != 0)
                if (Math.abs(cache - this.voltageCache[i + this.zSpacing]) < 0.0004)
                    return cache;
            this.voltageCache[i] = -this.sceneRef.voltageAt(point, this)
            return this.voltageCache[i];
        });
        volts.unshift(this.netCharge);
        let charges = math.multiply(this.matrix, volts);
        this.charges = charges.toArray().map(v => Number(v));
        this.voltage = Number(charges.get([this.chargePoints3D.length - 1]));
        this.conductCount++;
    }
}