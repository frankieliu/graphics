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
var u_WhichTexture;

var a_Normal;
var u_LightPos;
var u_CameraPos;
var u_LightOn;
var u_NormalMatrix; // Book p311
var u_Sampler2;
var u_Sampler3;
var u_LightColor;
var u_LightProperties;

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
// -- simpler to use WhichTexture
uniform int u_WhichTexture;

varying vec3 v_Normal;
uniform vec3 u_LightPos;
varying vec4 v_VertPos;
uniform vec3 u_CameraPos;
uniform bool u_LightOn;
uniform vec4 u_LightColor;

struct LightProperties {
    bool enabled;
    vec4 position;
    vec3 color;
    vec3 spotDirection;  // Note: only a point light can be a spotlight
    float spotCosineCutoff; // if <= 0, this is not a spotlight, if >= 1, the light cone shrinks to nothing
    float spotExponent;
};

struct MaterialProperties {
    vec3 diffuseColor;
    vec3 specularColor;
    float specularExponent;
};

uniform LightProperties u_LightProperties[4];

vec3 lightingEquation(
    LightProperties light,
    MaterialProperties material, 
    vec3 eyeCoords, // position of the vertex
    vec3 N, vec3 V) {
   
    // N is normal vector
    // V is direction to viewer.
    // V points from the vertex to the viewer
    
    vec3 L, R; // Light direction and reflected light direction.
    float spotFactor = 1.0;  // multiplier to account for spotlight
    
    // directional light -> parallel rays 
    if ( light.position.w == 0.0 ) {
        L = normalize( light.position.xyz );
    }
    else { // point lights -- make sure set position.w = 1
        L = normalize( light.position.xyz/light.position.w - eyeCoords );
        
        // Spot light
        if (light.spotCosineCutoff > 0.0) { // the light is a spotlight
            vec3 D = -normalize(light.spotDirection);
            float spotCosine = dot(D,L);
            if (spotCosine >= light.spotCosineCutoff) { 
                spotFactor = pow(spotCosine,light.spotExponent);
            }
            else { // The point is outside the cone of light from the spotlight.
                spotFactor = 0.0; // The light will add no color to the point.
            }
        }

    }

    if (dot(L,N) <= 0.0) {
        return vec3(0.0);
    }

    vec3 reflection = dot(L,N) * light.color * material.diffuseColor;
    R = -reflect(L,N);
    if (dot(R,V) > 0.0) {
        float factor = pow(dot(R,V),material.specularExponent);
        reflection += factor * material.specularColor * light.color;
    }

    return spotFactor*reflection;

}

