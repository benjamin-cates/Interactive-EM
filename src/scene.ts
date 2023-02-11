import Object from "./base";
import Conductor from "./charges/conductor";
import FiniteLine from "./charges/finite_line";
import InfinitePlane from "./charges/infinite_plane";
import PointCharge from "./charges/point_charge";
import Vector from "./vector";

class Scene {
    objects: Object[];
    timeSpeed: number;
    width: number;
    height: number;
    physicsPerSecond: number;

    render() {
        requestAnimationFrame(this.render);
        this.objects.forEach((object) => {
            object.render();
        });
    }
    fieldAt = (pos: Vector): Vector => {
        let out = Vector.origin();
        this.objects.forEach((object) => {
            out.add(object.fieldAt(pos));
        });
        return out;
    }

    voltageAt = (pos: Vector): number => {
        let potential = 0;
        this.objects.forEach((object) => {
            potential += object.voltageAt(pos);
        });
        return potential;
    }
    physics(dt: number) {
        this.objects.forEach((object) => {
            object.incrementPosition(dt);
        });
    }

    //Returns the force and torque between two objects. Force is measured on object a and the opposite directional force is on object b. Torque is measured for both from the midpoint of a.position and b.position. Use the parallel axis theorem to find the torque on an objects center of mass.
    forceBetween = (a: Object, b: Object): { force: Vector, torque: number } => {
        if (a instanceof PointCharge) {

        }
        return { force: Vector.origin(), torque: 0 };
    }

}