import { globals } from "./global.js";

class Point {
  constructor() {
    this.xy = [0, 0];
    this.rgb = [0.0, 0.0, 0.0];
    this.size = 5.0;
  }
  render() {

    // Quit using the buffer to send the attribute
    globals.gl.disableVertexAttribArray(globals.a_Position);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([xy[0], xy[1]]), gl.DYNAMIC_DRAW);

    // Pass the position of a point to a_Position variable
    globals.gl.vertexAttrib3f(globals.a_Position, this.xy[0], this.xy[1], 0.0);

    // Pass the color of a point to u_FragColor variable
    // gl.uniform4f(u_FragColor, 1.0, this.rgb[1]/255, this.rgb[2]/255, this.rgb[3]);
    globals.gl.uniform4f(globals.u_FragColor, this.rgb[0], this.rgb[1], this.rgb[2], 1.0);

    globals.gl.uniform1f(globals.u_PointSize, this.size);

    // Draw
    globals.gl.drawArrays(globals.gl.POINTS, 0, 1);

  }
}

export { Point };