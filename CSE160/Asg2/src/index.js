import { globals } from './global.js';
import { setHtmlUI } from './gui.js';
import { setupSimpleShader } from "./simpleShader.js";
import { setupButterfly } from "./butterflyTriangles.js";
import { BlockyAnimal } from "./BlockyAnimal.js";

function setupWebGL() {
  // Retrieve <canvas> element
  globals.canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  globals.gl = globals.canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!globals.gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function clearCanvas() {
  // Specify the color for clearing <canvas>
  globals.gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  globals.gl.clear(globals.gl.COLOR_BUFFER_BIT);
}

function main() {
  // get canvas and gl context
  setupWebGL();

  // compile shader programs, attach js variables to GLSL 
  setupSimpleShader();

  // set html inputs
  setHtmlUI();

  // set up butterfly triangles
  setupButterfly();

  // clear canvas
  clearCanvas();

  var blockyAnimal = new BlockyAnimal();
  blockyAnimal.render();

}

main();