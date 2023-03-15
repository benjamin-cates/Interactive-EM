import { Object } from "../base";
import Vector from "../vector";
import PointCharge from "../charges/point_charge";
import Scene from "../scene";
import Constants from "../constants";

export default class Conductor extends Object {
    points: Vector[];
    charges: number[];
    netCharge: number;
    sphereSize: number;
    sceneRef: Scene;
    worldSpacePoints: Vector[];
    private voltageCoef: number;
    private invVoltageCoef: number;
    private distanceCache: number[][];

    constructor(mass: number, position: Vector, rotation: number, points: Vector[], sphereSize: number, scene: Scene, netCharge: number = 0) {
        super(mass, position, rotation);
        this.sceneRef = scene;
        this.points = points;
        this.netCharge = netCharge;
        this.sphereSize = sphereSize;
        //Calculate some predefined constants
        this.voltageCoef = 1.5 * Constants.K / this.sphereSize;
        this.invVoltageCoef = 1 / this.voltageCoef;
        this.charges = new Array(this.points.length).fill(this.netCharge / this.points.length);
        this.distanceCache = this.points.map(() => []);
        for (let x = 0; x < this.points.length; x++) {
            for (let y = x + 1; y < this.points.length; y++) {
                let dist = Vector.distance(this.points[x], this.points[y]);
                this.distanceCache[x][y] = dist;
                this.distanceCache[y][x] = dist;
            }
        }
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
        this.conduct();
    }
    updatePosition = () => {
        this.updateWorldSpace();
        this.conduct();
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
        let volts = this.worldSpacePoints.map((point: Vector) => this.sceneRef.voltageAt(point, this));
        let updateVoltage = (i: number, deltaQ: number) => {
            for (let x = 0; x < i; x++) volts[x] += Constants.K * deltaQ / this.distanceCache[i][x];
            for (let x = i + 1; x < volts.length; x++) volts[x] += Constants.K * deltaQ / this.distanceCache[i][x];
        }
        //Add the voltage caused by points on the conductor
        for (let i = 0; i < this.points.length; i++) {
            for (let y = i + 1; y < this.points.length; y++) {
                let dist = this.distanceCache[i][y];
                volts[y] += Constants.K * this.charges[i] / dist;
                volts[i] += Constants.K * this.charges[y] / dist;
            }
        }
        //Add the voltage caused by itself
        for (let i = 0; i < this.points.length; i++) {
            volts[i] += this.voltageCoef * this.charges[i];
        }

        const maxIterations = 100;
        let iterations = 0, keepGoing = true;
        while (keepGoing && iterations < maxIterations) {
            keepGoing = false;
            const actionableDelta = 0.0001;
            for (let i = 0; i < this.points.length - 1; i++) {
                let next = (i + 8) % this.points.length;
                let deltaV = volts[next] - volts[i];
                if (Math.abs(deltaV) < actionableDelta) continue;

                let deltaQ = deltaV * this.invVoltageCoef / 2;
                this.charges[i] += deltaQ;
                this.charges[next] -= deltaQ;

                volts[i] += deltaV;
                volts[next] -= deltaV;
                updateVoltage(i, deltaQ);
                updateVoltage(next, -deltaQ);

                keepGoing = true;
            }
            iterations++;
            if (iterations == maxIterations)
                console.error("Conductor failed to converge");
        }
    }
}