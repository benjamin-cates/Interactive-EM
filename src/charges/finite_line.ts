import Object from "../base";
import Vector from "../vector";

export default class FiniteLine extends Object {
    //Measured in microcoloumbs per meter
    chargeDensity: number;
    //Measured in meters
    length: number;
    displayThickness: number;

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = this.chargeDensity > 0 ? "red" : (this.chargeDensity == 0 ? "black" : "blue");
        ctx.beginPath();
        let halfLen = Vector.multiply(new Vector(Math.sin(this.rotation), Math.cos(this.rotation)), this.length / 2);
        let start = Vector.add(this.position, halfLen);
        let end = Vector.add(this.position, Vector.multiply(halfLen, -1));
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();

    }
}
