import PointCharge from "./charges/point_charge";
import FiniteLine from "./charges/finite_line";
import InfinitePlane from "./charges/infinite_plane";
import Triangle from "./charges/triangle";
import Conductor from "./conductors/conductor";
import { Object, ObjectTypes } from "./base";

const voltUpscale = 3;

export default class VoltCanvas {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    voltProgram: WebGLProgram;
    equipProgram: WebGLProgram;
    framebuffer: WebGLFramebuffer;
    texture: WebGLTexture;
    static voltUniforms = [
        "point_count",
        "line_count",
        "plane_count",
        "tri_count",
        "conductor_count",
        "data",
        "canvas",
        "scene",
    ];
    static equipUniforms = [
        "volts",
        "screen_size",
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
        "positive_color": [0.894, 0.094, 0.094, 1],
        "neutral_color": [0.525, 0.133, 0.463, 1],
        "negative_color": [0.160, 0.160, 0.810, 1],
        "equipotential_color": [0.180, 0.780, 0.180, 0.75],
    };
    //Update color state by passing in an object with the color names as keys
    setColors(cols: any) {
        this.gl.useProgram(this.equipProgram);
        window.Object.assign(this.colors, cols);
        for (let i in this.colors) {
            let col = this.colors[i];
            this.gl.uniform4f(this.uniLoc[i], col[0], col[1], col[2], col[3]);
        }
    }
    createFramebuffer = (width: number, height: number) => {
        this.gl.viewport(0, 0, window.innerWidth / voltUpscale, window.innerHeight / voltUpscale);
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        const level = 0, border = 0;
        const data = null;
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, this.gl.R32F,
            window.innerWidth / voltUpscale, window.innerHeight / voltUpscale, border,
            this.gl.RED, this.gl.FLOAT, data);
        this.gl.useProgram(this.equipProgram);
        this.gl.uniform1i(this.uniLoc["volts"], 0);
        this.gl.useProgram(this.voltProgram);

