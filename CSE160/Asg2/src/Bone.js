import { Matrix4 } from "../lib/cuon-matrix-cse160.js";

class Bone {
    constructor(parent, position, scale, jointLocation, jointAxis) {
        this.parent = parent;
        this.position = position;
        this.scale = scale;
        this.jointLocation = jointLocation
        this.jointAxis = jointAxis;
        this.jointAngle = 0;
    }

    setJointAngle(angle) {
        this.jointAngle = angle;
    }

    computePoseMatrix() {
        // Computes the pose matrix of this bone (i.e. transformation matrix
        // with translation x rotation, but no scaling) and returns it.
        // 
        // The matrix translates by this.position and rotate around this.jointAxis
        // at this.jointLocation by this.jointAngle
        //
        // If this.parent is not null, applies the pose matrix of the parent
        // to get a hierarchical transform.

        var m = this.parent ? this.parent.computePoseMatrix() : new Matrix4();
        m.translate(
            -this.jointLocation[0],
            -this.jointLocation[1],
            -this.jointLocation[2])
            .rotate(
                this.jointAngle,
                this.jointAxis[0],
                this.jointAxis[1],
                this.jointAxis[2])
            .translate(
                this.jointLocation[0],
                this.jointLocation[1],
                this.jointLocation[2])

            .translate(
                this.position[0],
                this.position[1],
                this.position[2]
            )
        return m;
    }

    computeModelMatrix = function () {
        //       Computes the model matrix of this bone (i.e. pose matrix x scaling)
        //       and returns it.
        //       Uses this.computePoseMatrix and this.scale to build the matrix
        var m = new Matrix4();
        var m = this.scale ?
            m.setScale(this.scale[0],
                this.scale[1],
                this.scale[2]) :
            m.setIdentity();
        return this.computePoseMatrix().multiply(m)
    }
}

export { Bone };