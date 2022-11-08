import { Matrix4 } from '../lib/cuon-matrix.js';
import { gl, u_FragColor, u_ModelMatrix } from './globals.js';
import { drawTriangle3D } from './Triangle.js';

class Cube {
    constructor() {
        this.type = 'cube';
        // this.positoin = [0,0,0];
        this.color = [1,1,1,1];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
    }
    
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // Pass the color of a point to u_fragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        // drawTriangle3D([0,0,-1, 1,1,-1, 1,0,-1]);
        // drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        // drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
        // drawTriangle3D([0,0,-1, 0,1,-1, 1,1,-1]);

        // Pass the color of a point to u_FragColor uniform variable
        // gl.uniform4f(u_FragColor, rgba[0]*.9, rbga[1]*.9, rgba[2]*.9, rbga[3]);

        // Top of cube
        drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
        drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);

    }

}

export { Cube };