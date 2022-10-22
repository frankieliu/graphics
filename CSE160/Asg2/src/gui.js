import { globals, POINT, TRIANGLE, CIRCLE } from './global.js';

import { Point } from './Point.js';
import { Triangle } from './Triangle.js';
import { Circle } from "./Circle.js";

import { RenderAllShapes } from "./render.js";

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
  switch (globals.select.shape) {
    case POINT:
      aShape = new Point();
      break;
    case TRIANGLE:
      aShape = new Triangle();
      break;
    case CIRCLE:
      aShape = new Circle();
      aShape.numberOfSegments = globals.select.numberOfSegments;
      break;
    default:
      return;
  }

  aShape.xy = [x, y];
  aShape.rgb = globals.select.color.map(n => n/255);
  aShape.size = globals.select.size;

  globals.program[0].shapes.push(aShape);

  RenderAllShapes();
}

function readColor() {
  var ids = ["red", "green", "blue"];
  for (var i = 0; i < 3; i++) {
    globals.select.color[i] = parseInt(document.getElementById(ids[i]).value);
  }
  var color = "rgb(" + globals.select.color.map(n => String(n)).join(",") + ")";
  document.getElementById("rgb").style.backgroundColor = color;
}

function setHtmlUI() {

  // Register function (event handler) to be called on a mouse press
  globals.canvas.onmousedown = click;
  globals.canvas.onmousemove = function (ev) {
     if (ev.buttons == 1) {
      click(ev);
     }
  };
  
  // Register events for color
  document.getElementById("red").oninput = function () { readColor(); }
  document.getElementById("green").oninput = function () { readColor(); }
  document.getElementById("blue").oninput = function () { readColor(); }

  document.getElementById("red").value = globals.select.color[0];
  document.getElementById("green").value = globals.select.color[1];
  document.getElementById("blue").value = globals.select.color[2];

  readColor();

  // Register event for size changes 
  document.getElementById("size").onmouseup = function () {
    globals.select.size = parseInt(this.value);
  };

  // Register event for clearing canvas 
  document.getElementById("clear").onmouseup = function () {
    globals.program[0].shapes = [];
    RenderAllShapes();
  }

  // Register brush shape
  document.getElementById("point").onmouseup = function () { globals.select.shape = POINT; }
  document.getElementById("triangle").onmouseup = function () { globals.select.shape = TRIANGLE; }
  document.getElementById("circle").onmouseup = function () { globals.select.shape = CIRCLE; }

  // Register number of segments
  document.getElementById("numberOfSegments").onmouseup = function () {
    globals.select.numberOfSegments = parseInt(this.value);
  }

  // Register changing top layer opacity
  document.getElementById("opacity").oninput = function () {
    document.getElementById("webgl").style.opacity = parseInt(this.value)/100;
  }

  // Register changing global rotation
  document.getElementById("globalRotation").oninput = function () {
    globals.select.globalRotation = parseInt(this.value);
    RenderAllShapes();
  }

  // Register continuous drawing or single clicks
  var cont = document.getElementById("continuous");
  cont.onclick = function () {
    if (cont.checked) {
      globals.canvas.onmousemove = click;
    } else {
      globals.canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) {
          click(ev);
        }
      }
    }
  };

  /*
  var imageSource = document.getElementById("imageSource");
  imageSource.onerror = function() {
    console.log(imageSource.src + ": image not found");
    imageSource.src = "img/blue-morpho-butterfly-1-400x400.jpg.webp";
  }
  */

  document.getElementById("imageInput").onchange = function () {
    document.getElementById("imageSource").src = this.value;
  } 

  document.getElementById("butterfly").onclick = function () {
    globals.program[0].shapes = globals.program[0].butterfly.slice()
    RenderAllShapes();
  }
}

export { setHtmlUI };