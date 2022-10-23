import { globals } from './global.js';

import { Matrix4 } from '../lib/cuon-matrix-cse160.js';
import { renderScene } from "./render.js";
import { tick } from "./animate.js";

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - globals.canvas.width / 2) / (globals.canvas.width / 2);
  y = (globals.canvas.height / 2 - (y - rect.top)) / (globals.canvas.height / 2);

  return [x, y];
}

function setAngleSlider(elementId, labelString, boneIndex) {
  document.getElementById(elementId).oninput = function () {
    var angle = this.value;
    // console.log(this.labels[0].innerHtml)
    this.labels[0].innerHTML = labelString + ": " + angle + " deg";
    var blockyAnimal = globals.program[0].shapes[0];
    blockyAnimal.setJointAngle(boneIndex, angle);
    renderScene();
  }
}

function setAngleSliders() {
  setAngleSlider("left-hip-rotation", "Left Hip rotation", 0);
  setAngleSlider("left-hip-angle", "Left Hip angle", 1);
  setAngleSlider("left-knee-angle", "Left Knee angle", 2);
  setAngleSlider("left-ankle-angle", "Left Ankle angle", 3);
  setAngleSlider("right-hip-rotation", "Right Hip rotation", 4);
  setAngleSlider("right-hip-angle", "Right Hip angle", 5);
  setAngleSlider("right-knee-angle", "Rigth Knee angle", 6);
  setAngleSlider("right-ankle-angle", "Right Ankle angle", 7);
}

function setupAnimate() {
  var elementId = "animate";
  document.getElementById(elementId).onclick = function () {
    globals.select.animate = !globals.select.animate;
    // console.log(this.labels[0].innerHtml)
    this.labels[0].innerHTML = globals.select.animate ? "On" : "Off";
    // var blockyAnimal = globals.program[0].shapes[0];
    // blockyAnimal.setJointAngle(boneIndex, angle);
    // renderScene();
    if (globals.select.animate) {
      globals.animate.startTime = performance.now();
      tick();
    }
  }
}

var camera = {
  buttonDown: false,
  x: null,
  y: null,
  client: null,
};

function setCameraControl() {
  if (!camera.client) {
    camera.client = document.getElementById('webgl');
  }
  camera.client.onmousemove = function (e) {
    if (e.buttons & 1 || (e.buttons === undefined && e.which == 1)) {
      if (!camera.buttonDown) {
        camera.x = e.clientX;
        camera.y = e.clientY;
      } else {
        var dx = (e.clientX - camera.x) * 1.0 / camera.client.width;
        var dy = (e.clientY - camera.y) * 1.0 / camera.client.height;
        // Register changing global rotation
        globals.select.globalRotation += dx * 36;
        setGlobalRotateMatrix();
        renderScene();
      }
      camera.buttonDown = true;
    } else {
      camera.buttonDown = false;
    }
  }
}

var poke = {
  count: 0,  // state count
  max: 2,    // max number of states
  client: null,
};

function setPokeAnimation() {
  if (!poke.client) {
    poke.client = document.getElementById('webgl');
  }
  poke.client.onclick = function (e) {
    if (e.shiftKey) {
      poke.count = (poke.count + 1) % poke.max;
      globals.animate.index = poke.count;
    }
  }
}
function setGlobalRotateMatrix() {
  const rotMatrix = new Matrix4().rotate(
    globals.select.globalRotation, 0, 1, 0)
    .scale(0.7*globals.select.size/10.,
      0.7*globals.select.size/10.,
      0.7*globals.select.size/10.);

  // Load rotation Matrix to u_GlobalRotateMatrix
  globals.gl.uniformMatrix4fv(globals.program[0].u_GlobalRotateMatrix,
    false, rotMatrix.elements);
}

function setHtmlUI() {

  // Register event for size changes 
  document.getElementById("size").oninput = function () {
    globals.select.size = parseInt(this.value);
    setGlobalRotateMatrix();
    renderScene();
  };

  // Register changing top layer opacity
  document.getElementById("opacity").oninput = function () {
    document.getElementById("webgl").style.opacity = parseInt(this.value) / 100;
  }

  // Register changing global rotation
  document.getElementById("globalRotation").oninput = function () {
    globals.select.globalRotation = parseInt(this.value);
    setGlobalRotateMatrix();
    renderScene();
  }
  setGlobalRotateMatrix();
  setAngleSliders();
  setupAnimate();
  setCameraControl();
  setPokeAnimation();
}

export { setHtmlUI };