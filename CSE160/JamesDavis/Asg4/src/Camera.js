import { Matrix4, Vector3 } from "../lib/cuon-matrix.js";
import { checkCollision } from "./globals.js";

class Camera {
    constructor() {
        this.fov = 60.0;

        // this.eye = new Vector3([0,0,0]);
        // this.at = new Vector3([0,0,-1]);

        // Set this initial view of animal
        // Also removeBlock in global.js
        this.eye = new Vector3([-2,0,-2]);
        this.at = new Vector3([-1,0,-1]);

        this.up = new Vector3([0,1,0]);
        this.f = new Vector3();
        this.collision = new Vector3();
        this.hit = null;
        this.df = 1;
        this.dangle = 90;
    }

    info() {
        console.log("eye: " + this.eye.elements);
        console.log("at: " + this.at.elements);
    }

    checkHit() {
        this.collision.set(this.eye).add(this.f);
        // console.log(this.collision.elements[0], this.collision.elements[2]);
        this.hit = checkCollision(this.collision.elements[0],this.collision.elements[2]);
    }

    moveForward() {
        this.setfAtEye().normalize().mul(this.df);
        this.checkHit(); 
        if (this.hit === false) { 
            this.at.add(this.f);
            this.eye.add(this.f);
        } else {
            console.log(this.hit);
        }
    }

    moveBackwards() {
        this.setfAtEye().normalize().mul(-this.df);
        this.checkHit();
        if (this.hit === false) {
            this.at.add(this.f);
            this.eye.add(this.f);
        } else {
            console.log(this.hit);
        }
    }

    moveLeft() {
        this.setfAtEye().normalize();
        var s = Vector3.cross(this.up, this.f);
        s.normalize().mul(this.df);
        this.at.add(s);
        this.eye.add(s);
    } 
    
    moveRight() {
        this.setfAtEye().normalize();
        var s = Vector3.cross(this.f, this.up);
        s.normalize().mul(this.df);
        this.at.add(s);
        this.eye.add(s);
    }
  
    setfAtEye() {
        return this.f.set(this.at).sub(this.eye);
    }

    panLeft() {
        this.setfAtEye();
        var r = new Matrix4();
        r.setRotate(this.dangle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(this.f));
    }
    
    panRight() {
        this.setfAtEye();
        var r = new Matrix4();
        r.setRotate(-this.dangle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(this.f));
    }
    
    pan(dangle) {
        this.setfAtEye();
        var r = new Matrix4();
        r.setRotate(dangle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(this.f));
    }
}

export { Camera };