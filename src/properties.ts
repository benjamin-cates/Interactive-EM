import Scene from "./scene";
import Vector from "./vector";
import { Object, ObjectTypes } from "./base";

export default class Properties {

    private static itemStringify = (item: any) => {
        if (item instanceof Vector) {
            return "\"!" + item.toString() + "\"";
        }
        else if (item instanceof Scene) return `"!scene"`;
        if (Array.isArray(item)) {
            let out = "[";
            for (let i = 0; i < item.length; i++) {
                out += Properties.itemStringify(item[i]) + ",";
            }
            if (out.at(-1) == ",") out = out.substring(0, out.length - 1);
            return out + "]";
        }
        else if (item instanceof Object) {
            return `{"!type":"${item.getType()}","!props":${Properties.stringify(item.getProperties())}}`;
        }
        else if (typeof item == "object") return Properties.stringify(item);
        else if (typeof item == "string") return `"${item}"`;
        else return item;
    }
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
    static parse = (props: string): { [key: string]: any } => {
        let out = JSON.parse(props);
        out = Properties.fix(out);
        return out;
    }


}
