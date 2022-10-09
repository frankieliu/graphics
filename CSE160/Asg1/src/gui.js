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
  aShape.rgb = globals.selectedColor.map(n => n/255);
  aShape.size = globals.selectedSize;

  globals.shapes.push(aShape);

  RenderAllShapes();
}

function readColor() {
  var ids = ["red", "green", "blue"];
  for (var i = 0; i < 3; i++) {
    globals.selectedColor[i] = parseInt(document.getElementById(ids[i]).value);
  }
  var color = "rgb(" + globals.selectedColor.map(n => String(n)).join(",") + ")";
  document.getElementById("rgb").style.backgroundColor = color;
}

function setHtmlUI() {

  // Register function (event handler) to be called on a mouse press
  globals.canvas.onmousedown = click;
  globals.canvas.onmousemove = click;
  
  // Register events for color
  document.getElementById("red").oninput = function () { readColor(); }
  document.getElementById("green").oninput = function () { readColor(); }
  document.getElementById("blue").oninput = function () { readColor(); }

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

export { setHtmlUI };