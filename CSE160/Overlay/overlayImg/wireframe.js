"use strict";
(function () {

const $gl_canvas = document.getElementById("webgl-canvas");
const $wireframe_canvas = document.getElementById("wireframe-canvas");

let gl, wire;       // canvas contexts, from .getContext()

let shader_program, attrib_locations, uniform_locations;    // initialized in create_shader_program()

let wireframe_enabled;
let animation_enabled = false;

let object_rotation = 0.0, camera_pos = [0.0, 0.0, 0.0];
let last_draw_time = null;
const scene_objects = [];


const RADIANS_PER_DEGREE = Math.PI / 180.0;
function deg2rad (degrees) {
    return degrees * RADIANS_PER_DEGREE;
}
function rad2deg (radians) {
    return radians / RADIANS_PER_DEGREE;
}


function vec3_from_in_array (out, a, idx) {
    idx *= 3;
    out[0] = a[idx];
    out[1] = a[idx + 1];
    out[2] = a[idx + 2];
    return out;
}


function init_enable_wireframe_checkbox () {
    const $enable_wireframe = document.getElementById("enable-wireframe");
    function update_wireframe_enabled () {
        wireframe_enabled = $enable_wireframe.checked;
        console.log(`Setting wireframe enabled = ${wireframe_enabled}`);
        document.documentElement.classList.toggle("wireframe-enabled", wireframe_enabled);
    }
    update_wireframe_enabled();
    $enable_wireframe.addEventListener("click", update_wireframe_enabled);
}


function init_start_stop_animation () {
    const $btn = document.getElementById("start-stop-anim");
    $btn.addEventListener("click", () => {
        animation_enabled = !animation_enabled;
        $btn.textContent = animation_enabled ? "Stop animation" : "Start animation";
        if (animation_enabled)
            requestAnimationFrame(render_frame);
        last_draw_time = null;
    });
}


function init_canvases () {
    // Opaque 3D canvas in the background.
    gl = $gl_canvas.getContext("webgl", { alpha: false });

    // Transparent 2D canvas in the foreground.
    wire = $wireframe_canvas.getContext("2d", { alpha: true });

    // Basic OpenGL settings.
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
}


// Set the proper scaling for the canvases, and make sure they're the same size, and redraw.
let current_width = null, current_height = null;
function update_canvas_sizes () {
    const width = $gl_canvas.clientWidth * window.devicePixelRatio;
    const height = $gl_canvas.clientHeight * window.devicePixelRatio;
    if (width !== current_width || height !== current_height) {
        console.log(`Setting canvases to size ${width} × ${height}`);
        current_width  = $gl_canvas.width  = $wireframe_canvas.width  = width;
        current_height = $gl_canvas.height = $wireframe_canvas.height = height;
        gl.viewport(0, 0, width, height);
        draw_scene();
    }
}


// Make the glMatrix functions available without a prefix.
function init_glmatrix_library () {
    for (name in glMatrix) {
        if (name !== "glMatrix")
            window[name] = glMatrix[name];
    }
}


function vertex_shader_src () {
    return `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        uniform vec4 uColor;

        uniform mat4 uNormalMatrix;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;
        varying highp vec3 vLighting;

        void main () {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = uColor;

            // Lighting.
            highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
            highp vec3 directionalLightColor = vec3(1, 1, 1);
            highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

            highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

            highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
            vLighting = ambientLight + (directionalLightColor * directional);
        }
    `;
}

function fragment_shader_src () {
    return `
        varying lowp vec4 vColor;
        varying highp vec3 vLighting;

        void main () {
            gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
        }
    `;
}

function create_shader_program () {
    const vertex_shader = load_shader(gl.VERTEX_SHADER, vertex_shader_src());
    const fragment_shader = load_shader(gl.FRAGMENT_SHADER, fragment_shader_src());

    shader_program = gl.createProgram();
    gl.attachShader(shader_program, vertex_shader);
    gl.attachShader(shader_program, fragment_shader);
    gl.linkProgram(shader_program);

    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shader_program));
        return null;
    }

    attrib_locations = {
        vertex_position: gl.getAttribLocation(shader_program, "aVertexPosition"),
        vertex_normal: gl.getAttribLocation(shader_program, "aVertexNormal"),
    };

    uniform_locations = {
        projection_matrix: gl.getUniformLocation(shader_program, "uProjectionMatrix"),
        model_view_matrix: gl.getUniformLocation(shader_program, "uModelViewMatrix"),
        normal_matrix: gl.getUniformLocation(shader_program, "uNormalMatrix"),
        color: gl.getUniformLocation(shader_program, "uColor"),
    };
}

