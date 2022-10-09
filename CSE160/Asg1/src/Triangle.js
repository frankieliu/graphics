import { globals } from './global.js';

class Triangle {
  constructor() {
    this.xy = [0, 0];
    this.rgb = [0.0, 0.0, 0.0];
    this.size = 5.0;
  }
  render() {
    // console.log("Triangle: " + this.rgb);
    // Pass the color of a point to u_FragColor variable
    // gl.uniform4f(u_FragColor, 1.0, this.rgb[1]/255, this.rgb[2]/255, this.rgb[3]);
    globals.gl.uniform4f(globals.u_FragColor, this.rgb[0], this.rgb[1], this.rgb[2], 1.0);

    // Draw
    drawTriangle(
      [this.xy[0], this.xy[1],
      this.xy[0] + this.size / 200., this.xy[1],
      this.xy[0], this.xy[1] + this.size / 200.]);
  }
}

function drawTriangle(vertices) {
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = globals.gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  globals.gl.bindBuffer(globals.gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  globals.gl.bufferData(globals.gl.ARRAY_BUFFER, new Float32Array(vertices), globals.gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  globals.gl.vertexAttribPointer(globals.a_Position, 2, globals.gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  globals.gl.enableVertexAttribArray(globals.a_Position);

  globals.gl.drawArrays(globals.gl.TRIANGLES, 0, n);
}

export { Triangle, drawTriangle };