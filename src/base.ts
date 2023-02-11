import Vector from "./vector";
export default class Object {
    //Physical properties
    mass: number;
    position: Vector;
    velocity: Vector;

    constructor(mass: number, position: Vector) {
        this.velocity = new Vector(0, 0);
        this.position = position;
        this.mass = mass;
    }

    //Electric field properties
    voltageAt = (pos: Vector) => {
        return 0;
    }
    fieldAt = (pos: Vector): Vector => {
        return Vector.origin();
    }

    //Position properties
    incrementPosition = (dt: number) => {

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

}