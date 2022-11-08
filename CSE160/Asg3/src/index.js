import { globals } from './global.js';
import { setHtmlUI } from './gui.js';
import { setupSimpleShader } from "./simpleShader.js";
import { setupButterfly } from "./butterflyTriangles.js";
import { BlockyAnimal } from "./BlockyAnimal.js";
import { renderScene } from "./render.js";
import { setupStats, Animation, Animation2 } from "./animate.js";
import { Sphere } from './Sphere.js';

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
  globals.gl.enable(globals.gl.DEPTH_TEST);
}

function clearCanvas() {
  // Specify the color for clearing <canvas>
  globals.gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  globals.gl.clear(globals.gl.COLOR_BUFFER_BIT | globals.gl.DEPTH_BUFFER_BIT);
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

  setupStats();

  var blockyAnimal = new BlockyAnimal();
  globals.program[0].shapes.push(blockyAnimal);
  
  var sun = new Sphere();
  sun.matrix.scale(0.2,0.2,0.2).translate(-2,2,10);
  sun.rgb = [235, 209, 16].map(x => x/255.);
  globals.program[0].shapes.push(sun);

  globals.animate.animation.push(new Animation(blockyAnimal));
  globals.animate.animation.push(new Animation2(blockyAnimal));

  renderScene();

}

main();