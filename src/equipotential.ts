import PointCharge from "./charges/point_charge";
import FiniteLine from "./charges/finite_line";
import InfinitePlane from "./charges/infinite_plane";
import Triangle from "./charges/triangle";
import Conductor from "./conductors/conductor";
import { Object, ObjectTypes } from "./base";

export default class VoltCanvas {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    static uniforms = [
        "point_count",
        "point_data",
        "line_count",
        "line_pos",
        "line_data",
        "plane_count",
        "plane_data",
        "tri_count",
        "tri_data1",
        "tri_data2",
        "conductor_count",
        "conductor_data",
        "conductor_sizes",
        "conductor_point_data",
        "canvas",
        "scene",
        "positive_color",
        "negative_color",
        "neutral_color",
        "equipotential_color",
    ];
    //Location of uniform buffers in the fragment shader
    uniLoc: {
        [key: string]: WebGLUniformLocation;
    } = {};
    private colors = {
        "positive_color": [1, 0, 0.4, 1],
        "negative_color": [0.3, 0, 1, 1],
        "neutral_color": [0.5, 0, 0.6, 1],
        "equipotential_color": [0.2, 0.8, 0.2, 0.9],
    };
    //Update color state by passing in an object with the color names as keys
    setColors(cols: any) {
        window.Object.assign(this.colors, cols);
        for (let i in this.colors) {
            let col = this.colors[i];
            this.gl.uniform4f(this.uniLoc[i], col[0], col[1], col[2], col[3]);
        }
    }
    resize(width: number, height: number) {
        this.gl.uniform2f(this.uniLoc["scene"], width, height);
        this.gl.uniform2f(this.uniLoc["canvas"], window.innerWidth, window.innerHeight);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    }
    constructor(canvas: HTMLCanvasElement) {
        //Get canvas context
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2");
        if (!this.gl) {
            alert("WebGL not supported");
            return;
        }
        this.program = this.gl.createProgram();
        //Add vertex and fragment shaders to program
        const vertexShader = VoltCanvas.createShader(this.gl, this.gl.VERTEX_SHADER, VoltCanvas.vertexShader);
        this.gl.attachShader(this.program, vertexShader);
        const fragmentShader = VoltCanvas.createShader(this.gl, this.gl.FRAGMENT_SHADER, VoltCanvas.fragmentShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
        //Get locations of uniforms in fragment shader
        VoltCanvas.uniforms.forEach((name) => {
            this.uniLoc[name] = this.gl.getUniformLocation(this.program, name);
        });
        this.setColors({});
    }
    //Generic create shader function
    static createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log("Shader compilation error");
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    //Update the uniforms for the object data
    updateObjects = (objects: Object[]) => {
        //Points
        let points = objects.filter((obj) => obj instanceof PointCharge) as PointCharge[];
        let pointData = new Float32Array(points.length * 3);
        points.forEach((point, i) => {
            pointData[i * 3] = point.position.x;
            pointData[i * 3 + 1] = point.position.y;
            pointData[i * 3 + 2] = point.charge;
        });
        this.gl.uniform1i(this.uniLoc.point_count, points.length);
        if (points.length > 0) this.gl.uniform3fv(this.uniLoc.point_data, pointData);

        //Finite lines
        let lines = objects.filter((obj) => obj instanceof FiniteLine) as FiniteLine[];
        let linePos = new Float32Array(lines.length * 3);
        let lineData = new Float32Array(lines.length * 2);
        lines.forEach((line, i) => {
            linePos[i * 3] = line.position.x;
            linePos[i * 3 + 1] = line.position.y;
            linePos[i * 3 + 2] = line.rotation;
            lineData[i * 2] = line.chargeDensity;
            lineData[i * 2 + 1] = line.length;
        });
        this.gl.uniform1i(this.uniLoc.line_count, lines.length);
        if (lines.length > 0) {
            this.gl.uniform2fv(this.uniLoc.line_data, lineData);
            this.gl.uniform3fv(this.uniLoc.line_pos, linePos);
        }

        //Planes
        let planes = objects.filter((obj) => obj instanceof InfinitePlane) as InfinitePlane[];
        let planeData = new Float32Array(planes.length * 4);
        planes.forEach((plane, i) => {
            planeData[i * 4] = plane.position.x;
            planeData[i * 4 + 1] = plane.position.y;
            planeData[i * 4 + 2] = plane.rotation;
            planeData[i * 4 + 3] = plane.chargeDensity / 1000;
        });
        this.gl.uniform1i(this.uniLoc.plane_count, planes.length);
        if (planes.length > 0) this.gl.uniform4fv(this.uniLoc.plane_data, planeData);

        //Triangles
        let tris = objects.filter((obj) => obj instanceof Triangle) as Triangle[];
        //Stores [x, y, rotation, half width]
        let triData1 = new Float32Array(tris.length * 4);
        //Stores [charge, tip.x, tip.y]
        let triData2 = new Float32Array(tris.length * 3);
        tris.forEach((tri, i) => {
            triData1[i * 4 + 0] = tri.position.x;
            triData1[i * 4 + 1] = tri.position.y;
            triData1[i * 4 + 2] = tri.rotation;
            triData1[i * 4 + 3] = tri.halfWidth;

            triData2[i * 3 + 0] = tri.chargeDensity;
            triData2[i * 3 + 1] = tri.tip.x;
            triData2[i * 3 + 2] = tri.tip.y;
        });
        this.gl.uniform1i(this.uniLoc.tri_count, tris.length);
        if (tris.length > 0) {
            this.gl.uniform4fv(this.uniLoc.tri_data1, triData1);
            this.gl.uniform3fv(this.uniLoc.tri_data2, triData2);
        }

        //Conductors
        let conductors = objects.filter((obj) => obj instanceof Conductor) as Conductor[];
        let conductorSizes = new Int32Array(conductors.length);
        let conductorPointData = new Float32Array(conductors.length * 200 * 3);
        conductors.forEach((conductor, i) => {
            conductorSizes[i] = conductor.points.length;
            conductor.worldSpacePoints.forEach((point, j) => {
                let ind = i * 50 * 3 + j * 3;
                conductorPointData[ind + 0] = point.x;
                conductorPointData[ind + 1] = point.y;
                conductorPointData[ind + 2] = conductor.charges[j];
            });
        });
        this.gl.uniform1i(this.uniLoc.conductor_count, conductors.length);
        if (conductors.length > 0) {
            this.gl.uniform1iv(this.uniLoc.conductor_sizes, conductorSizes);
            this.gl.uniform3fv(this.uniLoc.conductor_point_data, conductorPointData);
        }

    }
    static vertexShader = `#version 300 es
        precision mediump float;
        in vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;
    static fragmentShader = `#version 300 es
        precision mediump float;

        uniform vec2 canvas;
        uniform vec2 scene;

        uniform int point_count;
        uniform vec3 point_data[40];

        uniform int line_count;
        uniform vec3 line_pos[40];
        uniform vec2 line_data[40];

        uniform int plane_count;
        uniform vec4 plane_data[20];

        uniform int tri_count;
        uniform vec4 tri_data1[40];
        uniform vec3 tri_data2[40];

        uniform int conductor_count;
        uniform int conductor_sizes[20];
        uniform vec3 conductor_point_data[400];


        uniform vec4 neutral_color;
        uniform vec4 positive_color;
        uniform vec4 negative_color;
        uniform vec4 equipotential_color;

        const float contour = 1.0;


        float triAD(float y,float a,float b) {
            float f = a+b/y;
            float g = (a*sqrt(f*f+1.0)-a)/f + 1.0;
            float l = sqrt(a*a+1.0);
            return y*asinh(f)+b/l*log(abs((g+l)/(g-l)));
        }
        float triAD0(float a, float b) {
            float l = sqrt(a*a+1.0);
            return 2.0*b/l*log(abs((l-1.0)/a));
        }

        out vec4 fragColor;
        void main() {
            vec2 p = vec2((gl_FragCoord.x/canvas.x-0.5) * scene.x , -(gl_FragCoord.y/canvas.y-0.5) * scene.y);
            float volt = 0.0;
            for(int i = 0; i < point_count; i++) {
                float charge = point_data[i].z;
                float dist = distance(point_data[i].xy, p.xy);
                volt += charge / dist;
            }
            for(int i = 0; i < line_count; i++) {
                float chargeDensity = line_data[i].x;
                float halfLen = line_data[i].y/2.0;
                vec2 center = line_pos[i].xy;
                float rotation = line_pos[i].z;
                vec2 dir = vec2(cos(rotation), sin(rotation));
                vec2 relPos = p - center;
                float g = dot(relPos,dir);
                vec2 end1 = center - dir * halfLen;
                vec2 end2 = center + dir * halfLen;
                halfLen = halfLen * sign(g);
                volt+=sign(g)*chargeDensity*log((distance(p,end1)+abs(g)+halfLen)/(distance(p,end2)+abs(g)-halfLen));
            }

            for(int i = 0; i < plane_count; i++) {
                float chargeDensity = plane_data[i].w;
                vec2 center = plane_data[i].xy;
                float rotation = plane_data[i].z;
                vec2 dir = vec2(sin(rotation), -cos(rotation));
                vec2 relPos = p - center;
                float dist = abs(dot(relPos,dir));
                volt+=(100.0-6.28317*dist)*chargeDensity;
            }

            for(int i = 0; i < tri_count; i++) {
                float halfWidth = tri_data1[i].w;
                float rotation = tri_data1[i].z;
                vec2 center = tri_data1[i].xy;
                float chargeDensity = tri_data2[i].x;
                vec2 tip = tri_data2[i].yz;
                float height = 3.0/2.0 * tip.y;

                vec2 relPos = p - center;
                float cosRot = cos(rotation);
                float sinRot = sin(-rotation);
                relPos = vec2(cosRot * relPos.x - sinRot * relPos.y, sinRot * relPos.x + cosRot * relPos.y);

                relPos.y+=tip.y/2.0;

                float a1 = (tip.x-halfWidth)/height;
                float a2 = (tip.x+halfWidth)/height;
                float b1 = relPos.y*a1 + halfWidth - relPos.x;
                float b2 = relPos.y*a2 - halfWidth - relPos.x;

                if(sign(relPos.y-height)!=sign(relPos.y)) {
                    float corr = triAD0(a1,b1)-triAD0(a2,b2);
                    volt+=chargeDensity*(triAD(height-relPos.y,a1,b1)+triAD(-relPos.y,a1,b1)-triAD(height-relPos.y,a2,b2)-triAD(-relPos.y,a2,b2)+corr);
                }
                else {
                    volt += chargeDensity*sign(-relPos.y)*(triAD(height-relPos.y,a1,b1)-triAD(-relPos.y,a1,b1)-triAD(height-relPos.y,a2,b2)+triAD(-relPos.y,a2,b2));
                }


            }

            for(int i = 0; i < conductor_count; i++) {
                for(int x = 0; x < conductor_sizes[i]; x++) {
                    int ind = i*50 + x;
                    float charge = conductor_point_data[ind].z;
                    vec2 delta = conductor_point_data[ind].xy - p;
                    volt += charge/sqrt(delta.x*delta.x+delta.y*delta.y+0.83);
                }
            }

            float colVolt = 2.0/(1.0+exp(-volt*2.0))-1.0;
            fragColor = mix(mix(neutral_color,negative_color,0.0-colVolt), mix(neutral_color, positive_color, colVolt), step(colVolt, 0.0));
            float dVolt = sign(volt)*log(abs(volt)+1.0);
            float dx = dFdx(dVolt);
            float dy = dFdy(dVolt);
            float dv = min(sqrt(abs(dx*dx)+abs(dy*dy)),0.5);
            dVolt*=10.0;
            float lineWidth = 18.0;
            float fracv = fract(dVolt);
            vec4 vLines = vec4(equipotential_color.rgb,smoothstep(1.0,0.0,min(fracv,1.0-fracv)/dv/lineWidth));
            vLines.a*=equipotential_color.a;
            //Blend with contour line
            fragColor = vec4(fragColor.rgb*(1.0-vLines.a) + vLines.rgb*vLines.a,1.0);

        }

    `;
    /*
        for(int i = 0; i < line_count; i++) {
            float chargeDensity = line_data[i].x;
            float halflen = line_data[i].y/2;
            vec2 center = line_pos[i].xy;
            float rotation = line_pos[i].z;
            vec2 dir = vec2(cos(rotation), sin(rotation));
            vec2 relPos = gl_FragCoord.xy - pos;
            vec2 end1 = center - dir * halflen;
            vec2 end2 = center + dir * halflen;
            float f = dot(relPos,dir)+halfLen;
            voltage+=chargeDensity*log(abs((dist(pos,end1)+f))/(dist(pos,end2)+f)));
        }
        for(int i = 0; i < plane_count; i++) {
            float chargeDensity = plane_data[i].z;
            float rotation = plane_data[i].w;
            vec2 pos = plane_data[i].xy;
            vec2 dir = vec2(cos(rotation), sin(rotation));
            vec2 relPos = gl_FragCoord.xy - pos;
            float dist = dot(relPos, dir);
        }



    */

    fullscreenRender = () => {
        //Draw pixel shader across whole screen
        const positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

}