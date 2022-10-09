import { getWebGLContext, initShaders, createProgram } from "../lib/cuon-utils.js";
// import { set_g_tmp, g_tmp_array, touch_g_tmp } from './sample.js';
import { POINT, TRIANGLE, CIRCLE, globals } from './global.js';
import { Point } from './Point.js';
import { Triangle } from './Triangle.js';
import { Circle } from "./Circle.js";

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

function connectVariablesToGSL() {

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

function RenderAllShapes() {
  // Clear <canvas>
  globals.gl.clear(globals.gl.COLOR_BUFFER_BIT);

  var len = globals.shapes.length;
  for (var i = 0; i < len; i++) {
    globals.shapes[i].render();
  }
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - globals.canvas.width / 2) / (globals.canvas.width / 2);
  y = (globals.canvas.height / 2 - (y - rect.top)) / (globals.canvas.height / 2);

  return [x, y];
}

function click(ev) {
  var [x, y] = convertCoordinatesEventToGL(ev);

  // Store the coordinates to g_points array
  var aShape;
  switch (globals.selectedShape) {
    case POINT:
      aShape = new Point();
      break;
    case TRIANGLE:
      aShape = new Triangle();
      break;
    case CIRCLE:
      aShape = new Circle();
      aShape.numberOfSegments = globals.selectedNumberOfSegments;
      break;
    default:
      return;
  }
  aShape.xy = [x, y];
  aShape.rgb = globals.selectedColor.slice();
  aShape.size = globals.selectedSize;

  globals.shapes.push(aShape);

  RenderAllShapes();
}

function readColor() {
  var ids = ["red", "green", "blue"];
  for (var i = 0; i < 3; i++) {
    globals.selectedColor[i] = parseInt(document.getElementById(ids[i]).value);
  }
}

function setHtmlUI() {

  // Register function (event handler) to be called on a mouse press
  globals.canvas.onmousedown = click;
  globals.canvas.onmousemove = click;
  
  // Register events for color
  document.getElementById("red").onmouseup = function () { readColor(); }
  document.getElementById("green").onmouseup = function () { readColor(); }
  document.getElementById("blue").onmouseup = function () { readColor(); }

  // Register event for size changes 
  document.getElementById("size").onmouseup = function () {
    globals.selectedSize = parseInt(this.value);
  };

  // Register event for clearing canvas 
  document.getElementById("clear").onmouseup = function () {
    globals.shapes = [];
    RenderAllShapes();
  }

  // Register brush shape
  document.getElementById("point").onmouseup = function () { globals.selectedShape = POINT; }
  document.getElementById("triangle").onmouseup = function () { globals.selectedShape = TRIANGLE; }
  document.getElementById("circle").onmouseup = function () { globals.selectedShape = CIRCLE; }

  // Register number of segments
  document.getElementById("numberOfSegments").onmouseup = function () {
    globals.selectedNumberOfSegments = parseInt(this.value);
  }
}

function main() {
  // get canvas and gl context
  setupWebGL();

  // compile shader programs, attach js variables to GLSL 
  connectVariablesToGSL();

  // set html inputs
  setHtmlUI();

  // Specify the color for clearing <canvas>
  globals.gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  globals.gl.clear(globals.gl.COLOR_BUFFER_BIT);

}

main();