void main() {

    if ((u_WhichTexture < -3) || (u_WhichTexture > 3)) { // Error: use redish color
        gl_FragColor = vec4(1,.2,.2,1);
    } else if (u_WhichTexture == -3) {   // Use normal
        gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_WhichTexture == -2) {   // Use color
        gl_FragColor = u_FragColor;      
    } else if (u_WhichTexture == -1) {   // Use UV debug color
        gl_FragColor = vec4(v_UV, 1, 1);
    } else if (u_WhichTexture == 0) {    // Use texture0
        // gl_FragColor = u_FragColor * (1.0 - u_TexColorWeight) + u_TexColorWeight * texture2D(u_Sampler0, v_UV);
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_WhichTexture == 1) {    // Use texture1
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_WhichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_WhichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else {
        gl_FragColor = vec4(1,.2,.2,1);
    }
   
    // Points from the light to the position
    vec3 lightVector = u_LightPos - vec3(v_VertPos);
    // In the book it should point the other direction

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
    vec3 E = normalize(u_CameraPos - vec3(v_VertPos));

    // specular
    float specAngle = max(dot(E,R), 0.0);
    float shininess = 64.0;
    float specular = pow(specAngle, shininess);
    // Normally should be a material property
    // Here we just assume that the surface is fairly reflective
    // for specular reflection
    vec3 specularColor = vec3(u_LightColor);

    float Kd = 0.7; // Diffuse reflection coefficient
    float Ka = 0.2; // Ambient reflection coefficient
    float Ks = 0.8; // Specular reflection coefficient

    vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * vec3(u_LightColor) * nDotL;
    vec3 ambient = vec3(gl_FragColor);

    if (u_LightOn) {
        vec3 color = vec3(0.0);
        for (int i = 0; i < 4; i++) {
            MaterialProperties material = MaterialProperties(
                vec3(gl_FragColor), vec3(1.,1.,1.), shininess);
            if (u_LightProperties[i].enabled) {
                color += lightingEquation( u_LightProperties[i],
                    material, vec3(v_VertPos), N, E);
            }
        }
        // Add the colors
        if ((u_WhichTexture >= 0) && (u_WhichTexture <= 3)) { // only apply to textures
            color += Kd * diffuse + Ka * ambient + Ks * specular; 
        } else {
            color += Kd * diffuse + Ka * ambient;
        }
        gl_FragColor = vec4(color,1.0);
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
    // For Asg 4 remove blocks we have a 10x10 room
    for(var x=-7;x<=7;x++) {
        for (var y=-7;y<=7;y++) {
            removeBlock(aMap, x,y);
        }
    }
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
    u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
    if (!u_WhichTexture) {
        console.log('Failed to get the storage location of u_WhichTexture');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (!a_Normal) {
        console.log("Failed to get storage location of a_Normal");
        return;
    }

    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    if (!u_LightPos) {
        console.log("Failed to get storage location of u_LightPos");
        return;
    }

    u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
    if (!u_CameraPos) {
        console.log("Failed to get storage location of u_CameraPos");
        return;
    }

    u_LightOn = gl.getUniformLocation(gl.program, 'u_LightOn');
    if (!u_LightOn) {
        console.log("Failed to get storage location of u_LightOn");
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

    // Get the storage location of u_LightColor
    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    if (!u_LightColor) {
        console.log('Failed to get the storage location u_LightColor');
    }

    u_LightProperties = new Array(4);
    for (var i = 0; i < u_LightProperties.length; i++) {
        u_LightProperties[i] = {
            enabled: gl.getUniformLocation(
                gl.program, "u_LightProperties[" + i + "].enabled" ),
            position: gl.getUniformLocation(
                gl.program, "u_LightProperties[" + i + "].position" ),
            color: gl.getUniformLocation(
                gl.program, "u_LightProperties[" + i + "].color" ),
            spotDirection: gl.getUniformLocation(
                gl.program, "u_LightProperties[" + i + "].spotDirection"),
            spotCosineCutoff: gl.getUniformLocation(
                gl.program, "u_LightProperties[" + i + "].spotCosineCutoff"),
            spotExponent: gl.getUniformLocation(
                gl.program, "u_LightProperties[" + i + "].spotExponent"),
            // vec3 spotDirection;  // Note: only a point light can be a spotlight
            // float spotCosineCutoff; // if <= 0, this is not a spotlight, if >= 1, the light cone shrinks to nothing
            // float spotExponent;
        };
    }

}

setUpStorage();

function hexToRgb(hex) {
    var result0 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var result = result0.slice(1,5)
    return result.map(x => parseInt(x,16))
}

export {
    gl, canvas, a_Position, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix,
    a_UV, u_ViewMatrix, u_ProjectionMatrix, u_Sampler0, u_Sampler1, u_WhichTexture,
    g_map, cubeVertices, cubeVerticesUV, checkCollision, addBlock, deleteBlock,
    findEmpty,
    a_Normal, cubeVerticesUVNormal, sphereVertices,
    u_LightPos, u_CameraPos, u_LightOn,
    u_Sampler2, u_Sampler3, 
    u_NormalMatrix,
    hexToRgb,
    u_LightColor,
    u_LightProperties,
};