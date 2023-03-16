import { Object } from "../base";
import Vector from "../vector";
import PointCharge from "../charges/point_charge";
import Scene from "../scene";
import Constants from "../constants";
import * as math from "mathjs";
import { SQRT1_2 } from "mathjs";

export default class Conductor extends Object {
    points: Vector[];
    charges: number[];
    netCharge: number;
    sceneRef: Scene;
    worldSpacePoints: Vector[];
    private distanceCache: number[][];
    private matrix: math.Matrix;
    private voltage: number;

    constructor(mass: number, position: Vector, rotation: number, points: Vector[], scene: Scene, netCharge: number = 0) {
        super(mass, position, rotation);
        this.sceneRef = scene;
        this.points = points;
        this.netCharge = netCharge;
        //Calculate some predefined constants
        this.charges = new Array(this.points.length).fill(this.netCharge / this.points.length);
        this.distanceCache = this.points.map(() => []);
        for (let x = 0; x < this.points.length; x++) {
            for (let y = x + 1; y < this.points.length; y++) {
                let dist = Vector.distance(this.points[x], this.points[y]);
                this.distanceCache[x][y] = dist;
                this.distanceCache[y][x] = dist;
            }
        }
        let n = this.points.length + 1;
        const selfAffectance = 4.5;
        let mat = [[]];
        mat[0] = new Array(n - 1).fill(1);
        mat[0][n - 1] = 0;
        for (let i = 0; i < n - 1; i++) {
            mat[i + 1] = [];
            for (let j = 0; j < n - 1; j++) {
                if (i == j) mat[i + 1][j] = selfAffectance;
                else mat[i + 1][j] = 1 / this.distanceCache[i][j]
            }
            mat[i + 1][n - 1] = 1;
        }
        this.matrix = math.inv(math.matrix(mat));
        this.updateWorldSpace();
    }
    updateWorldSpace = () => {
        let rotationMatrix = Vector.rotationMatrix(this.rotation);
        this.worldSpacePoints = this.points.map((point: Vector) => {
            let out = Vector.transform(point, rotationMatrix);
            out.add(this.position);
            return out;
        });
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
            volts += Constants.K * this.charges[i] / Vector.distance(this.worldSpacePoints[i], pos);
        }
        return volts;
    }

    fieldAt = (pos: Vector): Vector => {
        let field = new Vector(0, 0);
        for (let i = 0; i < this.points.length; i++) {
            let rhat = Vector.rHat(pos, this.worldSpacePoints[i]);
            let dist = Vector.distance(pos, this.worldSpacePoints[i]);
            let scale = Constants.K * this.charges[i] / (dist * dist);
            field.add(new Vector(rhat.x * scale, rhat.y * scale));
        }
        return field;
    }


    conduct = () => {
        const conductiness = 1;
        //See the overleaf document for details on how this works
        let volts = this.worldSpacePoints.map((point: Vector) => -conductiness * this.sceneRef.voltageAt(point, this));
        volts.unshift(this.netCharge);
        let charges = math.multiply(this.matrix, volts);
        this.charges.map((charge: number, i: number) => this.charges[i] = Number(charges.toArray()[i]) / Constants.K);
        this.voltage = Number(charges.get([this.points.length - 1]));
    }
}