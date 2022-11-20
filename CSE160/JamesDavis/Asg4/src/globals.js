import { initShaders } from '../lib/cuon-utils.js';

const canvas = document.getElementById("webgl");
var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
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

var a_Normal;
var u_lightPos;
var u_cameraPos;
var u_lightOn;
var u_NormalMatrix; // Book p311
var u_Sampler2;
var u_Sampler3;

var VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;

attribute vec2 a_UV;
varying vec2 v_UV;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;

attribute vec3 a_Normal;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform mat4 u_NormalMatrix;

void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    v_VertPos = u_ModelMatrix * a_Position;
} `

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
varying vec2 v_UV;

uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;

// uniform float u_TexColorWeight;
// TexColorWeight becomes inconvenient when you have multiple textures
// -- simpler to use whichTexture
uniform int u_whichTexture;

varying vec3 v_Normal;
uniform vec3 u_lightPos;
varying vec4 v_VertPos;
uniform vec3 u_cameraPos;
uniform bool u_lightOn;

void main() {
    if ((u_whichTexture < -3) || (u_whichTexture > 3)) { // Error: use redish color
        gl_FragColor = vec4(1,.2,.2,1);
    } else if (u_whichTexture == -3) {   // Use normal
        gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {   // Use color
        gl_FragColor = u_FragColor;      
    } else if (u_whichTexture == -1) {   // Use UV debug color
        gl_FragColor = vec4(v_UV, 1, 1);
    } else if (u_whichTexture == 0) {    // Use texture0
        // gl_FragColor = u_FragColor * (1.0 - u_TexColorWeight) + u_TexColorWeight * texture2D(u_Sampler0, v_UV);
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {    // Use texture1
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
        gl_FragColor = vec4(1,.2,.2,1);
    }
   
    // Points from the light to the position
    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // Simple coloring if within certain radius
    // Red/Green distance visualization
    if (r < 0.0) { // 0.5
        gl_FragColor = vec4(1,0,0,1);  // red near
    } else if (r < 0.0) { // 1.0
        gl_FragColor = vec4(0,1,0,1);  // green farther
    }

    // Light fall off visualization 1/r^2 
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L),0.0); // lambertian

    // Reflection
    vec3 R = reflect(-L,N);

    // eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // specular
    float specAngle = max(dot(E,R), 0.0);
    float shininess = 64.0;
    float specular = pow(specAngle, shininess);
    vec3 specularColor = vec3(1.0,1.0,1.0);

    float Kd = 0.7; // Diffuse reflection coefficient
    float Ka = 0.2; // Ambient reflection coefficient
    float Ks = 0.8; // Specular reflection coefficient

    vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL;
    vec3 ambient = vec3(gl_FragColor);

    if (u_lightOn) {
        if ((u_whichTexture >= 0) || (u_whichTexture <= 3)) { // only apply to textures
            gl_FragColor = vec4(
                Kd * diffuse +
                Ka * ambient +
                Ks * specular * specularColor, 1.0);
        } else {
            gl_FragColor = vec4(Kd * diffuse + Ka * ambient, 1.0);
        }
    }
}`

var g_map = generateMap();
fixMap(g_map);

function generateMap() {
    const m = 32;
    const aMap = Array.from(Array(m), () => new Array(m));
    for (var x = 0; x < m; x++) {
        for (var y = 0; y < m; y++) {
            if (Math.random() > .8) {
                aMap[x][y] = (Math.floor(Math.random() * (4 - 0 + 1)) + 0);
            } 
        }
    }
    // Set the walls
    for (var x = 0; x < m; x++) {
        aMap[x][0] = 1;
        aMap[x][m-1] = 1;
    }
    for (var y = 0; y < m; y++) {
        aMap[0][y] = 1;
        aMap[m-1][y] = 1;
    }

    return aMap;
}

function fixMap(aMap) {
    // Location of the animal
    removeBlock(aMap, 0, 0);
    // Initial location of the camera
    // See Camera's constructor
    removeBlock(aMap, -2, -2);
    removeBlock(aMap, -1, -1);
}

