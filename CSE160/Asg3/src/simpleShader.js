import { getWebGLContext, initShaders, createProgram } from "../lib/cuon-utils.js";
import { globals } from "./global.js";

function setupSimpleShader() {

  // Vertex shader program
  var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  uniform float u_PointSize;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  // Texture 
  attribute vec2 a_UV;
  varying vec2 v_UV;
  // View and Projection
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix *
                  u_ViewMatrix *
                  u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = u_PointSize;
    v_UV = a_UV;
  }`;
  
  // Fragment shader program
  var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  // Texture
  varying vec2 v_UV;
  void main() {
    gl_FragColor = u_FragColor;
    // gl_FragColor = vec4(v_UV, 1.0, 1.0);
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

  prog.u_ModelMatrix = globals.gl.getUniformLocation(glsl, 'u_ModelMatrix');
  if (!prog.u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  
  prog.u_GlobalRotateMatrix = globals.gl.getUniformLocation(glsl,
    'u_GlobalRotateMatrix');
  if (!prog.u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  prog.a_UV = globals.gl.getAttribLocation(glsl, 'a_UV');
  if (!prog.a_UV) {
    console.log('Failed to get storage location for a_UV');
  }
  
  prog.u_ViewMatrix = globals.gl.getUniformLocation(glsl, 'u_ViewMatrix');
  if (!prog.u_ViewMatrix) {
    console.log('Failed to get storage location for u_ViewMatrix');
  }
  
  prog.u_ProjectionMatrix = globals.gl.getUniformLocation(glsl, 'u_ProjectionMatrix');
  if (!prog.u_ProjectionMatrix) {
    console.log('Failed to get storage location for u_ProjectionMatrix');
  }
}

export { setupSimpleShader };