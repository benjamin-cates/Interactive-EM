import Scene from "./scene";
import Vector from "./vector";
import { Object, ObjectTypes } from "./base";

//This class contains static methods for converting properties objects (implemented as javascript objects) to and from strings.
export default class Properties {

    //Stringify different types
    private static itemStringify = (item: any) => {
        //Stringify scene
        if (item instanceof Vector) {
            return "\"!" + item.toString() + "\"";
        }
        //Stringify scene
        else if (item instanceof Scene) return `"!scene"`;
        //Stringify array
        if (Array.isArray(item)) {
            let out = "[";
            for (let i = 0; i < item.length; i++) {
                out += Properties.itemStringify(item[i]) + ",";
            }
            if (out.at(-1) == ",") out = out.substring(0, out.length - 1);
            return out + "]";
        }
        //Stringify object
        else if (item instanceof Object) {
            return `{"!type":"${item.getType()}","!props":${Properties.stringify(item.getProperties())}}`;
        }
        //Stringify javascript object
        else if (typeof item == "object") return Properties.stringify(item);
        //Stringify string
        else if (typeof item == "string") return `"${item}"`;
        else return item;
    }
    //Converts properties object to a string
    static stringify = (obj: { [key: string]: any }) => {
        let out = "{";
        for (let key in obj) {
            out += `"${key}":${Properties.itemStringify(obj[key])},`;
        }
        if (out.at(-1) == ",") out = out.substring(0, out.length - 1);
        return out + "}";
    }
    //Replaces shorthand with real objects
    private static fix = (props: { [key: string]: any }) => {
        for (let key in props) {
            //Replace partial objects with full objects
            if (key == "!type" || key == "!props") {
                let type = props["!type"] as ObjectTypes;
                //@ts-ignore
                return new Scene.defaultObjects[type].constructor(Properties.fix(props["!props"]));
            }
            //Replace vectors and scene with real conterpart
            if (typeof props[key] == "string") {
                if (props[key].startsWith("!<")) {
                    props[key] = Vector.parseVector(props[key].substring(1));
                }
                else if (props[key] == "!scene") {
                    //@ts-ignore
                    props[key] = window.scene;
                }
            }
            //Iterate over objects and arrays
            else if (typeof props[key] == "object") {
                props[key] = Properties.fix(props[key]);
            }
            else if (Array.isArray(props[key])) {
                for (let i = 0; i < props[key].length; i++) {
                    if (typeof props[key][i] == "object") props[key][i] = Properties.fix(props[key][i]);
                }
            }
        }
        return props;
    }
    //Converts string to properties object
    static parse = (props: string): { [key: string]: any } => {
        let out = JSON.parse(props);
        out = Properties.fix(out);
        return out;
    }


}
