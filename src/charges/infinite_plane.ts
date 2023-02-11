import Object from "../base";
import Vector from "../vector";

export default class InfinitePlane extends Object {
    //Measured in microcoulombs per meter
    chargeDensity: number;

    constructor(chargeDensity: number, mass: number, position: Vector, rotation: number = 0) {
        super(mass, position, rotation);
        this.chargeDensity = chargeDensity;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = this.chargeDensity > 0 ? "red" : (this.chargeDensity == 0 ? "black" : "blue");
        //Line width is non linear wrt to charge density
        ctx.lineWidth = this.chargeDensity * 75 / (this.chargeDensity + 3);
        ctx.beginPath();
        let dir = new Vector(40 * Math.cos(this.rotation), 40 * Math.sin(this.rotation));
        ctx.moveTo((this.position.x + dir.x) * 100, (this.position.y + dir.y) * 100);
        ctx.lineTo((this.position.x - dir.x) * 100, (this.position.y - dir.y) * 100);
        ctx.stroke();
        ctx.closePath();
    }
}