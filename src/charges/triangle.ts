import { Object, ObjectTypes } from "../base";
import Vector from "../vector";
import constants from "../constants";
import PointCharge from "./point_charge";
import Scene from "../scene";

export default class Triangle extends Object {
    private points: Vector[];
    chargeDensity: number;
    tip: Vector;
    halfWidth: number;
    constructor(mass: number, position: Vector, rotation: number, chargeDensity: number, p1: Vector, p2: Vector, p3: Vector) {
        super(mass, position, rotation);
        this.points = [p1, p2, p3];
        this.chargeDensity = chargeDensity;
        //Find lengths
        let d1 = Vector.distance(p1, p2);
        let d2 = Vector.distance(p2, p3);
        let d3 = Vector.distance(p3, p1);
        let hypot = 2, hypot2 = 0, tip = 1;
        if (d1 >= d2 && d1 >= d3) hypot = 0, hypot2 = 1, tip = 2;
        else if (d2 >= d1 && d2 >= d3) hypot = 1, hypot2 = 2, tip = 0;
        //Find fixed triangle properties
        let hypotVec = Vector.add(this.points[hypot], Vector.multiply(this.points[hypot2], -1));
        this.halfWidth = hypotVec.magnitude() / 2;
        //Shift so that the center of mass is in the middle
        let COM = Vector.multiply(Vector.add(Vector.add(p1, p2), p3), 1 / 3);
        this.position.add(COM);
        let negCOM = Vector.multiply(COM, -1);
        this.points.forEach(p => p.add(negCOM));
        //Rotate triangle so hypotenuse is horizontal
        let adjustmentRotation = Math.atan2(hypotVec.y, hypotVec.x);
        this.points.forEach(p => p.rotate(adjustmentRotation));
        if (this.points[tip].y < 0) {
            adjustmentRotation -= Math.PI;
            this.points.forEach(p => p.rotate(Math.PI));
        }
        this.rotation -= adjustmentRotation;
        this.tip = this.points[tip];
    }

    voltageAt = (pos: Vector): number => {
        //TODO: Make sure these are correct
        //TODO: Cache some of these calculations to improve efficiency
        //Translate so the center of the hypotenuse is at the origin
        let p = Vector.add(pos, Vector.multiply(this.position, -1));
        p.rotate(this.rotation);
        //Set position relative to center of the hypotenuse
        p.y -= this.tip.y / 2;
        let halfWidth = this.halfWidth;
        let height = this.tip.y * 3/2;
        let ox = this.tip.x;

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
    private distanceFromFiniteLine = (pos: Vector, p1: Vector, p2: Vector): number => {
        let len = Vector.distance(p1, p2);
        let t = Vector.dot(Vector.subtract(pos, p2), Vector.subtract(p1, p2)) / len / len;
        t = Math.max(0, Math.min(1, t));
        return Vector.distance(pos, Vector.add(p2, Vector.multiply(Vector.subtract(p1, p2), t)));
    }
    private pointInside(pos: Vector) {
        //Calculate barycentric coordinates s and t
        let s = (this.points[0].x - this.points[2].x) * (pos.y - this.points[2].y) - (this.points[0].y - this.points[2].y) * (pos.x - this.points[2].x);
        let t = (this.points[1].x - this.points[0].x) * (pos.y - this.points[0].y) - (this.points[1].y - this.points[0].y) * (pos.x - this.points[0].x);
        if ((s < 0) != (t < 0) && s != 0 && t != 0)
            return false
        let d = (this.points[2].x - this.points[1].x) * (pos.y - this.points[1].y) - (this.points[2].y - this.points[1].y) * (pos.x - this.points[1].x);
        return d == 0 || (d < 0) == (s + t <= 0);

    }

    distanceFrom = (pos: Vector): number => {
        let translatedPosition = Vector.add(pos, Vector.multiply(this.position, -1));
        translatedPosition.rotate(-this.rotation);
        if (this.pointInside(translatedPosition)) return 0;

        return Math.min(
            this.distanceFromFiniteLine(translatedPosition, this.points[0], this.points[1]),
            this.distanceFromFiniteLine(translatedPosition, this.points[1], this.points[2]),
            this.distanceFromFiniteLine(translatedPosition, this.points[2], this.points[0])
        );
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
        ctx.save();
        ctx.fillStyle = Scene.getChargeColor(this.chargeDensity);
        ctx.beginPath();
        ctx.translate(this.position.x * 100, this.position.y * 100)
        ctx.rotate(this.rotation);
        ctx.moveTo(this.points[0].x * 100, this.points[0].y * 100);
        ctx.lineTo(this.points[1].x * 100, this.points[1].y * 100);
        ctx.lineTo(this.points[2].x * 100, this.points[2].y * 100);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    decompose = (detail: number): Object[] => {
        //Find closest trianglular number
        let triNumber = 3;
        let i = 3;
        for (; triNumber < detail; i++) triNumber += i;
        //Calculate side length
        const sideLen = i - 2;
        let charge = this.chargeDensity / triNumber;
        //Calculate vectors from 0 to 1 and 0 to 2 divided by side length
        let unit1 = Vector.multiply(Vector.subtract(this.points[1], this.points[0]), 1 / sideLen);
        let unit2 = Vector.multiply(Vector.subtract(this.points[2], this.points[0]), 1 / sideLen);
        let objs: Object[] = [];
        //Generate all points that are an integer linear combination of unit1 and unit2 and that are on the triangle
        for (let x = 0; x <= sideLen; x++) {
            for (let y = 0; y <= sideLen - x; y++) {
                objs.push(new PointCharge(charge, 1,
                    Vector.add(this.points[0], Vector.add(Vector.multiply(unit1, x), Vector.multiply(unit2, y)))));
            }
        }
        objs.forEach(obj => obj.position.rotate(this.rotation));
        objs.forEach(obj => obj.position.add(this.position));
        return objs;
    }


}

//@ts-ignore
window.Triangle = Triangle;