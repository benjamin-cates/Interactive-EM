import { sign, sqrt } from "mathjs";

export default class Vector {
    x: number;
    y: number;
    z: number
    constructor(x: number, y: number, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    toString() {
        if (this.z == 0) {
            return `<${this.x.toFixed(2)}, ${this.y.toFixed(2)}>`;
        }
        return `<${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}>`;
    }
    isZero = (): boolean => {
        return this.x === 0 && this.y === 0 && this.z == 0;
    }
    //Returns the magnitude of the vector
    magnitude = (): number => {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    //Returns the unit vector of the vector v/||v||
    unit = (): Vector => {
        return Vector.multiply(this, 1 / this.magnitude());
    }
    //Returns a new vector that is a clone
    copy = (): Vector => {
        return new Vector(this.x, this.y, this.z);
    }
    add = (v: Vector) => {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    rotate = (angle: number) => {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        let x = this.x * cos - this.y * sin;
        let y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }
    scale = (scalar: number) => {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
    rotateByVector = (vec: Vector) => {
        let uVec = vec.unit();
        let sin = uVec.y;
        let cos = uVec.x;
        let x = this.x * cos - this.y * sin;
        let y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
        return this;
    }
    static add = (a: Vector, b: Vector): Vector => {
        return new Vector(a.x + b.x, a.y + b.y, a.z + b.z);
    };
    static subtract = (a: Vector, sub: Vector): Vector => {
        return new Vector(a.x - sub.x, a.y - sub.y, a.z - sub.z);
    }
    static multiply = (a: Vector, scalar: number): Vector => {
        return new Vector(a.x * scalar, a.y * scalar, a.z * scalar);
    }
    static distance = (a: Vector, b: Vector): number => {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    static angleBetweenAsVector = (vectorOne: Vector, vectorTwo: Vector): Vector => {
        let vectorOneMagnitude = vectorOne.magnitude();
        let vectorTwoMagnitude = vectorTwo.magnitude();

        let x = Vector.dot(vectorOne,vectorTwo) / (vectorOneMagnitude*vectorTwoMagnitude);
        let y = Vector.cross3D(vectorOne, vectorTwo).magnitude() / (vectorOneMagnitude*vectorTwoMagnitude);

        return new Vector(x,y);
    }
    static halfAngle = (vect: Vector): Vector => { //be normal 
        let unitVect = vect.unit();
        let cos = unitVect.x;
        let sin = unitVect.y;

        let x = sign(sin) * Math.sqrt((1+cos)/2); 
        let y = Math.sqrt((1-sin)/2);

        return new Vector(x,y);
    }
    static dot = (a: Vector, b: Vector): number => {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
    static cross2D = (a: Vector, b: Vector): number => {
        return a.x * b.y - a.y * b.x;
    }
    static cross3D = (a: Vector, b: Vector): Vector => {
        let x = a.y * b.z - b.y * a.z;
        let y = a.x * b.z - b.x * a.z;
        let z = a.x * b.y - b.x * a.y;

        return new Vector(x,y,z);
    }

    static scalarProject = (a: Vector, targetVector: Vector): number => {
        return Vector.dot(a, targetVector) / targetVector.magnitude();
    }
    static project = (a: Vector, targetVector: Vector): Vector => {
        return Vector.multiply(targetVector.unit(), Vector.scalarProject(a, targetVector));
    }
    static rotationMatrix = (angle: number): number[][] => {
        return [[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]];
    }
    static transform2D = (a: Vector, matrix: number[][]): Vector => {
        return new Vector(a.x * matrix[0][0] + a.y * matrix[0][1], a.x * matrix[1][0] + a.y * matrix[1][1]);
    }
    //Convert [x,y] array to a vector
    static fromArray = (a: number[]): Vector => {
        return new Vector(a[0], a[1]);
    }
    static rHat = (pos: Vector, chargePos: Vector): Vector => {
        return Vector.subtract(pos, chargePos).unit();
    }
    static inverseSquareField = (pos: Vector, chargePos: Vector): Vector => {
        let dist = Vector.distance(pos, chargePos);
        return Vector.multiply(Vector.rHat(pos, chargePos), 1 / (dist * dist));
    }
    static origin = (): Vector => {
        return new Vector(0, 0);
    }
};