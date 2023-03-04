import { Object, ObjectTypes } from "../base";
import Vector from "../vector";
import constants from "../constants";
import PointCharge from "./point_charge";

export default class Triangle extends Object {
    private points: Vector[];
    chargeDensity: number;
    private opTrans: Vector
    private hypotCenter: Vector;
    private halfWidth: number;
    private defRotation: number;
    constructor(mass: number, position: Vector, rotation: number, chargeDensity: number, p1: Vector, p2: Vector, p3: Vector) {
        super(mass, position, rotation);
        this.points = [p1, p2, p3];
        this.chargeDensity = chargeDensity;
        //Find hypotenuses
        let d1 = Vector.distance(p1, p2);
        let d2 = Vector.distance(p2, p3);
        let d3 = Vector.distance(p3, p1);
        let hypot = 2, hypot2 = 0, opposite = 1;
        if (d1 >= d2 && d1 >= d3) hypot = 0, hypot2 = 1, opposite = 2;
        else if (d2 >= d1 && d2 >= d3) hypot = 1, hypot2 = 2, opposite = 0;

        //Find fixed triangle properties
        this.hypotCenter = Vector.multiply(Vector.add(this.points[hypot], this.points[hypot2]), 0.5);
        let hypotVec = Vector.add(this.points[hypot], Vector.multiply(this.points[hypot2], -1));
        this.halfWidth = hypotVec.magnitude() / 2;
        this.defRotation = -Math.atan2(hypotVec.y, hypotVec.x);
        this.opTrans = Vector.add(this.points[opposite], Vector.multiply(this.hypotCenter, -1));
        this.opTrans.rotate(this.defRotation);
        if (this.opTrans.y < 0) {
            this.defRotation += Math.PI;
            this.opTrans.rotate(Math.PI);
        }
    }

    voltageAt = (pos: Vector): number => {
        //TODO: Make sure these are correct
        //TODO: Cache some of these calculations to improve efficiency
        //Translate so the center of the hypotenuse is at the origin
        let p = Vector.add(pos, Vector.multiply(this.hypotCenter, -1));
        p.rotate(this.defRotation);
        let halfWidth = this.halfWidth;
        let height = this.opTrans.y;
        let ox = this.opTrans.x;

        //Do funky calculations
        let a = height / halfWidth;
        let b = p.x * a - p.y;
        let c = height / (ox - halfWidth);
        let d = (halfWidth * height - p.x * height - p.y * halfWidth + ox * p.y) / (halfWidth - ox);

        let l0 = -halfWidth - p.x;
        let l1 = ox - p.x;
        let l2 = halfWidth - p.x;

        const f1 = (x: number) => -p.y * Math.log(Math.abs(-p.y * Math.sqrt(x * x + p.y * p.y) + Math.abs(p.y) * x)) + x * Math.asinh(-p.y / x);
        const f2 = (x: number, a: number, b: number) => a * (Math.sqrt((a + x / b) ** 2 + 1) - 1) / (a + x / b);
        const f3 = (x: number, a: number, b: number) => {
            let t = f2(x, a, b);
            let l = Math.sqrt(a * a + 1);
            return x * Math.asinh(a + b / x) + b / l * Math.log(Math.abs((t + l + 1) / (t - l + 1)))
        }
        return constants.K * this.chargeDensity * (f3(l1, a, b) - f3(l0, a, b) + f3(l2, c, d) - f3(l1, c, d) + f1(l0) - f1(l2));
    }

    fieldAt = (pos: Vector): Vector => {
        //TODO: Field at for charged triangle
        return Vector.origin();
    }
    clone = (): Triangle => {
        return new Triangle(this.mass, this.position.copy(), this.rotation, this.chargeDensity, this.points[0].copy(), this.points[1].copy(), this.points[2].copy());
    }
    getType = (): ObjectTypes => "triangle_charge";

    updateRotation = () => {
        //TODO: update cached values for rotation and position
    }
    updatePosition = () => {
        //TODO: update cached values for rotation and position
    }
    render = (ctx: CanvasRenderingContext2D) => {
        //TODO: write render function

    }

    decompose = (detail: number): Object[] => {
        //Find closest trianglular number
        let triNumber = 3;
        let i = 3;
        for (; triNumber < detail; i++) triNumber += i;
        //Calculate side length
        const sideLen = i - 1;
        let charge = this.chargeDensity / triNumber;
        //Calculate vectors from 0 to 1 and 0 to 2 divided by side length
        let unit1 = Vector.multiply(Vector.subtract(this.points[1], this.points[0]), 1 / sideLen);
        let unit2 = Vector.multiply(Vector.subtract(this.points[2], this.points[0]), 1 / sideLen);
        let objs: Object[] = [];
        //Generate all points that are an integer linear combination of unit1 and unit2 and that are on the triangle
        for (let x = 0; x < sideLen; x++) {
            for (let y = 0; y < sideLen - x; y++) {
                objs.push(new PointCharge(this.mass, charge,
                    Vector.add(this.points[0], Vector.add(Vector.multiply(unit1, x), Vector.multiply(unit2, y)))));
            }
        }
        return objs;
    }


}

//@ts-ignore
window.Triangle = Triangle;