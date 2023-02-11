import Object from "../base";
import Vector from "../vector";

export default class FiniteLine extends Object {
    //Measured in microcoloumbs per meter
    chargeDensity: number;
    //Measured in meters
    length: number;

    constructor(chargeDensity: number, mass: number, position: Vector, rotation: number, length: number) {
        super(mass, position);
        this.chargeDensity = chargeDensity;
        this.rotation = rotation;
        this.length = length;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = this.chargeDensity > 0 ? "red" : (this.chargeDensity == 0 ? "black" : "blue");
        //Half length of the line in the direction of start
        let halfLen = Vector.multiply(new Vector(Math.cos(this.rotation), Math.sin(this.rotation)), this.length / 2);
        let start = Vector.add(this.position, halfLen);
        let end = Vector.add(this.position, Vector.multiply(halfLen, -1));
        //Non linear thickness
        ctx.lineWidth = this.chargeDensity * 25 / (this.chargeDensity + 3);
        //Path from start to end
        ctx.beginPath();
        ctx.moveTo(start.x * 100, start.y * 100);
        ctx.lineTo(end.x * 100, end.y * 100);
        ctx.stroke();
        ctx.closePath();

    }
}
