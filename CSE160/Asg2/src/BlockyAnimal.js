import { globals } from "./global.js";
import { Cube } from "./Cube.js";
import { Matrix4 } from "../lib/cuon-matrix-cse160.js";

class BlockyAnimal {
    constructor() {
        this.cube = new Cube();
        this.cube.rgb = [1, 0, 0];
        this.prog = globals.program[0];
    }

    render() {
        globals.gl.clear(globals.gl.COLOR_BUFFER_BIT);
        this.cube.matrix.translate(-0.25, -0.5, 0);
        this.cube.matrix.scale(0.5, 1, 0.5);

        // Create rotation Matrix
        const rotMatrix = new Matrix4().rotate(
            globals.select.globalRotation, 0, 1, 0);
       
        // Load rotation Matrix to u_GlobalRotateMatrix
        globals.gl.uniformMatrix4fv(this.prog.u_GlobalRotateMatrix,
            false, rotMatrix.elements);
        
        this.cube.render();
    }
}

export { BlockyAnimal };