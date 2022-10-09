// WebGL2 - 2D - DrawImage with full options
// from https://webgl2fundamentals.org/webgl/webgl-2d-drawimage-03.html

"use strict";

var vertexShaderSource = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;
uniform mat4 u_textureMatrix;

out vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * a_position;
  v_texcoord = (u_textureMatrix * vec4(a_texcoord, 0, 1)).xy;
}
`;

var fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

var program = null;
var vao = null;
var textureLocation = null;
var matrixLocation = null;
var textureMatrixLocation = null;

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function loadImageAndCreateTextureInfo(gl, url) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]));

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var textureInfo = {
    width: 1,   // we don't know the size until it loads
    height: 1,
    texture: tex,
  };
  var img = new Image();
  img.addEventListener('load', function () {
    textureInfo.width = img.width;
    textureInfo.height = img.height;

    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
  });
  requestCORSIfNotSameOrigin(img, url)
  img.src = url;

  return textureInfo;
}

function update(gl, drawInfos, speed, deltaTime) {
  drawInfos.forEach(function (drawInfo) {
    drawInfo.x += drawInfo.dx * speed * deltaTime;
    drawInfo.y += drawInfo.dy * speed * deltaTime;
    if (drawInfo.x < 0) {
      drawInfo.dx = 1;
    }
    if (drawInfo.x >= gl.canvas.width) {
      drawInfo.dx = -1;
    }
    if (drawInfo.y < 0) {
      drawInfo.dy = 1;
    }
    if (drawInfo.y >= gl.canvas.height) {
      drawInfo.dy = -1;
    }
  });
}

// Unlike images, textures do not have a width and height associated
// with them so we'll pass in the width and height of the texture
function drawImage(
  gl,
  tex, texWidth, texHeight,
  srcX, srcY, srcWidth, srcHeight,
  dstX, dstY, dstWidth, dstHeight) {
  if (dstX === undefined) {
    dstX = srcX;
    srcX = 0;
  }
  if (dstY === undefined) {
    dstY = srcY;
    srcY = 0;
  }
  if (srcWidth === undefined) {
    srcWidth = texWidth;
  }
  if (srcHeight === undefined) {
    srcHeight = texHeight;
  }
  if (dstWidth === undefined) {
    dstWidth = srcWidth;
    srcWidth = texWidth;
  }
  if (dstHeight === undefined) {
    dstHeight = srcHeight;
    srcHeight = texHeight;
  }

  gl.useProgram(program);

  // Setup the attributes for the quad
  gl.bindVertexArray(vao);

  var textureUnit = 0;
  // The the shader we're putting the texture on texture unit 0
  gl.uniform1i(textureLocation, textureUnit);

  // Bind the texture to texture unit 0
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, tex);

  // this matrix will convert from pixels to clip space
  var matrix = m4.orthographic(
    0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);

  // translate our quad to dstX, dstY
  matrix = m4.translate(matrix, dstX, dstY, 0);

  // scale our 1 unit quad
  // from 1 unit to dstWidth, dstHeight units
  matrix = m4.scale(matrix, dstWidth, dstHeight, 1);

  // Set the matrix.
  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  // Because texture coordinates go from 0 to 1
  // and because our texture coordinates are already a unit quad
  // we can select an area of the texture by scaling the unit quad
  // down
  var texMatrix = m4.translation(srcX / texWidth, srcY / texHeight, 0);
  texMatrix = m4.scale(texMatrix, srcWidth / texWidth, srcHeight / texHeight, 1);

  // Set the texture matrix.
  gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);

  // draw the quad (2 triangles, 6 vertices)
  var offset = 0;
  var count = 6;
  gl.drawArrays(gl.TRIANGLES, offset, count);
}

function draw(gl, drawInfos) {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawInfos.forEach(function (drawInfo) {
    var dstX = drawInfo.x;
    var dstY = drawInfo.y;
    var dstWidth = drawInfo.textureInfo.width * drawInfo.xScale;
    var dstHeight = drawInfo.textureInfo.height * drawInfo.yScale;

    var srcX = drawInfo.textureInfo.width * drawInfo.offX;
    var srcY = drawInfo.textureInfo.height * drawInfo.offY;
    var srcWidth = drawInfo.textureInfo.width * drawInfo.width;
    var srcHeight = drawInfo.textureInfo.height * drawInfo.height;

    drawImage(
      gl,
      drawInfo.textureInfo.texture,
      drawInfo.textureInfo.width,
      drawInfo.textureInfo.height,
      srcX, srcY, srcWidth, srcHeight,
      dstX, dstY, dstWidth, dstHeight);
  });
}

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  program = webglUtils.createProgramFromSources(gl,
    [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  // lookup uniforms
  matrixLocation = gl.getUniformLocation(program, "u_matrix");
  textureLocation = gl.getUniformLocation(program, "u_texture");
  textureMatrixLocation = gl.getUniformLocation(program, "u_textureMatrix");

  // Create a vertex array object (attribute state)
  vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // create the position buffer, make it the current ARRAY_BUFFER
  // and copy in the color values
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put a unit quad in the buffer
  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  // create the texcoord buffer, make it the current ARRAY_BUFFER
  // and copy in the texcoord values
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  // Put texcoords in the buffer
  var texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(texcoordAttributeLocation);

  // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    texcoordAttributeLocation, size, type, normalize, stride, offset);


  var textureInfos = [
    loadImageAndCreateTextureInfo(gl, 'https://webgl2fundamentals.org/webgl/resources/star.jpg'),
    loadImageAndCreateTextureInfo(gl, 'https://webgl2fundamentals.org/webgl/resources/leaves.jpg'),
    loadImageAndCreateTextureInfo(gl, 'https://webgl2fundamentals.org/webgl/resources/keyboard.jpg'),
  ];

  var drawInfos = [];
  var numToDraw = 9;
  var speed = 60;
  for (var ii = 0; ii < numToDraw; ++ii) {
    var drawInfo = {
      x: Math.random() * gl.canvas.width,
      y: Math.random() * gl.canvas.height,
      dx: Math.random() > 0.5 ? -1 : 1,
      dy: Math.random() > 0.5 ? -1 : 1,
      xScale: Math.random() * 0.25 + 0.25,
      yScale: Math.random() * 0.25 + 0.25,
      offX: Math.random() * 0.75,
      offY: Math.random() * 0.75,
      textureInfo: textureInfos[Math.random() * textureInfos.length | 0],
    };
    drawInfo.width = Math.random() * (1 - drawInfo.offX);
    drawInfo.height = Math.random() * (1 - drawInfo.offY);
    drawInfos.push(drawInfo);
  }


  var then = 0;
  function render(time) {
    var now = time * 0.001;
    var deltaTime = Math.min(0.1, now - then);
    then = now;

    update(gl, drawInfos, speed, deltaTime);
    draw(gl, drawInfos);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();


// This is needed if the images are not on the same domain
// NOTE: The server providing the images must give CORS permissions
// in order to be able to use the image with WebGL. Most sites
// do NOT give permission.
// See: http://webgl2fundamentals.org/webgl/lessons/webgl-cors-permission.html
function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url, window.location.href)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}

