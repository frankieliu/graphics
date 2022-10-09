import { globals } from "./global.js";
import { drawTriangle } from "./Triangle.js";

class Circle {
  constructor() {
    this.xy = [0, 0];
    this.rgb = [0.0, 0.0, 0.0];
    this.size = 15.0;
    this.numberOfSegments = 5;
  }
  render() {
    // Pass the color of a point to u_FragColor variable
    // gl.uniform4f(u_FragColor, 1.0, this.rgb[1]/255, this.rgb[2]/255, this.rgb[3]);
    globals.gl.uniform4f(globals.u_FragColor, this.rgb[0], this.rgb[1], this.rgb[2], 1.0);

    var d = this.size / 200.;
    var angleStep = 2.0 * Math.PI / this.numberOfSegments;
    for (var angle1 = 0; angle1 < 2.0 * Math.PI; angle1 += angleStep) {
      var angle2 = angle1 + angleStep;
      var vec1 = [d * Math.cos(angle1), d * Math.sin(angle1)];
      var vec2 = [d * Math.cos(angle2), d * Math.sin(angle2)];
      drawTriangle(
        [this.xy[0], this.xy[1],
        this.xy[0] + vec1[0], this.xy[1] + vec1[1],
        this.xy[0] + vec2[0], this.xy[1] + vec2[1]]);
    }
  }
}

export { Circle };