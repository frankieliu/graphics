import { Matrix4 } from '../lib/cuon-matrix.js';
import { gl, u_FragColor, u_ModelMatrix, u_whichTexture,
    cubeVertices, cubeVerticesUV,
    cubeVerticesUVNormal } from './globals.js';
import { drawTriangle3D, drawTriangle3DUV,
    drawTriangle3DUVNormal, } from './Triangle.js';

class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1,1,1,1];
        this.matrix = new Matrix4();
        this.textureNum = -2; // Solid color
    }
    
    renderUVSlow() {
        this.setColor()
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube z=0
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        // Back of cube z=1
        drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top of cube y=1
        drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Right of cube x=1
        drawTriangle3DUV([1,0,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1,0,0, 1,0,1, 1,1,1], [0,0, 0,1, 1,1]);

        // Left of cube x=0
        drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [0,0, 0,1, 1,1]);
        
        // Bottom of cube y=0
        drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1]);
    }

    setColor() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    }

    render3D() {
        this.setColor();

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3D(cubeVertices);
    }
    
    renderUV() {
        this.setColor();
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUV(cubeVerticesUV);
    }


    renderUVNormal() {
        this.setColor();
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3DUVNormal(cubeVerticesUVNormal);
    }

    render() {
        this.renderUVNormal();
    }

}

export { Cube };