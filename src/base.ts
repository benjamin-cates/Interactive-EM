import Vector from "./vector";
export type ObjectTypes = "point_charge" | "infinite_plane" | "conductor" | "finite_line" | "triangle_charge" | "ring_conductor" | "all";
export class Object {
    //Physical properties
    mass: number;
    position: Vector;
    velocity: Vector;
    //Rotation from default orientation in radians
    rotation: number;
    angularVelocity: number;

    constructor(mass: number, position: Vector, rotation: number = 0) {
        this.velocity = new Vector(0, 0);
        this.position = position;
        this.mass = mass;
        this.rotation = rotation;
        this.angularVelocity = 0;
    }

    clone = () => {
        let clone = new Object(this.mass, this.position.copy(), this.rotation);
        clone.velocity = this.velocity.copy();
        clone.angularVelocity = this.angularVelocity;
        return clone;
    }

    render = (ctx: CanvasRenderingContext2D) => {

    }
    getType: () => ObjectTypes = () => "all";


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
        this.rotation += this.angularVelocity * dt;
        if (this.rotation > Math.PI) this.rotation -= 2 * Math.PI;
        if (this.rotation < -Math.PI) this.rotation += 2 * Math.PI;
        if (this.angularVelocity != 0) this.updateRotation();
        if (this.velocity.x != 0 || this.velocity.y != 0) this.updatePosition();
    }
    distanceFrom(pos: Vector): number {
        return Vector.subtract(this.position, pos).magnitude();
    }

    //Updates properties related to position (such as end points)
    updatePosition = () => {

    }
    //Updates properties related to rotation (such as normal vector)
    updateRotation = () => {

    }
    applyForces = (dt: number, force: Vector, torque: number) => {
        this.incrementPosition(dt);
        this.velocity.add(Vector.multiply(force, dt / this.mass));
    }
    //For complicated physics calculations, decomposes the object into a list of point charges that is as long as detail
    decompose = (detail: number): Object[] => {
        return [this];
    }

}