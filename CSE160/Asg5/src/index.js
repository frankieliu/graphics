// Three.js - Primitives
// from https://threejs.org/manual/examples/primitives.html

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 120);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xAAAAAA);

  // DirectionalLight
  { 
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  // DirectionalLight
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(1, -2, -4);
    scene.add(light);
  }

  const objects = [];
  const spread = 15;

  function addObject(x, y, obj) {
    obj.position.x = x * spread;
    obj.position.y = y * spread;

    scene.add(obj);
    objects.push(obj);
  }

  function createMaterial() {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
    });

    const hue = Math.random();
    const saturation = 1;
    const luminance = .5;
    material.color.setHSL(hue, saturation, luminance);

    return material;
  }

  function addSolidGeometry(x, y, geometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial());
    addObject(x, y, mesh);
  }

  function addLineGeometry(x, y, geometry) {
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.LineSegments(geometry, material);
    addObject(x, y, mesh);
  }

  const loader = new THREE.TextureLoader();

  // BoxGeometry with texture
  {
    const width = 8;
    const height = 8;
    const depth = 8;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const materials = [
      new THREE.MeshBasicMaterial({ map: loader.load('https://threejs.org/manual/examples/resources/images/flower-1.jpg') }),
      new THREE.MeshBasicMaterial({ map: loader.load('https://threejs.org/manual/examples/resources/images/flower-2.jpg') }),
      new THREE.MeshBasicMaterial({ map: loader.load('https://threejs.org/manual/examples/resources/images/flower-3.jpg') }),
      new THREE.MeshBasicMaterial({ map: loader.load('https://threejs.org/manual/examples/resources/images/flower-4.jpg') }),
      new THREE.MeshBasicMaterial({ map: loader.load('https://threejs.org/manual/examples/resources/images/flower-5.jpg') }),
      new THREE.MeshBasicMaterial({ map: loader.load('https://threejs.org/manual/examples/resources/images/flower-6.jpg') }),
    ];
    const mesh = new THREE.Mesh(geometry, materials);
    addObject(-2, 2, mesh);
  }

  {
    const radius = 7;
    const segments = 24;
    addSolidGeometry(-1, 2, new THREE.CircleGeometry(radius, segments));
  }
  {
    const radius = 6;
    const height = 8;
    const segments = 16;
    addSolidGeometry(0, 2, new THREE.ConeGeometry(radius, height, segments));
  }
  {
    const radiusTop = 4;
    const radiusBottom = 4;
    const height = 8;
    const radialSegments = 12;
    addSolidGeometry(1, 2, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments));
  }
  {
    const radius = 7;
    addSolidGeometry(2, 2, new THREE.DodecahedronGeometry(radius));
  }
  {
    const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = {
      steps: 2,
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 2,
    };

    addSolidGeometry(-2, 1, new THREE.ExtrudeGeometry(shape, extrudeSettings));
  }
  {
    const radius = 7;
    addSolidGeometry(-1, 1, new THREE.IcosahedronGeometry(radius));
  }
  {
    const points = [];
    for (let i = 0; i < 10; ++i) {
      points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
    }
    addSolidGeometry(0, 1, new THREE.LatheGeometry(points));
  }
  {
    const radius = 7;
    addSolidGeometry(1, 1, new THREE.OctahedronGeometry(radius));
  }
  {
    /*
    from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js

    The MIT License

    Copyright ?? 2010-2018 three.js authors

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

    */
    function klein(v, u, target) {
      u *= Math.PI;
      v *= 2 * Math.PI;
      u = u * 2;

      let x;
      let z;

      if (u < Math.PI) {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
        z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
      } else {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u);
      }

      const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

      target.set(x, y, z).multiplyScalar(0.75);
    }

    const slices = 25;
    const stacks = 25;
    addSolidGeometry(2, 1, new ParametricGeometry(klein, slices, stacks));
  }
  {
    const width = 9;
    const height = 9;
    const widthSegments = 2;
    const heightSegments = 2;
    addSolidGeometry(-2, 0, new THREE.PlaneGeometry(width, height, widthSegments, heightSegments));
  }
  {
    const verticesOfCube = [
      -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    ];
    const indicesOfFaces = [
      2, 1, 0, 0, 3, 2,
      0, 4, 7, 7, 3, 0,
      0, 1, 5, 5, 4, 0,
      1, 2, 6, 6, 5, 1,
      2, 3, 7, 7, 6, 2,
      4, 5, 6, 6, 7, 4,
    ];
    const radius = 7;
    const detail = 2;
    addSolidGeometry(-1, 0, new THREE.PolyhedronGeometry(verticesOfCube, indicesOfFaces, radius, detail));
  }
  {
    const innerRadius = 2;
    const outerRadius = 7;
    const segments = 18;
    addSolidGeometry(0, 0, new THREE.RingGeometry(innerRadius, outerRadius, segments));
  }
  {
    const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
    addSolidGeometry(1, 0, new THREE.ShapeGeometry(shape));
  }
  {
    const radius = 7;
    const widthSegments = 12;
    const heightSegments = 8;
    addSolidGeometry(2, 0, new THREE.SphereGeometry(radius, widthSegments, heightSegments));
  }
  {
    const radius = 7;
    addSolidGeometry(-2, -1, new THREE.TetrahedronGeometry(radius));
  }
  {
    const loader = new FontLoader();
    // promisify font loading
    function loadFont(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    async function doit() {
      const font = await loadFont('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json');
      const geometry = new TextGeometry('three.js', {
        font: font,
        size: 3.0,
        height: .2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: .3,
        bevelSegments: 5,
      });
      const mesh = new THREE.Mesh(geometry, createMaterial());
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

      const parent = new THREE.Object3D();
      parent.add(mesh);

      addObject(-1, -1, parent);
    }
    doit();
  }
  {
    const radius = 5;
    const tubeRadius = 2;
    const radialSegments = 8;
    const tubularSegments = 24;
    addSolidGeometry(0, -1, new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments));
  }
  {
    const radius = 3.5;
    const tube = 1.5;
    const radialSegments = 8;
    const tubularSegments = 64;
    const p = 2;
    const q = 3;
    addSolidGeometry(1, -1, new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q));
  }
  {
    class CustomSinCurve extends THREE.Curve {
      constructor(scale) {
        super();
        this.scale = scale;
      }
      getPoint(t) {
        const tx = t * 3 - 1.5;
        const ty = Math.sin(2 * Math.PI * t);
        const tz = 0;
        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
      }
    }

    const path = new CustomSinCurve(4);
    const tubularSegments = 20;
    const radius = 1;
    const radialSegments = 8;
    const closed = false;
    addSolidGeometry(2, -1, new THREE.TubeGeometry(path, tubularSegments, radius, radialSegments, closed));
  }
  {
    const width = 8;
    const height = 8;
    const depth = 8;
    const thresholdAngle = 15;
    addLineGeometry(-1, -2, new THREE.EdgesGeometry(
      new THREE.BoxGeometry(width, height, depth),
      thresholdAngle));
  }
  {
    const width = 8;
    const height = 8;
    const depth = 8;
    addLineGeometry(1, -2, new THREE.WireframeGeometry(new THREE.BoxGeometry(width, height, depth)));
  }

  // HemisphereLight
  { 
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  // DirectionalLight
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5 - 2, 10 - 2, 2);
    scene.add(light);
    scene.add(light.target);
  }
  
  // Textured Obj
  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.mtl', (mtl) => {
      mtl.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(mtl);
      objLoader.load('https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', (root) => {
        addObject(-2, -2, root);
      });
    });
  }

  // Skybox
  {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
      'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
      'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
      'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
      'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
      'https://threejs.org/manual/examples/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
    ]);
    scene.background = texture;
  }

  // Extra Part 1: Billboard
  {
    const bodyRadiusTop = .4;
    const bodyRadiusBottom = .2;
    const bodyHeight = 2;
    const bodyRadialSegments = 6;
    const bodyGeometry = new THREE.CylinderGeometry(
      bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments);

    const headRadius = bodyRadiusTop * 0.8;
    const headLonSegments = 12;
    const headLatSegments = 5;
    const headGeometry = new THREE.SphereGeometry(
      headRadius, headLonSegments, headLatSegments);

    function makeLabelCanvas(baseWidth, size, name) {
      const borderSize = 2;
      const ctx = document.createElement('canvas').getContext('2d');
      const font = `${size}px bold sans-serif`;
      ctx.font = font;
      // measure how long the name will be
      const textWidth = ctx.measureText(name).width;

      const doubleBorderSize = borderSize * 2;
      const width = baseWidth + doubleBorderSize;
      const height = size + doubleBorderSize;
      ctx.canvas.width = width;
      ctx.canvas.height = height;

      // need to set font again after resizing canvas
      ctx.font = font;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, width, height);

      // scale to fit but don't stretch
      const scaleFactor = Math.min(1, baseWidth / textWidth);
      ctx.translate(width / 2, height / 2);
      ctx.scale(scaleFactor, 1);
      ctx.fillStyle = 'white';
      ctx.fillText(name, 0, 0);

      return ctx.canvas;
    }

    function makePerson(x, labelWidth, size, name, color) {
      const canvas = makeLabelCanvas(labelWidth, size, name);
      const texture = new THREE.CanvasTexture(canvas);
      // because our canvas is likely not a power of 2
      // in both dimensions set the filtering appropriately.
      texture.minFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color,
        flatShading: true,
      });

      const root = new THREE.Object3D();
      root.position.x = x;

      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      root.add(body);
      body.position.y = bodyHeight / 2;

      const head = new THREE.Mesh(headGeometry, bodyMaterial);
      root.add(head);
      head.position.y = bodyHeight + headRadius * 1.1;

      // if units are meters then 0.01 here makes size
      // of the label into centimeters.
      const labelBaseScale = 0.01;
      const label = new THREE.Sprite(labelMaterial);
      root.add(label);
      label.position.y = head.position.y + headRadius + size * labelBaseScale;

      label.scale.x = canvas.width * labelBaseScale;
      label.scale.y = canvas.height * labelBaseScale;

      root.scale.x = canvas.width * 0.03;
      root.scale.y = canvas.width * 0.03;
      root.scale.z = canvas.width * 0.03;
      return root;
    }

    addObject(0, -2, makePerson(0, 150, 32, 'Billboard', 'purple'));

  }

  // Extra Part 2: Transparent cubes
  {

    const root = new THREE.Object3D();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry, color, x, y, z) {
      [THREE.BackSide, THREE.FrontSide].forEach((side) => {
        const material = new THREE.MeshPhongMaterial({
          color,
          opacity: 0.5,
          transparent: true,
          side,
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        root.add(cube);
      });
    }

    function hsl(h, s, l) {
      return (new THREE.Color()).setHSL(h, s, l);
    }

    {
      const d = 0.8;
      makeInstance(geometry, hsl(0 / 8, 1, .5), -d, -d, -d);
      makeInstance(geometry, hsl(1 / 8, 1, .5), d, -d, -d);
      makeInstance(geometry, hsl(2 / 8, 1, .5), -d, d, -d);
      makeInstance(geometry, hsl(3 / 8, 1, .5), d, d, -d);
      makeInstance(geometry, hsl(4 / 8, 1, .5), -d, -d, d);
      makeInstance(geometry, hsl(5 / 8, 1, .5), d, -d, d);
      makeInstance(geometry, hsl(6 / 8, 1, .5), -d, d, d);
      makeInstance(geometry, hsl(7 / 8, 1, .5), d, d, d);
    }
    root.scale.x = canvas.width * 0.02;
    root.scale.y = canvas.width * 0.02;
    root.scale.z = canvas.width * 0.02;
    addObject(2, -2, root);
  }


  // Extra Part 3: Dynamic textures
  const ctx = document.createElement('canvas').getContext('2d');
  const texture = new THREE.CanvasTexture(ctx.canvas);
  {
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    ctx.canvas.width = 256;
    ctx.canvas.height = 256;
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.scale.x = canvas.width * 0.04;
    cube.scale.y = canvas.width * 0.04;
    cube.scale.z = canvas.width * 0.04;

    addObject(0,3,cube);
  }

  function randInt(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min | 0;
  }

  function drawRandomDot(ctx) {
    ctx.fillStyle = `#${randInt(0x1000000).toString(16).padStart(6, '0')}`;
    ctx.beginPath();

    const x = randInt(256);
    const y = randInt(256);
    const radius = randInt(10, 64);
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    drawRandomDot(ctx);
    texture.needsUpdate = true;

    objects.forEach((obj, ndx) => {
      const speed = .1 + ndx * .05;
      const rot = time * speed;
      obj.rotation.x = rot;
      obj.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();