function load_shader (type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


function create_model_cube () {
    const positions = new Float32Array([
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ]);

    const normals = new Float32Array([
        // Front
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,
        0.0,  0.0,  1.0,

        // Back
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,
        0.0,  0.0, -1.0,

        // Top
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,
        0.0,  1.0,  0.0,

        // Bottom
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,
        0.0, -1.0,  0.0,

        // Right
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,
        1.0,  0.0,  0.0,

        // Left
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ]);

    const indices = new Uint16Array([
        0,  1,  2,      0,  2,  3,      // front
        4,  5,  6,      4,  6,  7,      // back
        8,  9,  10,     8,  10, 11,     // top
        12, 13, 14,     12, 14, 15,     // bottom
        16, 17, 18,     16, 18, 19,     // right
        20, 21, 22,     20, 22, 23,     // left
    ]);

    return create_model_from_data(positions, normals, indices);
}


function create_model_cylinder_nonsmooth_openend (num_slices, half_height) {
    let positions = [], normals = [], indices = [];

    let angles = [];
    for (let i = 0; i < num_slices; ++i)
        angles.push();

    let idx = 0;
    for (let i = 0; i < num_slices; ++i) {
        let ang1 = Math.PI * 2 / num_slices * i;
        let ang2 = Math.PI * 2 / num_slices * (i + 1);
        let x1 = Math.cos(ang1), y1 = Math.sin(ang1);
        let x2 = Math.cos(ang2), y2 = Math.sin(ang2);

        positions.push(x1);     // btm left
        positions.push(-half_height);
        positions.push(y1);
        positions.push(x1);     // top left
        positions.push(+half_height);
        positions.push(y1);
        positions.push(x2);     // btm right
        positions.push(-half_height);
        positions.push(y2);
        positions.push(x2);     // top right
        positions.push(+half_height);
        positions.push(y2);

        let normang = (ang1 + ang2) / 2;
        let normx = Math.cos(normang), normy = Math.sin(normang);
        for (let j = 0; j < 4; ++j) {
            normals.push(normx);
            normals.push(0.0);
            normals.push(normy);
        }

        indices.push(idx + 0);
        indices.push(idx + 1);
        indices.push(idx + 2);
        indices.push(idx + 1);
        indices.push(idx + 3);
        indices.push(idx + 2);
        idx += 4;
    }

    return create_model_from_data(positions, normals, indices);
}


function create_model_icosphere (levels) {
    // First calculate the spherical coordinates and triangles of the basic icosahedron.
    let lats = [], lngs = [];   // latitude and longitude, both in degrees, based at 0°
    let indices = [];

    lats.push(0.0); lngs.push(0.0);     // 0: north
    lats.push(+180.0); lngs.push(0.0);  // 1: south

    let ang = 0.0;
    let degs_up_or_down = rad2deg(Math.atan(0.5));
    for (let i = 0; i < 5; ++i) {
        lngs.push(ang);
        lats.push(90.0 - degs_up_or_down);  // even indices: northern circle
        ang += 36.0;
        lngs.push(ang);
        lats.push(90.0 + degs_up_or_down);  // odd indices: southern circle
        ang += 36.0;

        let idx = function (offset) {
            return 2 + (i * 2 + offset) % 10;
        };
        indices.push(0, idx(2), idx(0));        // from north pole
        indices.push(idx(0), idx(2), idx(1));   // northern circle
        indices.push(idx(1), idx(2), idx(3));   // southern circle
        indices.push(idx(1), idx(3), 1);        // to south pole
    }

    // Now subdivide triangles by finding half-way points between their vertices.
    // Since we're using spherical coordinates, these points will still be on the sphere.
    // Maintain a cache of half-way vertices generated to ensure reuse.
    let cache = {};     // key "A-B", where A and B are indices, smallest first
    let half_way_index = function (a, b) {
        if (a > b)
            [a, b] = [b, a];
        let key = "" + a + "-" + b;
        if (cache[key] !== undefined)
            return cache[key];
        let idx = lats.length;

        // Latitudes can just be averaged to find half way mark, because they never go over the poles.
        lats.push((lats[a] + lats[b]) / 2.0);

        // For longitudes we have to:
        //  a) ignore the meaningless longitude of one end if it's at a pole
        //  b) calculate differently if the edge wraps wround the 0°/360° point
        let lnga = lngs[a], lngb = lngs[b];
        if (a === 0 || a === 1)
            lngs.push(lngb);
        else if (b === 0 || b === 1)
            lngs.push(lnga);
        else {
            if (lnga > lngb)
                [lnga, lngb] = [lngb, lnga];
            if (lngb - lnga > 180.0)
                lnga += 360.0;
            lngs.push((lnga + lngb) / 2.0 % 360.0);
        }

        return cache[key] = idx;
    };

    for (let level = 1; level < levels; ++level) {
        let old_indices = indices;
        indices = [];
        for (let tri = 0; tri < old_indices.length; tri += 3) {
            // Divide each old triangle into 4 smaller ones.
            let a = old_indices[tri + 0];
            let b = old_indices[tri + 1];
            let c = old_indices[tri + 2];
            let ab = half_way_index(a, b);
            let bc = half_way_index(b, c);
            let ca = half_way_index(c, a);
            indices.push(a, ab, ca);    // corner ones
            indices.push(b, bc, ab);
            indices.push(c, ca, bc);
            indices.push(ab, bc, ca);   // middle one
        }
    }

    // Finally calculate cartesian coordinates etc. from lat/long.
    const positions = [], normals = [];

    for (let i = 0; i < lats.length; ++i) {
        const lat = lats[i], latrad = deg2rad(lat);
        const lng = lngs[i], lngrad = deg2rad(lng);
        const y = Math.cos(latrad);
        const x = Math.sin(latrad) * Math.cos(lngrad);
        const z = Math.sin(latrad) * Math.sin(lngrad);
        positions.push(x, y, z);
        normals.push(x, y, z);
    }

    return create_model_from_data(positions, normals, indices);
}


function create_model_from_data (positions, normals, indices) {
    const position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        positions: positions,
        position_buf: position_buffer,
        normals: normals,
        normal_buf: normal_buffer,
        indices: indices,
        indices_buf: index_buffer,
    };
}


