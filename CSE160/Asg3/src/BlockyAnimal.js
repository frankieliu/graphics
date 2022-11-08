import { globals } from "./global.js";
import { Cube } from "./Cube.js";
import { Matrix4 } from "../lib/cuon-matrix-cse160.js";
import { Bone } from "./Bone.js";

class BlockyAnimal {

    constructor() {
        this.prog = globals.program[0];
        this.scale = 0.3;
        this.parameters = {
            leftHipRotation: {
                index: 0, 
                min: -90,
                max: 90,
                current: 0,
                rgb: [103, 97, 161],
            },
            leftHipAngle: {
                index: 1,
                min: -160,
                max: 20,
                current: 0,
                rgb: [103, 97, 161],
            },
            leftKneeAngle: {
                index: 2,
                min: 0,
                max: 160,
                current: 0,
                rgb: [103, 97, 161],
            },
            leftAnkleAngle: {
                index: 3,
                min: -30,
                max: 90,
                current: 0,
                rgb: [154, 25, 209],
            },
            rightHipRotation: {
                index: 4,
                min: -90,
                max: 90,
                current: 0,
                rgb: [63, 97, 161],
            },
            rightHipAngle: {
                index: 5,
                min: -160,
                max: 20,
                current: 0,
                rgb: [63, 97, 161],
            },
            rightKneeAngle: {
                index: 6,
                min: 0,
                max: 160,
                current: 0,
                rgb: [63, 97, 161],
            },
            rightAnkleAngle: {
                index: 7,
                min: -30,
                max: 90,
                current: 0,
                rgb: [237, 14, 18],
            },
        };
        // Need to assign the above before calling these 
        this.bones = this.createBones();
        this.cubes = this.createCubes();
    }
    
    setJointAngle(boneIndex, angle) {
        this.bones[boneIndex].setJointAngle(angle);
    }
    
    createBones() {
        // Bone(parent, position, scale, jointLocation, jointAxis) {
        var hip = new Bone(null, [0, 1.5, 0], [0.5, 0.3, 0.2], [0, 0, 0], [0, 1, 0]);

        var leftThigh = new Bone(hip, [0.5, -1.1, 0.1], [0.1, 0.7, 0.1], [0, 0.7, 0], [1, 0, 0]);
        var leftShin = new Bone(leftThigh, [0, -1.5, 0], [0.1, 0.7, 0.1], [0, 0.7, 0], [1, 0, 0]);
        var leftFoot = new Bone(leftShin, [0, -0.9, 0.2], [0.15, 0.1, 0.3], [0, 0.9, 0], [1, 0, 0]);
       
        var rightHip = new Bone(null, [-1.2, 1.5, 0], [0.5, 0.3, 0.2], [1.2, 0, 0], [0, 1, 0]);

        var rightThigh = new Bone(rightHip, [-0.6, -1.1, 0.1], [0.1, 0.7, 0.1], [0, 0.7, 0], [1, 0, 0]);
        var rightShin = new Bone(rightThigh, [0, -1.5, 0], [0.1, 0.7, 0.1], [0, 0.7, 0], [1, 0, 0]);
        var rightFoot = new Bone(rightShin, [0, -0.9, 0.2], [0.15, 0.1, 0.3], [0, 0.9, 0], [1, 0, 0]);
        return [hip, leftThigh, leftShin, leftFoot, rightHip, rightThigh, rightShin, rightFoot];
    }

    createCubes() {
        var cubes = [];
        for (var i = 0; i < this.bones.length; i++) {
            var cube = new Cube();
            cube.rgb = [
                Math.random(),
                Math.random(),
                Math.random()];
            cubes.push(cube);
        }
        const par = this.parameters;
        for (const key in par) {
            cubes[par[key].index].rgb = par[key].rgb.map(x => x/255.);
        }
        return cubes;
    }

    render() {

        for (var i = 0; i < this.bones.length; ++i) {
            var boneModel = this.bones[i].computeModelMatrix();
            this.cubes[i].drawCube(boneModel);
        }

    }

}

/*
Task4.prototype.dragCamera = function (dy) {
    this.cameraAngle = Math.min(Math.max(this.cameraAngle - dy * 0.5, -90), 90);
}
*/    

export { BlockyAnimal };