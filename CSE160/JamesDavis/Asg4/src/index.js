import { Matrix4, Vector3 } from '../lib/cuon-matrix.js';
import { Cube } from './Cube.js';
import {
    gl, canvas, u_ModelMatrix, u_GlobalRotateMatrix,
    u_ViewMatrix, u_ProjectionMatrix, u_Sampler0, u_Sampler1, g_map,
    addBlock, deleteBlock, findEmpty,
    u_lightPos, u_cameraPos, u_lightOn, u_Sampler2, u_Sampler3,
} from './globals.js';
import { Camera } from "./Camera.js";
import { Sphere } from './Sphere.js';

function setupWebGL() {
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function initVariablesToGLSL() {

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    // Set initial View and Projection
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);

}

function initTextures(src, n) {
    var image = new Image(); // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image.onload = function () { sendImageToTEXTURE(image, n); }
    // Tell the browser to load an image
    image.src = src;

    // Add more texture loading
    return true;
}

function sendImageToTEXTURE(image, n) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to crete the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    const activate = {
        0: () => gl.activeTexture(gl.TEXTURE0),
        1: () => gl.activeTexture(gl.TEXTURE1),
        2: () => gl.activeTexture(gl.TEXTURE2),
        3: () => gl.activeTexture(gl.TEXTURE3),
    }[n]?.();

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    const sampler = {
        0: () => gl.uniform1i(u_Sampler0,0),
        1: () => gl.uniform1i(u_Sampler1,1),
        2: () => gl.uniform1i(u_Sampler2,2),
        3: () => gl.uniform1i(u_Sampler3,3),
    }[n]?.();

    //gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

    console.log('finished sendImageToTEXTURE')
}


// Globals related UI elements
var g_globalAngle = 0;
var g_yellowAngle = 0;
var g_yellowAngle0 = 0;
var g_yellowAnimation = false;
var g_magentaAngle = 0;
var g_magentaAngle0 = 0;
var g_magentaAnimation = false;
var g_camera = new Camera();
var g_normalOn = false;
var g_lightPos = [-0.81, 0.21, 0.24];
var g_lightOn = true;

// For debugging
// window.camera = g_camera;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

    // Button Events
    document.getElementById('animationMagentaToggle').onclick = function () {
        g_magentaAnimation = !g_magentaAnimation;
        if (!g_magentaAnimation) {
            var slider = document.getElementById('magentaSlide');
            slider.value = g_magentaAngle;
        } else {
            // g_magentaAngle = 45*sin(3*g_seconds + g_magentaAngle0)
            g_magentaAngle0 = Math.asin(g_magentaAngle / 45.) - 3 * g_seconds;
        }
    }

    document.getElementById('animationYellowToggle').onclick = function () {
        g_yellowAnimation = !g_yellowAnimation;
        if (!g_yellowAnimation) {
            var slider = document.getElementById("yellowSlide");
            slider.value = g_yellowAngle;
        } else {
            // g_yellowAngle = 45*sin(g_seconds + g_yellowAngle0)
            g_yellowAngle0 = Math.asin(g_yellowAngle / 45.) - g_seconds;
        }
    };

    // Color Slider Events
    document.getElementById('yellowSlide').addEventListener('mousemove', function () { g_yellowAngle = this.value; renderAllShapes(); });
    document.getElementById('magentaSlide').addEventListener('mousemove', function () { g_magentaAngle = this.value; renderAllShapes(); });

    // Size Slider Events
    // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });

    document.onkeydown = keydown;
    canvas.onmousemove = mousemove;
    canvas.onmousedown = mousedown;
    canvas.onmouseup = mouseup;

    // Asg 4: Lighting
    document.getElementById('normalToggle').onclick = function () {
        g_normalOn = !g_normalOn;
        renderAllShapes();
    };

    const lightListener = function (elementId, index) {
        document.getElementById(elementId).addEventListener('mousemove', function (ev) {
            if (ev.buttons == 1) {
                g_lightPos[index] = this.value / 100;
                console.log(g_lightPos);
                renderAllShapes();
            }
        })
    };

    document.getElementById("lightX").value = g_lightPos[0] * 100;
    document.getElementById("lightY").value = g_lightPos[1] * 100;
    document.getElementById("lightZ").value = g_lightPos[2] * 100;
    lightListener("lightX", 0);
    lightListener("lightY", 1);
    lightListener("lightZ", 2);
    
    document.getElementById('lightOnToggle').onclick = function () {
        g_lightOn = !g_lightOn;
        renderAllShapes();
    };
}

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    initVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    // canvas.onmousedown = click;
    // canvas.onmousemove = click;
    // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev); }};
    initTextures('src/sky.jpg', 0);
    initTextures('src/wall.png', 1);
    initTextures('src/dots.png', 2);
    initTextures('src/uv_map_512x512.png', 3);

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);

    // Render
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.;
var g_seconds = performance.now() / 1000. - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
    // Print some debug information so we know we are running
    g_seconds = performance.now() / 1000.0 - g_startTime;
    // console.log(performance.now());

    // Update Animation Angles
    updateAnimationAngles();

    // Draw everything
    renderAllShapes();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_yellowAngle = (45 * Math.sin(g_seconds + g_yellowAngle0));
    }
    if (g_magentaAnimation) {
        g_magentaAngle = (45 * Math.sin(3 * g_seconds + g_magentaAngle0));
    }
    g_lightPos[0] = 2*Math.cos(g_seconds);
}