function removeBlock(aMap, wX, wY) {
    const m = aMap.length;
    const [xOff, yOff] = [m/2,m/2];
    aMap[wX+xOff][wY+yOff] = 0;
}

generateMap();

function coordinates(x, y) {
    return [Math.floor(x + 16.5), Math.floor(y + 16.5)];
}

function checkCollision(x, y) {
    var [xi, yi] = coordinates(x, y);
    if (g_map[xi][yi] > 0) {
        return [xi, yi];
    } else {
        return false;
    }
}

function addBlock(location) {
    var [xi, yi] = coordinates(location.elements[0], location.elements[2]);
    if (g_map[xi][yi] >= 4) {
        console.log("At limit ", xi, yi, g_map[xi][yi]);
    } else {
        g_map[xi][yi]++;
    }
}

function deleteBlock(location) {
    var [xi, yi] = coordinates(location.elements[0], location.elements[2]);
    if (g_map[xi][yi] <= 0) {
        console.log("At limit ", xi, yi, g_map[xi][yi]);
    } else {
        g_map[xi][yi]--;
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function findEmpty() {
    var [xi, yi] = [randInt(1, 30), randInt(1, 30)]

    while (g_map[xi][yi] > 0) {
        [xi, yi] = [randInt(1, 30), randInt(1, 30)]
    }
    return [xi, yi]
}

var cubeVertices = new Float32Array([].concat(
    // Front
    [0, 0, 0, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 1, 0],
    // Top
    [0, 1, 0, 0, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1, 1, 1, 1, 0],
    // Right
    [1, 1, 0, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 1, 1, 0, 1],
    // Left
    [0, 1, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 1],
    // Bottom
    [0, 0, 0, 0, 0, 1, 1, 0, 1],
    [0, 0, 0, 1, 0, 1, 1, 0, 0],
    // Back
    [0, 0, 1, 1, 1, 1, 1, 0, 1],
    [0, 0, 1, 0, 1, 1, 1, 1, 1]));

function shuffle(vertices, uv) {
    return [].concat(vertices.slice(0, 3), uv.slice(0, 2),
        vertices.slice(3, 6), uv.slice(2, 4),
        vertices.slice(6, 9), uv.slice(4, 6));
}

var cubeVerticesUV = new Float32Array([].concat(
    // Back      z=0   camera eye z=-3
    shuffle([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0]),
    shuffle([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0], [0, 0, 0, 1, 1, 1]),
    // Top       y=1   camera eye y=3 up = z
    shuffle([1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0], [0, 0, 1, 1, 1, 0]),
    shuffle([1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], [0, 0, 0, 1, 1, 1]),
    // Right     x=1   camera eye x=3
    shuffle([1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0]),
    shuffle([1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], [0, 0, 0, 1, 1, 1]),
    // Left      x=0   camera eye x=-3
    shuffle([0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0], [0, 0, 1, 1, 1, 0]),
    shuffle([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], [0, 0, 0, 1, 1, 1]),
    // Bottom    y=0   camera eye y=-3 up = z
    shuffle([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0]),
    shuffle([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0], [0, 0, 0, 1, 1, 1]),
    // Front     z=1   camera eye z=3
    shuffle([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], [0, 0, 1, 1, 1, 0]),
    shuffle([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [0, 0, 0, 1, 1, 1])));

function shuffleWithNormal(vertices, uv, normal) {
    return [].concat(
        vertices.slice(0, 3), uv.slice(0, 2), normal.slice(0, 3),
        vertices.slice(3, 6), uv.slice(2, 4), normal.slice(3, 6),
        vertices.slice(6, 9), uv.slice(4, 6), normal.slice(6, 9));
}

var cubeVerticesUVNormal = new Float32Array([].concat(
    // Back      z=0   camera eye z=-3  normal in -z direction
    shuffleWithNormal([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0],
        [0, 0, -1, 0, 0, -1, 0, 0, -1]),
    shuffleWithNormal([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0], [0, 0, 0, 1, 1, 1],
        [0, 0, -1, 0, 0, -1, 0, 0, -1]),
    // Top       y=1   camera eye y=3 up = z  normal in +y direction
    shuffleWithNormal([1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0], [0, 0, 1, 1, 1, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0]),
    shuffleWithNormal([1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], [0, 0, 0, 1, 1, 1],
        [0, 1, 0, 0, 1, 0, 0, 1, 0]),
    // Right     x=1   camera eye x=3  normal in the +x direction
    shuffleWithNormal([1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0],
        [1, 0, 0, 1, 0, 0, 1, 0, 0]),
    shuffleWithNormal([1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], [0, 0, 0, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0]),
    // Left      x=0   camera eye x=-3 normal in the -x direction
    shuffleWithNormal([0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0], [0, 0, 1, 1, 1, 0],
        [-1, 0, 0, -1, 0, 0, -1, 0, 0]),
    shuffleWithNormal([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], [0, 0, 0, 1, 1, 1],
        [-1, 0, 0, -1, 0, 0, -1, 0, 0]),
    // Bottom    y=0   camera eye y=-3 up = z normal in the -y direction
    shuffleWithNormal([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0], [0, 0, 1, 1, 1, 0],
        [0, -1, 0, 0, -1, 0, 0, -1, 0]),
    shuffleWithNormal([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0], [0, 0, 0, 1, 1, 1],
        [0, -1, 0, 0, -1, 0, 0, -1, 0]),
    // Front     z=1   camera eye z=3  normal in the +z direction
    shuffleWithNormal([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], [0, 0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1]),
    shuffleWithNormal([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [0, 0, 0, 1, 1, 1],
        [0, 0, 1, 0, 0, 1, 0, 0, 1])));

function createSphere() {
    const d = Math.PI / 25;
    const dd = Math.PI / 25;
    const uv = [0, 0];
    var v = [];
    const sin = Math.sin;
    const cos = Math.cos;

    for (var t = 0; t < Math.PI; t += d) {
        for (var r = 0; r < 2 * Math.PI; r += d) {
            const p1 = [sin(t) * cos(r), sin(t) * sin(r), cos(t)];
            const p2 = [sin(t + dd) * cos(r), sin(t + dd) * sin(r), cos(t + dd)];
            const p3 = [sin(t) * cos(r + dd), sin(t) * sin(r + dd), cos(t)];
            const p4 = [sin(t + dd) * cos(r + dd), sin(t + dd) * sin(r + dd), cos(t + dd)];

            const uv1 = [t/Math.PI, r/(2*Math.PI)];
            const uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
            const uv3 = [(t/Math.PI), (r+dd)/(2*Math.PI)];
            const uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

            v = v.concat(
                p1, uv1, p1,
                p2, uv2, p2,
                p4, uv4, p4,
                p1, uv1, p1,
                p4, uv4, p4,
                p3, uv3, p3);
        }
    }
    
    return new Float32Array(v);
};

var sphereVertices = createSphere();

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

    // Get the storage location for u_Sampler1
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

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (!a_Normal) {
        console.log("Failed to get storage location of a_Normal");
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log("Failed to get storage location of u_lightPos");
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log("Failed to get storage location of u_cameraPos");
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log("Failed to get storage location of u_lightOn");
    }

    // Get the storage location for u_Sampler2
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }
    
    // Get the storage location for u_Sampler3
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }
    
    // Get the storage location of u_ModelMatrix
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location u_NormalMatrix');
        return;
    }
}

setUpStorage();

export {
    gl, canvas, a_Position, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix,
    a_UV, u_ViewMatrix, u_ProjectionMatrix, u_Sampler0, u_Sampler1, u_whichTexture,
    g_map, cubeVertices, cubeVerticesUV, checkCollision, addBlock, deleteBlock,
    findEmpty,
    a_Normal, cubeVerticesUVNormal, sphereVertices,
    u_lightPos, u_cameraPos, u_lightOn,
    u_Sampler2, u_Sampler3, 
    u_NormalMatrix,
};