function flatten_model_faces (model) {
    let positions = [], normals = [], indices = [];
    let va = vec3.create(), vb = vec3.create(), vc = vec3.create();
    let U = vec3.create(), V = vec3.create(), n = vec3.create();

    for (let tri = 0; tri < model.indices.length; tri += 3) {
        let a = model.indices[tri + 0];
        let b = model.indices[tri + 1];
        let c = model.indices[tri + 2];
        vec3_from_in_array(va, model.positions, a);
        vec3_from_in_array(vb, model.positions, b);
        vec3_from_in_array(vc, model.positions, c);
        let ia = positions.length / 3;
        positions.push(va[0], va[1], va[2]);
        let ib = positions.length / 3;
        positions.push(vb[0], vb[1], vb[2]);
        let ic = positions.length / 3;
        positions.push(vc[0], vc[1], vc[2]);

        // Normal facing out orthogonally from triangle, same for each vertex.
        vec3.subtract(U, vb, va);
        vec3.subtract(V, vc, va);
        vec3.cross(n, U, V);
        normals.push(n[0], n[1], n[2]);
        normals.push(n[0], n[1], n[2]);
        normals.push(n[0], n[1], n[2]);

        indices.push(ia, ib, ic);
    }

    return create_model_from_data(positions, normals, indices);
}


function animate_scene (delta_time) {
    object_rotation += delta_time;
}


