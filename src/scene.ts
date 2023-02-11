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

    render() {

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

}