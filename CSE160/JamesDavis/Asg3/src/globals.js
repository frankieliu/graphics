import { initShaders } from '../lib/cuon-utils.js';

const canvas = document.getElementById("webgl");
var gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
var a_Position;
var u_FragColor;
var u_ModelMatrix;
var u_GlobalRotateMatrix;

var a_UV;
var u_ProjectionMatrix;
var u_ViewMatrix;
var u_Sampler0;
var u_Sampler1;
var u_whichTexture;

var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;

attribute vec2 a_UV;
varying vec2 v_UV;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;

void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
} `

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
varying vec2 v_UV;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
// uniform float u_TexColorWeight;
// TexColorWeight becomes inconvenient when you have multiple textures
// -- simpler to use whichTexture
uniform int u_whichTexture;
void main() {
    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;      // Use color
    } else if (u_whichTexture == -1) {   // Use UV debug color
        gl_FragColor = vec4(v_UV, 1, 1);
    } else if (u_whichTexture == 0) {    // Use texture0
        // gl_FragColor = u_FragColor * (1.0 - u_TexColorWeight) + u_TexColorWeight * texture2D(u_Sampler0, v_UV);
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {    // Use texture1
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {                             // Error: use redish color
        gl_FragColor = vec4(1,.2,.2,1);
    }
}`

var g_map = [];
function generateMap() {
    for(var x=0; x<32; x++) {
        var row = [];
        g_map.push(row)
        for(var y=0; y<32; y++) {
            if(Math.random() > .8) {
                row.push(Math.floor(Math.random() * (4 - 0 + 1)) + 0);
            } else {
                row.push(0);
            }
        }
    }
    // Set the walls
    for(var x=0; x<32; x++) {
        g_map[x][0] = 1;
        g_map[x][31] = 1;
    }
    for(var y=0; y<32; y++) {
        g_map[0][y] = 1;
        g_map[31][y] = 1;
    }
}
generateMap();

function coordinates(x,y) {
    return [Math.floor(x+16.5), Math.floor(y+16.5)];
}

function checkCollision(x,y) {
    var [xi,yi] = coordinates(x,y);
    if (g_map[xi][yi] > 0) {
        return [xi, yi];
    } else {
        return false;
    }
}

function addBlock(location) {
    var [xi,yi] = coordinates(location.elements[0], location.elements[2]);
    if (g_map[xi][yi] >= 4) {
        console.log("At limit ", xi, yi, g_map[xi][yi]);
    } else {
        g_map[xi][yi]++;
    }
}

function deleteBlock(location) {
    var [xi,yi] = coordinates(location.elements[0], location.elements[2]);
    if (g_map[xi][yi] <= 0) {
        console.log("At limit ", xi, yi, g_map[xi][yi]);
    } else {
        g_map[xi][yi]--;
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function findEmpty() {
    var [xi,yi] = [randInt(1,30), randInt(1,30)]
    
    while (g_map[xi][yi] > 0) {
        [xi, yi] = [randInt(1,30), randInt(1,30)]
    }
    return [xi, yi]
}

var cubeVertices = new Float32Array([].concat(
    // Front
    [0,0,0, 1,1,0, 1,0,0],
    [0,0,0, 0,1,0, 1,1,0],
    // Top
    [0,1,0, 0,1,1, 1,1,1],
    [0,1,0, 1,1,1, 1,1,0],
    // Right
    [1,1,0, 1,1,1, 1,0,0],
    [1,0,0, 1,1,1, 1,0,1],
    // Left
    [0,1,0, 0,1,1, 0,0,0],
    [0,0,0, 0,1,1, 0,0,1],
    // Bottom
    [0,0,0, 0,0,1, 1,0,1],
    [0,0,0, 1,0,1, 1,0,0],
    // Back
    [0,0,1, 1,1,1, 1,0,1],
    [0,0,1, 0,1,1, 1,1,1]));

function shuffle(vertices, uv) {
    return [].concat(vertices.slice(0,3),uv.slice(0,2),
        vertices.slice(3,6), uv.slice(2,4),
        vertices.slice(6,9), uv.slice(4,6));
}

var cubeVerticesUV = new Float32Array([].concat(
    // Back      z=0   camera eye z=-3
    shuffle([1.0,0.0,0.0, 0.0,1.0,0.0, 0.0,0.0,0.0], [0,0, 1,1, 1,0]), 
    shuffle([1.0,0.0,0.0, 1.0,1.0,0.0, 0.0,1.0,0.0], [0,0, 0,1, 1,1]), 
    // Top       y=1   camera eye y=3 up = z
    shuffle([1.0,1.0,0.0, 0.0,1.0,1.0, 0.0,1.0,0.0], [0,0, 1,1, 1,0]),
    shuffle([1.0,1.0,0.0, 1.0,1.0,1.0, 0.0,1.0,1.0], [0,0, 0,1, 1,1]),
    // Right     x=1   camera eye x=3
    shuffle([1.0,0.0,1.0, 1.0,1.0,0.0, 1.0,0.0,0.0], [0,0, 1,1, 1,0]),
    shuffle([1.0,0.0,1.0, 1.0,1.0,1.0, 1.0,1.0,0.0], [0,0, 0,1, 1,1]),
    // Left      x=0   camera eye x=-3
    shuffle([0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,0.0,1.0], [0,0, 1,1, 1,0]),
    shuffle([0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0], [0,0, 0,1, 1,1]),
    // Bottom    y=0   camera eye y=-3 up = z
    shuffle([0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0], [0,0, 1,1, 1,0]),
    shuffle([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0], [0,0, 0,1, 1,1]),
    // Front     z=1   camera eye z=3
    shuffle([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0], [0,0, 1,1, 1,0]),
    shuffle([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0], [0,0, 0,1, 1,1])));

function setUpStorage() {
    // adds a gl.program 
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
       console.log('Failed to initialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location u_FragColor');
        return;
    }
    
    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location for a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location for u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    
    // Get the storage location for u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }
    
    // Get the storage location for u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }
    
    // Get the storage location for u_Sampler0
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    // Get the storage location for u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }
}

setUpStorage();

export { gl, canvas, a_Position, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix,
    a_UV, u_ViewMatrix, u_ProjectionMatrix, u_Sampler0, u_Sampler1, u_whichTexture,
    g_map, cubeVertices, cubeVerticesUV, checkCollision, addBlock, deleteBlock,
    findEmpty };