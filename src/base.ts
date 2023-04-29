import Vector from "./vector";
export type ObjectTypes = "point_charge" | "infinite_plane" | "conductor" | "finite_line" | "ring_conductor" | "line_conductor" | "electric_dipole" | "all" | "scene";
export class Object {
    mass: number;
    position: Vector;
    velocity: Vector;
    //Rotation from default orientation in radians
    rotation: number;
    angularVelocity: number;

    constructor(properties: { [key: string]: number | Vector }) {
        this.velocity = properties.velocity as Vector ?? new Vector(0, 0);
        this.position = (properties.position as Vector) ?? Vector.origin();
        this.mass = properties.mass as number ?? 1;
        this.rotation = properties.rotation as number ?? 0;
        this.angularVelocity = properties.angularVelocity as number ?? 0;
    }


    //*** Functions implemented in each inherited class ***

    getProperties = (): { [key: string]: any } => {
        //This return is a default, should be overwritten
        return { mass: this.mass, position: this.position.copy(), velocity: this.velocity.copy(), rotation: this.rotation, angularVelocity: this.angularVelocity };
    }
    render = (ctx: CanvasRenderingContext2D): void => {
        //Draws object
    }
    getType = (): ObjectTypes => {
        //Should return object type
        return "all";
    }
    updateProperty = (property: string, value: any): void => {
        //Create function for each property change
        //Or calls updateBaseProperty as fallback
    }
    voltageAt = (pos: Vector): number => {
        return 0;
    }
    fieldAt = (pos: Vector): Vector => {
        return Vector.origin();
    }
    momentOfInertia = (): number => {
        return 0.00001;
    }
    distanceFrom(pos: Vector): number {
        //Generic distance from center
        return Vector.subtract(this.position, pos).magnitude();
    }
    decompose = (detail: number): Object[] => {
        //For complicated physics calculations.
        //Decomposes the object into a list of point charges that is as long as detail
        //Implemented for each class
        return [this];
    }

    //*** Generic functions ***

    //Increment position
    incrementPosition = (dt: number) => {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.rotation += this.angularVelocity * dt;
        if (this.rotation > Math.PI) this.rotation -= 2 * Math.PI;
        if (this.rotation < -Math.PI) this.rotation += 2 * Math.PI;
        if (this.angularVelocity != 0) this.updateProperty("rotation", this.rotation);
        if (this.velocity.x != 0 || this.velocity.y != 0) this.updateProperty("position", this.position);
    }
    //Return new constructed object with properties of old one
    clone = () => {
        //@ts-ignore
        return new this.constructor(this.getProperties());
    }
    //Called as a fallback when updateProperty does not need to implement base property
    updateBaseProperty = (property: string, value: number | Vector) => {
        if (property == "velocity") this.velocity = value as Vector;
        else if (property == "position") this.position = value as Vector;
        else if (property == "rotation") this.rotation = value as number;
        else if (property == "angularVelocity") this.angularVelocity = value as number;
        else if (property == "mass") this.mass = value as number;
        else throw new Error("Invalid property: " + property + " on type " + this.getType());
    }

}