export default class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `<${this.x}, ${this.y}>`;
    }
    isZero = (): boolean => {
        return this.x === 0 && this.y === 0;
    }
    //Returns the magnitude of the vector
    magnitude = (): number => {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    //Returns the unit vector of the vector v/||v||
    unit = (): Vector => {
        return Vector.multiply(this, 1 / this.magnitude());
    }
    //Returns a new vector that is a clone
    copy = (): Vector => {
        return new Vector(this.x, this.y);
    }
    add = (v: Vector) => {
        this.x += v.x;
        this.y += v.y;
    }
    rotate = (angle: number) => {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        let x = this.x * cos - this.y * sin;
        let y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
    }
    rotateByVector = (vec: Vector) => {
        let uVec = vec.unit();
        let sin = uVec.y;
        let cos = uVec.x;
        let x = this.x * cos - this.y * sin;
        let y = this.x * sin + this.y * cos;
        this.x = x;
        this.y = y;
    }
    static add = (a: Vector, b: Vector): Vector => {
        return new Vector(a.x + b.x, a.y + b.y);
    };
    static multiply = (a: Vector, scalar: number): Vector => {
        return new Vector(a.x * scalar, a.y * scalar);
    }
    static distance = (a: Vector, b: Vector): number => {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
    static dot = (a: Vector, b: Vector): number => {
        return a.x * b.x + a.y * b.y;
    }
    //Convert [x,y] array to a vector
    static fromArray = (a: number[]): Vector => {
        return new Vector(a[0], a[1]);
    }
    static origin = (): Vector => {
        return new Vector(0, 0);
    }
};