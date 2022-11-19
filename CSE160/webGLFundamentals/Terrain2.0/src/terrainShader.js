import { twgl } from '../lib/twgl-full.js';

const vs = `
  attribute vec4 position;
  attribute vec3 normal;
  attribute vec2 texcoord;

  uniform mat4 modelMatrix;
  uniform mat4 projection;
  uniform mat4 modelView;

  varying vec3 v_normal;
  varying vec2 v_texcoord;

  void main() {
    gl_Position = projection * modelView * modelMatrix * position;
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

class TerrainShader {
    
    constructor(gl, arrays) {

        // compile shader, link, look up locations
        this.programInfo = twgl.createProgramInfo(gl, [vs, fs]);

        // make some vertex data
        // calls gl.createBuffer, gl.bindBuffer, gl.bufferData for each array
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    }

}

export { TerrainShader }