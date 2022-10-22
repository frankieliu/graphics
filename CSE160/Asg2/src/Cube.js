import { globals } from "./global.js";
import { draw3DTriangle } from "./Triangle.js";
import { Matrix4 } from "../lib/cuon-matrix-cse160.js";

class Cube {
  constructor() {
    this.xy = [0, 0];
    this.rgb = [0.0, 0.0, 0.0];
    this.prog = globals.program[0];
    this.matrix = new Matrix4();
  }

  render() {

    // Pass the color of a point to u_FragColor variable
    globals.gl.uniform4f(this.prog.u_FragColor, this.rgb[0], this.rgb[1], this.rgb[2], 1.0);

    // Pass the matrix
    globals.gl.uniformMatrix4fv(this.prog.u_ModelMatrix, false, this.matrix.elements);

    // Sharing 0,0,0 
    draw3DTriangle([0, 0, 0, 0, 0, 1, 0, 1, 1]);
    draw3DTriangle([0, 0, 0, 0, 1, 0, 0, 1, 1]);

    draw3DTriangle([0, 0, 0, 0, 0, 1, 1, 0, 1]);
    draw3DTriangle([0, 0, 0, 1, 0, 1, 1, 0, 1]);

    draw3DTriangle([0, 0, 0, 0, 1, 0, 1, 1, 0]);
    draw3DTriangle([0, 0, 0, 1, 0, 0, 1, 1, 0]);

    // Sharing 1,1,1  
    draw3DTriangle([1, 1, 1, 1, 1, 0, 1, 0, 0]);
    draw3DTriangle([1, 1, 1, 1, 0, 1, 1, 0, 0]);

    draw3DTriangle([1, 1, 1, 1, 1, 0, 0, 1, 0]);
    draw3DTriangle([1, 1, 1, 0, 1, 1, 0, 1, 0]);

    draw3DTriangle([1, 1, 1, 1, 0, 1, 0, 0, 1]);
    draw3DTriangle([1, 1, 1, 0, 1, 1, 0, 0, 1]);

  }
}

export { Cube };