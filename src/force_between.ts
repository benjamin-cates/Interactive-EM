import { Object, ObjectTypes } from "./base";
import Conductor from "./charges/conductor";
import FiniteLine from "./charges/finite_line";
import InfinitePlane from "./charges/infinite_plane";
import PointCharge from "./charges/point_charge";
import Triangle from "./charges/triangle";
import Vector from "./vector";

/*
Let f = finite line
Let i = infinite plane
Let p = point charge

    A: f, i, p
   b:
    f  n  s  s
    i  n  n  s
    p  n  n  n





*/
//Returns the force onto a from b (a negative force is applied to b) and the torque onto a from b point that is in the middle of the two centers.
export default function forceBetween(a: Object, b: Object): { force: Vector, torque: number } {
    let atype = a.getType();
    let btype = b.getType();
    //Swap objects if the type of a is alphabetically higher than b
    let isSwapped = false;
    if (atype > btype) {
        [a, b] = [b, a];
        isSwapped = true;
    }
    let force = Vector.origin();
    let torque = 0;

    if (atype == "finite_line") {
        if (btype == "finite_line") {
            //OH NO THE HORROR

        }
        else if (btype == "infinite_plane") {
            //TODO: Figure out what portion of the line is on each side of the plane
            //Maybe use some geometry to find the intersection of the plane wrt the lines coordinate system

        }
        else if (btype == "point_charge") {
            //Force equal to field caused by line charge
            force = a.fieldAt(b.position);
            force.x *= (b as PointCharge).charge;
            force.y *= (b as PointCharge).charge;
            //TODO: Calculate torque
            torque = 0;
        }

    }
    else if (atype == "infinite_plane") {
        //btype == finite_plane is covered by the swap
        if (btype == "point_charge") {
            //Return force caused by the negitve efield at point b with zero torque
            force = a.fieldAt(b.position);
            force.x = -(b as PointCharge).charge * force.x;
            force.y = -(b as PointCharge).charge * force.y;
            torque = 0
        }
        //No force between infinite planes because they are immovable
        else if (btype == "infinite_plane") {
            return { force: Vector.origin(), torque: 0 };
        }

    }
    else if (atype == "point_charge") {
        //All other interaction types are covered by the swap
        if (btype == "point_charge") {
            force = b.fieldAt(a.position);
            force.x *= (a as PointCharge).charge;
            force.y *= (a as PointCharge).charge;
            torque = 0;
        }
    }
    if (isSwapped) {
        force.x = -force.x;
        force.y = -force.y;
        torque = -torque;
    }
    return { force, torque };
}