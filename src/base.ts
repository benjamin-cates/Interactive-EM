export interface Vector {
    x: number;
    y: number;
};

export default class Object {
    //Physical properties
    mass: number;
    position: Vector;
    velocity: Vector;

    constructor(mass: number, position: Vector) {
        this.velocity = {x: 0, y: 0};
        this.position = position;
        this.mass = mass;
    }

    //Electric field properties
    voltageAt = (pos: Vector) => {
        return 0;
    }
    fieldAt = (pos: Vector): Vector => {
        return {x: 0, y: 0};
    }

    //Position properties
    incrementPosition = (dt: number) => {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

}