function keydown(ev) {
    const callback = {
        ArrowRight: () => g_camera.moveRight(),
        ArrowLeft: () => g_camera.moveLeft(),
        ArrowDown: () => g_camera.moveBackwards(),
        ArrowUp: () => g_camera.moveForward(),
        KeyA: () => g_camera.moveLeft(),
        KeyD: () => g_camera.moveRight(),
        KeyS: () => g_camera.moveBackwards(),
        KeyW: () => g_camera.moveForward(),
        KeyQ: () => g_camera.panLeft(),
        KeyE: () => g_camera.panRight(),
        KeyZ: () => g_camera.info(),
        Equal: () => addBlock(g_camera.at),
        Minus: () => deleteBlock(g_camera.at),
        KeyT: () => startGame(),
    }[ev.code]?.();
    // ?. optional chaining
    renderAllShapes();
}

var prevXPos = null;
function mousemove(ev) {
    if (isMouseDown) {
        var diff = (ev.clientX - prevXPos) / ev.target.clientWidth;
        g_camera.pan(90 * diff);
    } 
}
var isMouseDown = false;
function mousedown(ev) {
    if (!isMouseDown) {
        prevXPos = ev.clientX;
        isMouseDown = true;
    }
}
function mouseup(ev) {
    isMouseDown = false;
}

var countdown = null;
function startGame() {
    var [xi, yi] = findEmpty();
    console.log(xi, yi);
    var tmp = new Vector3(g_camera.at).sub(g_camera.eye);
    g_camera.eye = new Vector3([xi - 16, 0, yi - 16]);
    g_camera.at.set(g_camera.eye).add(tmp);
    countdown = 60 * 1000 + performance.now();
}

function drawMap() {
    const [xOff, yOff] = [16, 16];
    for (var x = 0; x < 32; x++) {
        for (var y = 0; y < 32; y++) {
            if (x == xOff && y == yOff) {
                // Don't hit the animal
                continue;
            }
            if (g_map[x][y] > 0) {
                for (var k = 0; k < g_map[x][y]; k++) {
                    var wall = new Cube();
                    wall.color = [1, 1, 1, 1];
                    // wall.textureNum = g_normalOn ? -3: 1;
                    wall.textureNum = 1;
                    wall.matrix.translate(x - 16.5, -.75 + k, y - 16.5);
                    wall.render();
                }
            }
        }
    }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Check the time at the start of this function
    var startTime = performance.now();

    // Pass the projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(g_camera.fov, canvas.width / canvas.clientHeight, 0.1, 1000);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
        g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
        g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]); // (eye, at, up)
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to u_ModelMatrix attribute
    var gloabalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, gloabalRotMat.elements);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the body cube    
    var body = new Cube();
    body.color = [1, 0, 0, 1];
    body.textureNum = g_normalOn ? -3 : -2;
    body.matrix.translate(-.25, -.75, 0);
    body.matrix.rotate(-5, 1, 0, 0)
    body.matrix.scale(.5, .3, .5);
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    body.render();

    // Draw a left arm
    var leftArm = new Cube();
    leftArm.color = [1, 1, 0, 1];
    leftArm.textureNum = g_normalOn ? -3 : -2;
    leftArm.matrix.setTranslate(0, -.5, 0);
    leftArm.matrix.rotate(-5, 1, 0, 0);
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
    var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(.25, .7, .5);
    leftArm.matrix.translate(-0.5, 0, 0);
    leftArm.normalMatrix.setInverseOf(leftArm.matrix).transpose();
    leftArm.render();

    // Magenta box
    var box = new Cube();
    box.color = [1, 0, 1, 1];
    box.textureNum = g_normalOn ? -3 : 0;
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0, 0.65, 0);
    box.matrix.rotate(g_magentaAngle, 0, 0, 1);
    box.matrix.scale(.3, .3, .3);
    box.matrix.translate(-.5, 0, 1);
    box.normalMatrix.setInverseOf(box.matrix).transpose();
    box.render();

    // Sphere
    var sphere = new Sphere();
    sphere.color = [1, 0, 1, 1];
    sphere.textureNum = g_normalOn ? -3 : 3;
    sphere.matrix = box.matrix;
    sphere.matrix.translate(0, 0.5, 0);
    // sphere.matrix.scale(0.3,0.3,0.3);
    sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
    sphere.render();

    // Ground plane
    var ground = new Cube();
    ground.color = [0.5, 0.5, 0.5, 1];
    ground.textureNum = 0;
    ground.matrix.translate(0, -.75, 0);
    ground.matrix.scale(33, 0, 33);
    ground.matrix.translate(-.5, 0, -.5);
    ground.render();

    // Draw the sky
    var sky = new Cube();
    sky.color = [0, 0, 1, 1];
    sky.textureNum = g_normalOn ? -3 : 0;
    sky.matrix.scale(-50, -50, -50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

    drawMap();

    // Asg 4 Add light
    const light = new Cube();
    light.color = [2, 2, 0, 1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1, -.1, -.1);
    light.matrix.translate(-.5, -.5, -.5);
    light.render();

    // pass Light position to GLSL
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    // pass Camera position to GLSL
    gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);

    // turn specular on
    gl.uniform1i(u_lightOn, g_lightOn);

    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
    if (countdown !== null) {
        let timeleft = Math.floor((countdown - performance.now()) / 1000);
        if (timeleft <= 0) {
            alert("Time is up, game over");
            countdown = null;
        } else {
            if (Math.floor(g_camera.at.elements[0]) == 0 &&
                Math.floor(g_camera.at.elements[2]) == 0) {
                alert("Congratulations!");
                countdown = null;
            } else {
                sendTextToHTML(" Time left (s): " + timeleft, 'numdot');
            }
        }
    } else {
        sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration), 'numdot');
    }
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

document.body.onload = function () { main(); }