function draw_scene () {
    // Clear the wireframe canvas to it's default transparent.
    $wireframe_canvas.width = $wireframe_canvas.width;

    // Clear the WebGL canvas to a solid color.
    gl.clearColor(0.2, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shader_program);

    // Establish the projection matrix for the camera.
    const field_of_view = deg2rad(45.0);
    const aspect = $gl_canvas.clientWidth / $gl_canvas.clientHeight;
    const z_near = 0.1;
    const z_far = 100.0;
    const projection_matrix = mat4.create();
    mat4.perspective(projection_matrix, field_of_view, aspect, z_near, z_far);
    mat4.translate(projection_matrix, projection_matrix, camera_pos);
    gl.uniformMatrix4fv(uniform_locations.projection_matrix, false, projection_matrix);

    const bbox = [ null, null, null, null ];    // minx, miny, maxx, maxy

    for (const object of scene_objects) {
        const model_view_matrix = mat4.create();
        mat4.translate(model_view_matrix, model_view_matrix, object.pos);
        mat4.rotate(model_view_matrix, model_view_matrix, object_rotation, [0.0, 1.0, 0.0]);
        mat4.rotate(model_view_matrix, model_view_matrix, 0.2, [1.0, 0.0, 0.0]);

        const normal_matrix = mat4.create();
        mat4.invert(normal_matrix, model_view_matrix);
        mat4.transpose(normal_matrix, normal_matrix);

        gl.uniformMatrix4fv(uniform_locations.model_view_matrix, false, model_view_matrix);
        gl.uniformMatrix4fv(uniform_locations.normal_matrix, false, normal_matrix);

        const model = object.model;
        gl.bindBuffer(gl.ARRAY_BUFFER, model.position_buf);
        gl.vertexAttribPointer(attrib_locations.vertex_position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib_locations.vertex_position);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.normal_buf);
        gl.vertexAttribPointer(attrib_locations.vertex_normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attrib_locations.vertex_normal);

        gl.uniform4fv(uniform_locations.color, object.face_color);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indices_buf);
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

        if (wireframe_enabled) {
            const trans = mat4.create();
            mat4.multiply(trans, projection_matrix, model_view_matrix);
            const positions_2d = [];
            vec3.forEach(model.positions, 0, 0, 0, (pos) => {
                const v = vec3.fromValues(pos[0], pos[1], pos[2]);
                vec3.transformMat4(v, v, trans);
                const x = (v[0] *  0.5 + 0.5) * $wireframe_canvas.width;
                const y = (v[1] * -0.5 + 0.5) * $wireframe_canvas.height;
                positions_2d.push(x);
                positions_2d.push(y);
                if (bbox[0] === null || bbox[0] > x)
                    bbox[0] = x;
                if (bbox[1] === null || bbox[1] > y)
                    bbox[1] = y;
                if (bbox[2] === null || bbox[2] < x)
                    bbox[2] = x;
                if (bbox[3] === null || bbox[3] < y)
                    bbox[3] = y;
            });

            wire.save();
            wire.beginPath();
            for (let tri = 0; tri < model.indices.length; tri += 3) {
                const idx1 = model.indices[tri];
                const idx2 = model.indices[tri + 1];
                const idx3 = model.indices[tri + 2];
                wire.moveTo(positions_2d[idx1 * 2], positions_2d[idx1 * 2 + 1]);
                wire.lineTo(positions_2d[idx2 * 2], positions_2d[idx2 * 2 + 1]);
                wire.lineTo(positions_2d[idx3 * 2], positions_2d[idx3 * 2 + 1]);
                wire.closePath();
            }

            wire.strokeStyle = object.wire_color;
            wire.lineWidth = 1;
            wire.stroke();
            wire.restore();
        }
    }

    if (wireframe_enabled) {
        console.log(`bbox: ${bbox[0]}, ${bbox[1]} to ${bbox[2]}, ${bbox[3]}`);
        wire.save();
        wire.beginPath();
        wire.strokeStyle = "rgba(255, 255, 255, 0.25)";
        wire.lineWidth = 1;
        wire.strokeRect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);
        wire.restore();
    }
}


function render_frame (now) {
    now *= 0.001;   // convert to seconds
    const delta_time = last_draw_time === null ? 0 : now - last_draw_time;
    last_draw_time = now;

    animate_scene(delta_time);
    draw_scene();

    if (animation_enabled)
        requestAnimationFrame(render_frame);
}


function create_scene_objects () {
    console.log(`Creating objects`);
    scene_objects.push({
        model: create_model_cube(),
        face_color: [0.1, 0.8, 0.1, 1.0],
        wire_color: "#fff",
        pos: [-5.0, 0.0, -12.0],
    });
    scene_objects.push({
        model: flatten_model_faces(create_model_icosphere(1)),
        face_color: [0.4, 0.2, 0.6, 1.0],   // rebeccapurple
        wire_color: "#ff0",
        pos: [ 0.0, 0.0, -12.0],
    });
    scene_objects.push({
        model: create_model_cylinder_nonsmooth_openend(10, 2.0),
        face_color: [0.0, 0.8, 0.8, 1.0],
        wire_color: "#f0f",
        pos: [+5.0, 0.0, -12.0],
    });
}


// Set everything up.
init_glmatrix_library();
init_canvases();
create_shader_program();
create_scene_objects();
init_enable_wireframe_checkbox();
init_start_stop_animation();

// Set canvas to correct aspect ratio, with device pixel resolution, and trigger redraw on resize.
(new ResizeObserver(update_canvas_sizes)).observe($gl_canvas, {box: "content-box"});

})();
