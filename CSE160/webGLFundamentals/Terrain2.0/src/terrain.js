// webgl qna how to import a heightmap in webgl example 3
// from https://webglfundamentals.org/webgl/webgl-qna-how-to-import-a-heightmap-in-webgl-example-3.html

import { Convert } from './img2terrain.js';
import { twgl } from '../lib/twgl-full.js';
import { m4 } from '../lib/3d-math.js';
import { TerrainShader } from './terrainShader.js';

'use strict';

/* global twgl, m4, requestAnimationFrame, document */

const result = {}
Convert.imgLoad('./src/heightmap-96x64.png', result, run);

function run() {

  const gl = document.querySelector('canvas').getContext('webgl');
  const terrainShader = new TerrainShader(gl, result.arrays);
  const programInfo = terrainShader.programInfo;
  const bufferInfo = terrainShader.bufferInfo;

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
    modelView = m4.translate(modelView, result.imgData.width / -2, 0, result.imgData.height / -2)

    const modelMatrix = m4.scale(m4.identity(), 2, .5, 2);

    gl.useProgram(programInfo.program);

    // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    // calls gl.activeTexture, gl.bindTexture, gl.uniformXXX
    twgl.setUniforms(programInfo, {
      projection,
      modelView,
      modelMatrix,
    });  

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}
