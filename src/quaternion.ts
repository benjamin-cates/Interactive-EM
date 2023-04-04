import Vector from "./vector";

export default class Quaternion {
    w: number;
    x: number;
    y: number;
    z: number;

    constructor(w: number, x: number, y:number, z:number) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    magnitude = (): number => {
        return Math.sqrt(this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z);
    }

    normalize = () => {
       let magnitude = this.magnitude();
       this.w = this.w/magnitude;
       this.x = this.x/magnitude;
       this.y = this.y/magnitude;
       this.z=  this.z/magnitude;
    }

    getVector = () => {
        return new Vector(this.x, this.y, this.z);
    }

    static multiplyByQuat = (leftQuat: Quaternion, rightQuat: Quaternion) => {
        let quat = new Quaternion(0,0,0,0);
        quat.w = (leftQuat.w * rightQuat.w) - (leftQuat.x * rightQuat.x) - (leftQuat.y * rightQuat.y) - (leftQuat.z * rightQuat.z);
        quat.x = (leftQuat.w * rightQuat.x) + (leftQuat.x * rightQuat.w) + (leftQuat.y * rightQuat.z) - (leftQuat.z * rightQuat.y);
        quat.y = (leftQuat.w * rightQuat.y) + (leftQuat.y * rightQuat.w) + (leftQuat.x * rightQuat.z) - (leftQuat.z * rightQuat.x);
        quat.z = (leftQuat.w * rightQuat.z) + (leftQuat.z * rightQuat.w) + (leftQuat.x * rightQuat.y) - (leftQuat.y * rightQuat.x);
        return quat;
    }

    static multiplyByScalar = (quaternion: Quaternion, k: number) => {
        let quat = quaternion;
        quat.w = quat.w * k;
        quat.x = quat.x * k;
        quat.y = quat.y * k;
        quat.z = quat.z * k;
        return quat;
    }

    static conjugate = (quat: Quaternion) => {
        return new Quaternion(quat.w, -quat.x, -quat.y, -quat.z);
    }

    static inverse = (quat: Quaternion) => {
        let magnitude = quat.magnitude(); 
        return Quaternion.multiplyByScalar(Quaternion.conjugate(quat), 1 / (magnitude * magnitude));
    }

    static rotateByVector = (vect: Vector, axis: Vector, angle: Vector):Quaternion => {
        let normalAngleVector = Vector.halfAngle(angle.unit());
        let normalAxis = axis.unit();
        let Q = Quaternion.fromVector(0,vect);
        let P = Quaternion.fromVector(normalAngleVector.x, Vector.multiply(normalAxis, normalAngleVector.y))
        let PIn = Quaternion.inverse(P);
        
        let result = Quaternion.multiplyByQuat(P, Q);
        result = Quaternion.multiplyByQuat(result, PIn);

        return result;
    }

    static rotateByAngle = (vect: Vector, axis: Vector, angle: number):Quaternion => {
        let normalAngleVector = new Vector(Math.cos(angle/2), Math.sin(angle/2));
        let normalAxis = axis.unit();
        let Q = Quaternion.fromVector(0,vect);
        let P = Quaternion.fromVector(normalAngleVector.x, Vector.multiply(normalAxis, normalAngleVector.y))
        let PIn = Quaternion.inverse(P);
        
        let result = Quaternion.multiplyByQuat(P, Q);
        result = Quaternion.multiplyByQuat(result, PIn);

        return result;
    }

    static fromVector = (w: number, cVect: Vector):Quaternion => {
        return new Quaternion(w, cVect.x, cVect.y, cVect.z);
    }
}