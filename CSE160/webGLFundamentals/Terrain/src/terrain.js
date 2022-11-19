// webgl qna how to import a heightmap in webgl example 3
// from https://webglfundamentals.org/webgl/webgl-qna-how-to-import-a-heightmap-in-webgl-example-3.html

import { Convert } from './img2terrain.js';
import { twgl } from '../lib/twgl-full.js';
import { m4 } from '../lib/3d-math.js';

'use strict';

/* global twgl, m4, requestAnimationFrame, document */

const img = new Image();
img.onload = run;
img.crossOrigin = 'anonymous';
img.src = './src/heightmap-96x64.png';

function run() {
  // use a canvas 2D to read the image
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = img.width;
  ctx.canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Computes the vertices, texture coordinates, and indices for triangles
  var { positions, texcoords, indices } = Convert.computeGrid(imgData);

  const maxAngle = 2 * Math.PI / 180;  // make them facetted
  const arrays = Convert.generateNormals({
    position: positions,
    texcoord: texcoords,
    indices,
  }, maxAngle);

  const gl = document.querySelector('canvas').getContext('webgl');

  const vs = `
  attribute vec4 position;
  attribute vec3 normal;
  attribute vec2 texcoord;

  uniform mat4 projection;
  uniform mat4 modelView;

  varying vec3 v_normal;
  varying vec2 v_texcoord;

  void main() {
    gl_Position = projection * modelView * position;
    v_normal = mat3(modelView) * normal;
    v_texcoord = texcoord;
  }
  `;

  const fs = `
  precision highp float;

  varying vec3 v_normal;
  varying vec2 v_texcoord;
  varying float v_modelId;

  void main() {
    vec3 lightDirection = normalize(vec3(1, 2, -3));  // arbitrary light direction

    float l = dot(lightDirection, normalize(v_normal)) * .5 + .5;
    gl_FragColor = vec4(vec3(0,1,0) * l, 1);
  }
  `;

  // compile shader, link, look up locations
  const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  // make some vertex data
  // calls gl.createBuffer, gl.bindBuffer, gl.bufferData for each array
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  function render(time) {
    time *= 0.001;  // seconds

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const fov = Math.PI * 0.25;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 100;
    const projection = m4.perspective(fov, aspect, near, far);

    const eye = [0, 10, 25];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    let modelView = m4.yRotate(view, time);
    modelView = m4.translate(modelView, imgData.width / -2, 0, imgData.height / -2)

    gl.useProgram(programInfo.program);

    // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    // calls gl.activeTexture, gl.bindTexture, gl.uniformXXX
    twgl.setUniforms(programInfo, {
      projection,
      modelView,
    });  

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}
