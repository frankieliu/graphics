import { globals } from './global.js';

class Triangle {
  constructor() {
    this.xy = [0, 0];
    this.rgb = [0.0, 0.0, 0.0];
    this.size = 5.0;
    this.prog = globals.program[0];
  }
  render() {
    // console.log("Triangle: " + this.rgb);
    // Pass the color of a point to u_FragColor variable
    // gl.uniform4f(u_FragColor, 1.0, this.rgb[1]/255, this.rgb[2]/255, this.rgb[3]);
    globals.gl.uniform4f(this.prog.u_FragColor, this.rgb[0], this.rgb[1], this.rgb[2], 1.0);

    // Draw
    drawTriangle(
      [this.xy[0], this.xy[1],
      this.xy[0] + this.size / 200., this.xy[1],
      this.xy[0], this.xy[1] + this.size / 200.]);
  }
}

class DelaunayTriangle {
  constructor() {
    this.vertices = [];
    this.rgb = [];
    this.prog = globals.program[0];
  }
  render() {
    globals.gl.uniform4f(this.prog.u_FragColor, this.rgb[0], this.rgb[1], this.rgb[2], 1.0);

    drawTriangle(
      [this.vertices[0][0], this.vertices[0][1],
       this.vertices[1][0], this.vertices[1][1],
       this.vertices[2][0], this.vertices[2][1]]);
  }
}

function drawTriangle(vertices) {
  var prog = globals.program[0];

  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = globals.gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  globals.gl.bindBuffer(globals.gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  globals.gl.bufferData(globals.gl.ARRAY_BUFFER, new Float32Array(vertices), globals.gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  globals.gl.vertexAttribPointer(prog.a_Position, 2, globals.gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  globals.gl.enableVertexAttribArray(prog.a_Position);

  globals.gl.drawArrays(globals.gl.TRIANGLES, 0, n);
}

export { Triangle, DelaunayTriangle, drawTriangle };