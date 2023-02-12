import Object from "../base";
import Vector from "../vector";
import Scene from "../scene";

export default class InfinitePlane extends Object {
    //Measured in microcoulombs per meter
    chargeDensity: number;

    constructor(chargeDensity: number, mass: number, position: Vector, rotation: number = 0) {
        super(mass, position, rotation);
        this.chargeDensity = chargeDensity;
    }

    render = (ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = Scene.getChargeColor(this.chargeDensity);
        //Line width is non linear wrt to charge density
        ctx.lineWidth = Math.abs(this.chargeDensity) * 75 / (Math.abs(this.chargeDensity) + 3);
        ctx.beginPath();
        let dir = new Vector(40 * Math.cos(this.rotation), 40 * Math.sin(this.rotation));
        ctx.moveTo((this.position.x + dir.x) * 100, (this.position.y + dir.y) * 100);
        ctx.lineTo((this.position.x - dir.x) * 100, (this.position.y - dir.y) * 100);
        ctx.stroke();
        ctx.closePath();
    }
}