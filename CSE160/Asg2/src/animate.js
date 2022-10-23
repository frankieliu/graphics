import { renderScene } from "./render.js";
import { globals } from "./global.js";

function setupStats() {
  // FPS Monitor, check out https://github.com/mrdoob/stats.js/ for more info
  globals.stats = new Stats();

  // move panel to right side instead of left
  // cuz our canvas will be covered
  globals.stats.dom.style.left = "auto";
  globals.stats.dom.style.right = "0";
  globals.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(globals.stats.dom);
}

/**
 * RENDER LOOP
 */
function tick() {
  globals.stats.begin();
  globals.animate.animation[globals.animate.index].updateAnimationAngles();
  renderScene();
  globals.stats.end();
  if(globals.select.animate) {
    requestAnimationFrame(tick);
  }
}

class Animation {
    constructor(shape) {
        this.shape = shape; 
        this.constraints = shape.parameters;
    }

    updateAnimationAngles() {
        var t = (performance.now() - globals.animate.startTime)/1000.;

        var bone = this.constraints.leftHipRotation;
        bone.current = 0
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightHipRotation;
        bone.current = 0
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.leftHipAngle;
        var alpha = Math.sin(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightHipAngle;
        var alpha = Math.cos(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.leftKneeAngle;
        var alpha = Math.sin(2*t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightKneeAngle;
        var alpha = Math.cos(2*t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.leftAnkleAngle;
        bone.current = 0;
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightAnkleAngle;
        bone.current = 0;
        this.shape.setJointAngle(
            bone.index, bone.current);
    }
}

class Animation2 {
    constructor(shape) {
        this.shape = shape; 
        this.constraints = shape.parameters;
    }

    updateAnimationAngles() {
        var t = (performance.now() - globals.animate.startTime)/1000.;

        var bone = this.constraints.leftHipRotation;
        var alpha = Math.sin(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightHipRotation;
        var alpha = -Math.sin(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.leftHipAngle;
        bone.current = 0;
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightHipAngle;
        bone.current = 0;
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.leftKneeAngle;
        var alpha = Math.sin(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightKneeAngle;
        var alpha = Math.sin(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.leftAnkleAngle;
        var alpha = Math.cos(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
        
        var bone = this.constraints.rightAnkleAngle;
        var alpha = Math.cos(t)*0.5+0.5;
        bone.current = bone.min + alpha * (bone.max - bone.min);
        this.shape.setJointAngle(
            bone.index, bone.current);
    }
}

export { setupStats, tick, Animation, Animation2 };