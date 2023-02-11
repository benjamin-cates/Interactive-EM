import Vector from "./vector";
export default class Object {
    //Physical properties
    mass: number;
    position: Vector;
    velocity: Vector;
    //Rotation from default orientation in radians
    rotation: number;
    angularVelocity: number;


    constructor(mass: number, position: Vector) {
        this.velocity = new Vector(0, 0);
        this.position = position;
        this.mass = mass;
    }

    render = (ctx: CanvasRenderingContext2D) => {

    }


    //Electric field properties
    voltageAt = (pos: Vector) => {
        return 0;
    }
    fieldAt = (pos: Vector): Vector => {
        return Vector.origin();
    }

    momentOfInertia = (): number => {
        return 0;
    }

    //Position properties
    incrementPosition = (dt: number) => {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }
    physics = (dt: number, force: Vector, torque: number) => {
        this.incrementPosition(dt);
        this.velocity.add(Vector.multiply(force, dt / this.mass));
    }

}