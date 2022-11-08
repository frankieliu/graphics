import { Matrix4 } from '../lib/cuon-matrix.js';
import { Cube } from './Cube.js';
import { gl, a_Position, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix } from './globals.js';

// Vertex shader program
// var VSHADER_SOURCE = `
// attribute vec4 a_Position;
// uniform mat4 u_ModelMatrix;
// uniform mat4 u_GlobalRotateMatrix;
// void main() {
//     gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
// } `

// Fragment shader program
// var FSHADER_SOURCE = `
// precision mediump float;
// uniform vec4 u_FragColor;
// void main() {
//    gl_FragColor = u_FragColor;
// }`

// Global variables
// let canvas;
// let gl;
// let a_Position;
// let u_FragColor;
// let u_Size;
// let u_ModelMatrix;
// let u_GlobalRotateMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    // canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    // gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    // if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    //    console.log('Failed to initialize shaders.');
    //     return;
    // }

    // Get the storage location of a Position
    // a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    // u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location u_FragColor');
        return;
    }
    
    // Get the storage location of u_ModelMatrix
    // u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    // u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location u_GlobalRotateMatrix');
        return;
    }

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
// let g_selectedColor = [1.0,1.0,1.0,1.0];
// let g_selectedSize = 5;
// let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_yellowAngle0 = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

    // Button Events
    document.getElementById('animationYellowOffButton').onclick = function() {
        g_yellowAnimation = false;
        var slider = document.getElementById('yellowSlide');
        slider.value = g_yellowAngle;
    }
    
    document.getElementById('animationYellowOnButton').onclick = function() {
        g_yellowAngle0 = Math.asin(g_yellowAngle/45.);
        g_startTime = performance.now()/1000.;
        g_yellowAnimation = true; 
    };

    // Color Slider Events
    document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});
    document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();});

    // Size Slider Events
    // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

}




function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    // canvas.onmousedown = click;
    // canvas.onmousemove = click;
    // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev); }};

    // Specify the color for clearing <canvas>
    gl.clearColor(0,0,0,1);

    // Render
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.;
var g_seconds = performance.now()/1000. - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
    // Print some debug information so we know we are running
    g_seconds = performance.now()/1000.0 - g_startTime; 
    // console.log(performance.now());

    // Update Animation Angles
    updateAnimationAngles();

    // Draw everythin
    renderAllShapes();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}


function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_yellowAngle = (45 * Math.sin(g_seconds+g_yellowAngle0));
    }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Chek the time at the start of this function
    var startTime = performance.now();
    
    // pass the matrix to u_ModelMatrix attribute
    var gloabalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, gloabalRotMat.elements);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the body cube    
    var body = new Cube();
    body.color = [1,0,0,1];
    body.matrix.translate(-.25,-.75,0);
    body.matrix.rotate(-5,1,0,0)
    body.matrix.scale(.5,.3,.5);
    body.render();

    // Draw a left arm
    var leftArm = new Cube();
    leftArm.color = [1,1,0,1];
    leftArm.matrix.setTranslate(0,-.5,0);
    leftArm.matrix.rotate(-5,1,0,0);
    leftArm.matrix.rotate(-g_yellowAngle, 0,0,1);
    var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(.25,.7,.5);
    leftArm.matrix.translate(-0.5,0,0);
    leftArm.render();

    // Test box
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0,0.65,0);
    box.matrix.rotate(g_magentaAngle,0,0,1);
    box.matrix.scale(.3,.3,.3);
    box.matrix.translate(-.5,0,-0.001);
    // box.matrix.translate(-.1,.1,.0,0);
    // box.matrix.rotate(-30,1,0,0);
    // box.matrix.scale(.2,.4,.2);
    box.render();

    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'numdot')
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
}

document.body.onload = function() { main(); }