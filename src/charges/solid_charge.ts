import Object from "../base";
import Vector from "../vector";

export class Triangle {
    points: Vector[];
    hypot1: number;
    hypot2: number;
    opposite: number;
    opTrans: Vector
    hypotCenter: Vector;
    halfWidth: number;
    height: number;
    defRotation: number;
    constructor(p1: Vector, p2: Vector, p3: Vector) {
        this.points = [p1, p2, p3];
        //Find hypotenuses
        let d1 = Vector.distance(p1, p2);
        let d2 = Vector.distance(p2, p3);
        let d3 = Vector.distance(p3, p1);
        let hypot = 2, hypot2 = 0, opposite = 1;
        if (d1 >= d2 && d1 >= d3) hypot = 0, hypot2 = 1, opposite = 2;
        else if (d2 >= d1 && d2 >= d3) hypot = 1, hypot2 = 2, opposite = 0;
        this.hypot1 = hypot;
        this.hypot2 = hypot2;
        this.opposite = opposite;

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

    voltageAt(pos: Vector): number {
        //Translate so the center of the hypotenuse is at the origin
        let p = Vector.add(pos, Vector.multiply(this.hypotCenter, -1));
        p.rotate(this.defRotation);
        let halfWidth = this.halfWidth;
        let height = this.opTrans.y;
        let ox = this.opTrans.x;

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
        return f3(l1, a, b) - f3(l0, a, b) + f3(l2, c, d) - f3(l1, c, d) + f1(l0) - f1(l2);
    }
}

//@ts-ignore
window.Triangle = Triangle;

export class SolidCharge extends Object {
    //Measured in microcoloumbs per meter square
    chargeDensity: number;
}