        // set the filtering so we don't need mips
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.framebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
    }
    resize(width: number, height: number) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.useProgram(this.voltProgram);
        this.gl.uniform2f(this.uniLoc["scene"], width, height);
        this.gl.uniform2f(this.uniLoc["canvas"], window.innerWidth / voltUpscale, window.innerHeight / voltUpscale);
        this.createFramebuffer(width, height);
        this.gl.useProgram(this.equipProgram);
        this.gl.uniform2f(this.uniLoc["screen_size"], window.innerWidth, window.innerHeight);
    }
    constructor(canvas: HTMLCanvasElement) {
        //Get canvas context
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl2");
        if (!this.gl) {
            alert("Your browser/device does not support WebGL2, consider using a different browser or device.");
            return;
        }
        const ext1 = this.gl.getExtension("EXT_color_buffer_float");
        const ext2 = this.gl.getExtension("OES_texture_float_linear");
        if (!ext1 || !ext2) {
            alert("Your browser/device does not support WebGL2, consider using a different browser or device.");
            return;
        }
        this.voltProgram = this.gl.createProgram();
        this.equipProgram = this.gl.createProgram();

        //Add vertex and fragment shaders to program
        const vertexShader = VoltCanvas.createShader(this.gl, this.gl.VERTEX_SHADER, VoltCanvas.vertexShader);
        this.gl.attachShader(this.voltProgram, vertexShader);
        this.gl.attachShader(this.equipProgram, vertexShader);
        let uniformCount = this.gl.getParameter(this.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        const voltShader = VoltCanvas.createShader(this.gl, this.gl.FRAGMENT_SHADER, VoltCanvas.makeVoltageShader(uniformCount));
        const equipShader = VoltCanvas.createShader(this.gl, this.gl.FRAGMENT_SHADER, VoltCanvas.makeEquipotentialShader(uniformCount));
        this.gl.attachShader(this.voltProgram, voltShader);
        this.gl.attachShader(this.equipProgram, equipShader);
        this.gl.linkProgram(this.voltProgram);
        this.gl.linkProgram(this.equipProgram);
        //Get locations of uniforms in fragment shader
        VoltCanvas.voltUniforms.forEach((name) => {
            this.uniLoc[name] = this.gl.getUniformLocation(this.voltProgram, name);
        });
        VoltCanvas.equipUniforms.forEach((name) => {
            this.uniLoc[name] = this.gl.getUniformLocation(this.equipProgram, name);
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
        this.gl.useProgram(this.voltProgram);
        //Get array of each type of object
        let points = objects.filter((obj) => obj instanceof PointCharge) as PointCharge[];
        this.gl.uniform1i(this.uniLoc.point_count, points.length);
        let lines = objects.filter((obj) => obj instanceof FiniteLine) as FiniteLine[];
        this.gl.uniform1i(this.uniLoc.line_count, lines.length);
        let planes = objects.filter((obj) => obj instanceof InfinitePlane) as InfinitePlane[];
        this.gl.uniform1i(this.uniLoc.plane_count, planes.length);
        let tris = objects.filter((obj) => obj instanceof Triangle) as Triangle[];
        this.gl.uniform1i(this.uniLoc.tri_count, tris.length);
        let conductors = objects.filter((obj) => obj instanceof Conductor) as Conductor[];
        let conductorSize = 0;
        for (let i = 0; i < conductors.length; i++) {
            conductorSize += 1;
            conductorSize += Math.ceil((conductors[i].zPoints + 1) / 2) * conductors[i].charges.length / conductors[i].zPoints;
        }
        this.gl.uniform1i(this.uniLoc.conductor_count, conductors.length);

        let data = new Float32Array(points.length * 4 + lines.length * 8 + planes.length * 4 + tris.length * 8 + conductorSize * 4);
        let offset = 0;
        points.forEach((point, i) => {
            data[offset + i * 4] = point.position.x;
            data[offset + i * 4 + 1] = point.position.y;
            data[offset + i * 4 + 2] = point.charge;
            data[offset + i * 4 + 4] = 0;
        });
        offset += points.length * 4;

        //Finite lines
        lines.forEach((line, i) => {
            data[offset + i * 8 + 0] = line.position.x;
            data[offset + i * 8 + 1] = line.position.y;
            data[offset + i * 8 + 2] = line.rotation;
            data[offset + i * 8 + 3] = line.length / 2;
            data[offset + i * 8 + 4] = line.chargeDensity;
            data[offset + i * 8 + 5] = 0;
            data[offset + i * 8 + 6] = 0;
            data[offset + i * 8 + 7] = 0;
        });
        offset += lines.length * 8;

        //Planes
        planes.forEach((plane, i) => {
            data[offset + i * 4 + 0] = plane.position.x;
            data[offset + i * 4 + 1] = plane.position.y;
            data[offset + i * 4 + 2] = plane.rotation;
            data[offset + i * 4 + 3] = plane.chargeDensity / 1000;
        });
        offset += planes.length * 4;

        //Triangles
        tris.forEach((tri, i) => {
            data[offset + i * 8 + 0] = tri.position.x;
            data[offset + i * 8 + 1] = tri.position.y;
            data[offset + i * 8 + 2] = tri.rotation;
            data[offset + i * 8 + 3] = tri.halfWidth;
            data[offset + i * 8 + 4] = tri.tip.x;
            data[offset + i * 8 + 5] = tri.tip.y;
            data[offset + i * 8 + 6] = tri.chargeDensity;
            data[offset + i * 8 + 7] = 0;
        });
        offset += tris.length * 8;

        //Conductors
        conductors.forEach((conductor, i) => {
            data[offset + 0] = conductor.charges.length / conductor.zPoints;
            data[offset + 1] = conductor.zPoints;
            offset += 4;
            for (let j = 0; j < conductor.charges.length; j += conductor.zPoints) {
                data[offset + 0] = conductor.worldSpacePoints[j].x;
                data[offset + 1] = conductor.worldSpacePoints[j].y;
                offset += 2;
                for (let i = 0; i < conductor.zPoints; i++) {
                    data[offset + i * 2 + 0] = conductor.worldSpacePoints[j + i].z;
                    data[offset + i * 2 + 1] = conductor.charges[j + i];
                }
                offset += 2;
                offset += Math.ceil((conductor.zPoints - 1) / 2) * 4;
            }
        });
        if (data.length > 0) {
            this.gl.uniform4fv(this.uniLoc.data, data);
        }
    }
    static vertexShader = `#version 300 es
        precision highp float;
        in vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;

    static makeEquipotentialShader = (doEquipotential: boolean) => {
        return `#version 300 es
        precision highp float;

        uniform vec2 screen_size;

        uniform vec4 neutral_color;
        uniform vec4 positive_color;
        uniform vec4 negative_color;
        uniform vec4 equipotential_color;

        uniform sampler2D volts;

        out vec4 fragColor;

        void main() {
            float volt = texture(volts, vec2(gl_FragCoord.x/screen_size.x,gl_FragCoord.y/screen_size.y)).r;
            float colVolt = 2.0/(1.0+exp(-volt*2.0))-1.0;
            fragColor = mix(mix(negative_color,neutral_color,1.0+colVolt), mix(neutral_color, positive_color, colVolt), step(0.0,colVolt));
            ${doEquipotential ? `
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
            `: ``}
            }`;
    }
    static makeVoltageShader = (uniforms: number) => {

        return `#version 300 es
        precision highp float;

        uniform vec2 canvas;
        uniform vec2 scene;

        uniform int point_count;
        uniform int line_count;
        uniform int plane_count;
        uniform int tri_count;
        uniform int conductor_count;
        uniform vec4 data[${uniforms - 25}];

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

        out float fragColor;
        void main() {
            vec2 p = vec2((gl_FragCoord.x/canvas.x-0.5) * scene.x , -(gl_FragCoord.y/canvas.y-0.5) * scene.y);
            float volt = 0.0;
            int point_start = 0;
            int line_start = point_count;
            int plane_start = line_start + line_count*2;
            int tri_start = plane_start + plane_count;
            int cond_start = tri_start + tri_count*2;
            for(int i = point_start; i < line_start; i++) {
                vec2 pos = data[i].xy;
                float charge = data[i].z;

                float dist = distance(pos, p);
                volt += charge / dist;
            }
            for(int i = line_start; i < plane_start; i+=2) {
                vec2 center = data[i].xy;
                float rotation = data[i].z;
                float halfLen = data[i].w;
                float chargeDensity = data[i+1].x;

                vec2 dir = vec2(cos(rotation), sin(rotation));
                vec2 relPos = p - center;
                float g = dot(relPos,dir);
                vec2 end1 = center - dir * halfLen;
                vec2 end2 = center + dir * halfLen;
                halfLen = halfLen * sign(g);
                volt+=sign(g)*chargeDensity*log((distance(p,end1)+abs(g)+halfLen)/(distance(p,end2)+abs(g)-halfLen));
            }

            for(int i = plane_start; i < tri_start; i++) {
                vec2 center = data[i].xy;
                float rotation = data[i].z;
                float chargeDensity = data[i].w;

                vec2 dir = vec2(sin(rotation), -cos(rotation));
                vec2 relPos = p - center;
                float dist = abs(dot(relPos,dir));
                volt+=(100.0-6.28317*dist)*chargeDensity;
            }

            for(int i = tri_start; i < cond_start; i+=2) {
                vec2 center = data[i].xy;
                float rotation = data[i].z;
                float halfWidth = data[i].w;
                vec2 tip = data[i+1].xy;
                float chargeDensity = data[i+1].z;

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

            vec3 p3d = vec3(p.x,p.y,0.0);
            int offset = cond_start;
            for(int i=0; i < conductor_count; i++) {
                int point_count = int(data[offset].x);
                int loopCount = int(ceil((data[offset].y+0.9)/2.0));
                offset++;
                for(int j=0; j < point_count; j++) {
                    vec3 pos = data[offset].xyz;
                    float dist = distance(p3d,pos);
                    float v = data[offset].w/dist;
                    for(int k = 1; k < loopCount; k++) {
                        vec4 dataVec = data[offset+k];
                        v += dataVec.y/distance(p3d,vec3(pos.x,pos.y,dataVec.x));
                        v += dataVec.w/distance(p3d,vec3(pos.x,pos.y,dataVec.z));
                    }
                    offset += loopCount;
                    volt += v * 2.0;
                }
            }
            fragColor = volt;
        }`;
    }


    drawRectangle = (program: WebGLProgram) => {
        const positionAttributeLocation = this.gl.getAttribLocation(program, "a_position");
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    fullscreenRender = () => {
        //Draw pixel shader across whole screen
        this.gl.useProgram(this.voltProgram);
        this.gl.viewport(0, 0, window.innerWidth / voltUpscale, window.innerHeight / voltUpscale);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.drawRectangle(this.voltProgram);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.useProgram(this.equipProgram);
        this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.drawRectangle(this.equipProgram);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    }

}