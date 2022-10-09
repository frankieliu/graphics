import { globals } from "./global.js";

function RenderAllShapes() {
  // Clear <canvas>
  globals.gl.clear(globals.gl.COLOR_BUFFER_BIT);

  var len = globals.shapes.length;
  for (var i = 0; i < len; i++) {
    globals.shapes[i].render();
  }
}

export { RenderAllShapes };