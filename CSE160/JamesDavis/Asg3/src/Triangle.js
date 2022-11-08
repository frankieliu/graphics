import { gl, a_Position, u_FragColor, a_UV } from "./globals.js";

class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0, 0, 0];
        this.color = [1, 1, 1, 1];
        this.size = 5;
        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.log('Cannot create buffer');
            return -1;
        }
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniform4f(u_Size, 4.0);

        // Draw
        var d = this.size / 200.0; // delta
        drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);

    }

}


function drawTriangle(vertices) {

    var n = 3; // number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3D(vertices) {
    var n = vertices.length/3; // number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3DUV(vertices) {
    var n = vertices.length/5; // number of vertices

    // ---
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    // Assign the buffer object to a_Posiiton variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // ---
    // Two buffer version (previously had uv as a separate parameter)
    // 
    // 1. Create a buffer object for UV
    // var uvBuffer = gl.createBuffer();
    // if (!uvBuffer) {
    //    console.log('Failed to create the buffer object');
    //    return -1;
    // }
    // 2. Bind the buffer object to target
    // gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    // 3. Write data into the buffer object
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_UV variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);

    // Enable the assignment to a_UV variable
    gl.enableVertexAttribArray(a_UV);

    // ---
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);

}

export { drawTriangle3D, drawTriangle3DUV };