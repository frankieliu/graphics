import { globals } from "./global.js";

function renderScene() {
  // Clear <canvas>
  globals.gl.clear(globals.gl.COLOR_BUFFER_BIT | globals.gl.DEPTH_BUFFER_BIT);

  var len = globals.program[0].shapes.length;
  for (var i = 0; i < len; i++) {
    globals.program[0].shapes[i].render();
  }
}

export { renderScene };