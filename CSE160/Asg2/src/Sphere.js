import { globals } from "./global.js";
import { Matrix4 } from "../lib/cuon-matrix-cse160.js";
import { SpherePositions, SphereTriIndices } from "./WireCube.js";

class Sphere {

  constructor() {
    this.rgb = [0.0, 0.0, 0.0];
    this.prog = globals.program[0];
    this.matrix = new Matrix4();
    this.vertices = null;
    this.vertexBuffer = null;
  }

  createBuffer() {
    if (!this.vertexBuffer) {
      this.vertexBuffer = globals.gl.createBuffer();
      if(!this.vertexBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
      }
    }
  }

  createVertices() {
    if (!this.vertices) {
      var v = [];
      for(var i = 0; i < SphereTriIndices.length; i++) {
        for(var j = 0; j < 3; j++) {
          v.push(SpherePositions[SphereTriIndices[i]*3 + j]);
        }
      }
      this.vertices = new Float32Array(v);
    }
  }

  drawSphere(matrix) {
    this.matrix = matrix;
    this.render();
  }

  render() {
    // Pass the color of a point to u_FragColor variable
    globals.gl.uniform4f(this.prog.u_FragColor, this.rgb[0], this.rgb[1], this.rgb[2], 1.0);

    // Pass the matrix
    globals.gl.uniformMatrix4fv(this.prog.u_ModelMatrix, false, this.matrix.elements);

    this.draw3DTriangles();
  }

  draw3DTriangles() {
    var prog = this.prog;
    this.createBuffer();
    this.createVertices();

    // Bind the buffer object to target
    globals.gl.bindBuffer(globals.gl.ARRAY_BUFFER, this.vertexBuffer);
    
    // Write data into the buffer object
    globals.gl.bufferData(globals.gl.ARRAY_BUFFER, this.vertices, globals.gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    globals.gl.vertexAttribPointer(prog.a_Position, 3, globals.gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    globals.gl.enableVertexAttribArray(prog.a_Position);

    globals.gl.drawArrays(globals.gl.TRIANGLES, 0, SphereTriIndices.length);
  }

}

export { Sphere };