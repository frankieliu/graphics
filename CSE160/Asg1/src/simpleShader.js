import { getWebGLContext, initShaders, createProgram } from "../lib/cuon-utils.js";
import { globals } from "global.js";

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

  var VSHADER2 = `
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
    // pass the texCoord to fshader
    v_texCoord = a_texCoord;
  `;
  
  var FSHADER2 = `
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  `

  // Initialize shaders
  if (!initShaders(globals.gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  globals.a_Position = globals.gl.getAttribLocation(globals.gl.program, 'a_Position');
  if (globals.a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  globals.u_FragColor = globals.gl.getUniformLocation(globals.gl.program, 'u_FragColor');
  if (!globals.u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location for u_PointSize
  globals.u_PointSize = globals.gl.getUniformLocation(globals.gl.program, 'u_PointSize');
  if (!globals.u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return;
  }
}

export { setupSimpleShader };