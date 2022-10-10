import { butterfly } from "../img/butterfly.js";
import { DelaunayTriangle, drawTriangle } from "./Triangle.js";
import { globals } from "./global.js";

var prog = globals.program[0];

function setupButterfly() {
    var vertices = butterfly.vertices;
    var colors = butterfly.colors;
    var n = butterfly.vertices.length;
    var scale = 1./200.;
    var offset = 200.;

    var pointN = butterfly.points.map(pt => 
        [(pt[0]-offset) * scale,
         (pt[1]-offset) * scale * -1.0]);

    for(var i = 0; i < n; i++) {
        var tri = new DelaunayTriangle();
        tri.vertices = vertices[i].map(x => pointN[x]);
        tri.rgb = colors[i];
        prog.butterfly.push(tri);
    }
}

export { setupButterfly };