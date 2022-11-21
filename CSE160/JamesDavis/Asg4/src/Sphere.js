import { Matrix4 } from '../lib/cuon-matrix.js';
import { gl, u_FragColor, u_ModelMatrix, u_WhichTexture,
    sphereVertices, u_NormalMatrix,
 } from './globals.js';
import { drawTriangle3DUVNormal, } from './Triangle.js';

class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1,1,1,1];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2; // Solid color
    }

    setColor() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    }

    renderUVNormal() {
        this.setColor();
        
        // Pass the texture number
        gl.uniform1i(u_WhichTexture, this.textureNum);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Pass the matrix to u_NormalMatrix attribute
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
    
        drawTriangle3DUVNormal(sphereVertices);
    }

    render() {
        this.renderUVNormal();
    }

}

export { Sphere };