import { getWebGLContext, initShaders, createProgram } from "../lib/cuon-utils.js";
import { globals } from "./global.js";

function setupSimpleShader() {

  // Vertex shader program
  var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_PointSize;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_PointSize;
  }`;
  
  // Fragment shader program
  var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

  // Initialize shaders
  /*
  if (!initShaders(globals.gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  */

  // Initialize shaders
  var glsl = createProgram(globals.gl, VSHADER_SOURCE, FSHADER_SOURCE);
  globals.gl.useProgram(glsl);
  var prog = globals.program[0];
  prog.glsl = glsl;
  
  // Get the storage location of a_Position
  prog.a_Position = globals.gl.getAttribLocation(glsl, 'a_Position');
  if (prog.a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  prog.u_FragColor = globals.gl.getUniformLocation(glsl, 'u_FragColor');
  if (!prog.u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location for u_PointSize
  prog.u_PointSize = globals.gl.getUniformLocation(glsl, 'u_PointSize');
  if (!prog.u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return;
  }
}

export { setupSimpleShader };