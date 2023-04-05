import { Object } from "../base";
import Vector from "../vector";
import PointCharge from "../charges/point_charge";
import Scene from "../scene";
import Constants from "../constants";
import * as math from "mathjs";

const zPointsDefault = 3;
const zSpacingDefault = 0.8;

export default class Conductor extends Object {
    //List of charge and test points in 2d
    points: Vector[];
    testPoints: Vector[];

    //Number of points in each z direction
    zPoints: number;
    //Distance between each point in the z direction
    zSpacing: number;
    //Charge and test points extruded into 3d
    //Stored as [p0, p0 + zSpacing, p0 + zSpacing * 2,..., p1, p1 + zSpacing, p1 + zSpacing*2] where the number of points for each original point is zPoints
    chargePoints3D: Vector[];
    testPoints3D: Vector[];
    //List of charges on each point, matches 1-to-1 with chargePoints3D
    charges: number[];
    //Net charge on the conductor
    netCharge: number;
    //Reference to the scene to test voltage
    sceneRef: Scene;
    //chargePoints3D in world space
    worldSpacePoints: Vector[];
    //testPoints3D in world space
    worldSpaceTestPoints: Vector[];
    //Cache of voltage testing points
    voltageCache: number[];
    //See latex document for explanation of matrix
    matrix: math.Matrix;

    constructor(properties: { [key: string]: number | Vector | Vector[] | Scene }) {
        //mass: number, position: Vector, rotation: number, points: Vector[], testPoints: Vector[], scene: Scene, netCharge: number = 0) {
        super(properties as { [key: string]: number | Vector });
        //Set properties
        if (!properties.points) throw new Error("Conductor must have charge points");
        if (!properties.testPoints) throw new Error("Conductor must have test points");
        if (!properties.scene) throw new Error("Conductor properties must reference a scene");
        this.sceneRef = properties.scene as Scene;
        this.points = properties.points as Vector[];
        this.testPoints = properties.testPoints as Vector[];
        this.netCharge = properties.netCharge as number || 0;
        this.zSpacing = properties.zSpacing as number || zSpacingDefault;
        this.zPoints = properties.zPoints as number || zPointsDefault;
        if (properties.skipMatrixCreation) return;

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
        this.charges = new Array(this.chargePoints3D.length).fill(0);
        let mat = [[]];
        mat[0] = new Array(this.chargePoints3D.length).fill(2);
        mat[0][this.chargePoints3D.length] = 0;
        for (let j = 0; j < this.testPoints3D.length; j++) {
            mat[j + 1] = [];
            for (let i = 0; i < this.chargePoints3D.length; i++) {
                //Dist1 is the distance to the positive z-axis charge point
                let dist1 = Vector.subtract(this.chargePoints3D[i], this.testPoints3D[j]).magnitude();
                this.chargePoints3D[i].z = -this.chargePoints3D[i].z;
                //Dist2 is the distance to the negative z-axis charge point
                let dist2 = Vector.subtract(this.chargePoints3D[i], this.testPoints3D[j]).magnitude();
                this.chargePoints3D[i].z = -this.chargePoints3D[i].z;
                //Set matrix cell to K/r1 + K/r2
                mat[j + 1][i] = Constants.K * (1 / dist1 + 1 / dist2);
            }
            mat[j + 1][this.chargePoints3D.length] = 1;
        }
        let matObj = math.matrix(mat);
        let matObjTranspose = math.transpose(matObj);
        //Formula for the least squares regression inverse matrix
        this.matrix = math.multiply(math.inv(math.multiply(matObjTranspose, matObj)), matObjTranspose);
        this.updateWorldSpace();
    }
    updateWorldSpace = () => {
        //Calculates world space points when the conductor moves
        let rotationMatrix = Vector.rotationMatrix(this.rotation);
        //Transformation function
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
        //Decompose into it's charge points
        return this.worldSpacePoints.map((point: Vector, i: number) => new PointCharge({ charge: this.charges[i], position: point }));
    }

    getChargeAt = (index: number) => {
        //Returns the charge at the index indicated by where it would be in the 2d points array, basically sums up the charges in the z direction
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
            let charge = this.charges[i];
            //Treat z charges as flat when lowest point is far enough away
            if (i % this.zPoints == 0 && dist > this.zSpacing * 7) {
                for (let j = 1; j < this.zPoints; j++) {
                    charge += this.charges[i + j];
                }
                i += this.zPoints - 1;
            }
            volts += charge / dist;
        }
        return 2 * Constants.K * volts;
    }

    fieldAt = (pos: Vector): Vector => {
        let field = new Vector(0, 0);
        for (let i = 0; i < this.worldSpacePoints.length; i++) {
            let delta = Vector.subtract(pos, this.worldSpacePoints[i]);
            let dist = delta.magnitude();
            let charge = this.charges[i];
            //Treat charges in the z plane flat when lowest point is far enough away
            if (i % this.zPoints == 0 && dist > this.zSpacing * 9) {
                for (let j = 1; j < this.zPoints; j++) {
                    charge += this.charges[i + j];
                }
                i += this.zPoints - 1;
            }
            let scale = charge / (dist * dist * dist);
            field.x += delta.x * scale;
            field.y += delta.y * scale;
        }
        field.z = 0;
        //Scale by 2 because it's mirrored
        field.scale(2 * Constants.K)
        return field;
    }

    conductCount: number = 0;
    conduct = () => {
        let volts = this.worldSpaceTestPoints.map((point: Vector, i: number) => {
            let cache = this.voltageCache[i];
            if (this.conductCount % 4 != 0)
                if (Math.abs(cache - this.voltageCache[i + this.zSpacing]) < 0.0004)
                    return cache;
            this.voltageCache[i] = -this.sceneRef.voltageAt(point, this)
            return this.voltageCache[i];
        });
        //See the overleaf document for details on how this works
        //Put net charge on front of voltage array
        volts.unshift(this.netCharge);
        let charges = math.multiply(this.matrix, volts);
        this.charges = charges.toArray().map(v => Number(v));
        let conductorVoltage = this.charges[this.charges.length - 1];
        //Remove last element of charges array, which is the conductor voltage
        this.charges.length--;
        this.conductCount++;
    }
}