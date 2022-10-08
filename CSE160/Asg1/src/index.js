/**
 * With codesandbox we import our functions from the files they live in
 * rather than import that file in the HTML file like we usually do
 *
 * ALSO NOTE that there is NO main function being called.
 * index.js IS your main function and the code written in it is run
 * on page load.
 */
// import "./styles.css";
import { initShaders } from "../lib/cuon-utils.js";
import { Matrix4, Vector3 } from "../lib/cuon-matrix-cse160.js";

// HelloCube.js (c) 2012 matsuda
// Vertex shader program
// Vertex shader program
const VSHADER_SOURCE = `
   attribute vec2 aPosition;
   uniform mat4 uModelMatrix; 
   void main() {
     gl_Position = uModelMatrix * vec4(aPosition, 0.0, 1.0);
   }
   `;

// Fragment shader program
const FSHADER_SOURCE = `
   #ifdef GL_ES
   precision mediump float;
   #endif
   void main() {
     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
   }
   `;

// Retrieve <canvas> element
var canvas = document.getElementById("webgl");

// Get the rendering context for WebGL
var gl = canvas.getContext("webgl");
if (!gl) {
  console.log("Failed to get the rendering context for WebGL");
}

// Initialize shaders
if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  console.log("Failed to intialize shaders.");
}

// Set clear color
gl.clearColor(0.5, 0.5, 0.5, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);

const v1 = { x: -0.5, y: -0.5 };
const v2 = { x:  0.5, y: -0.5 };
const v3 = { x: -0.5, y:  0.5 };
const vertices = new Float32Array([v1.x, v1.y, v2.x, v2.y, v3.x, v3.y]);

const vertexBuffer = gl.createBuffer();
if (!vertexBuffer) {
  console.log("Failed to create the buffer object");
}

// Bind the buffer gl and write vertex data into buffer
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Get position attribute variable
// Defined above in VSHADER_SOURCE
const aPosPtr = gl.getAttribLocation(gl.program, "aPosition");
if (aPosPtr < 0) {
  console.error("Could not find aPosition ptr");
}

// Set the attribute and enable it
gl.vertexAttribPointer(aPosPtr, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosPtr);

// Create a matrix
const M = new Matrix4();

function drawSpaceship(gl, matrix) {
  // get transformation matrix
  const uModelMatrixPtr = gl.getUniformLocation(gl.program, "uModelMatrix");
  const M1 = new Matrix4();
  M1.set(matrix);
  M1.translate(0, 0, 0);
  M1.rotate(45, 0, 0, 1);
  M1.scale(1, 1, 1);
  gl.uniformMatrix4fv(uModelMatrixPtr, false, M1.elements);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

}

drawSpaceship(gl, M);