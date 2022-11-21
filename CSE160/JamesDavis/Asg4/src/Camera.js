import { Matrix4, Vector3 } from "../lib/cuon-matrix.js";
import { checkCollision } from "./globals.js";

class Camera {

    constructor(
        eye = [3,0.8,3],
        at = [2,0.8,2],
        viewMatrix = new Matrix4(),
        projectionMatrix = new Matrix4(),
        ) {
        this.fov = 60.0;

        this.viewMatrix = viewMatrix;
        this.projectionMatrix = projectionMatrix;

        // Set this initial view of animal
        // Also removeBlock in global.js
        this.eye = new Vector3(eye);
        this.at = new Vector3(at);
        this.up = new Vector3([0,1,0]);
        this.calculateViewProjection();

        // f is normalized at - eye
        this.f = new Vector3();
        this.setfAtEye();
        this.f0 = new Vector3(this.f);

        this.collision = new Vector3();
        this.hit = null;
        this.df = 1;
        this.dangle = 90;

        this.rotation = new Vector3();

        this.aspect = window.innerWidth / window.innerHeight;
        window.addEventListener("resize", (e) => {
            this.aspect = window.innerWidth / window.innerHeight;
            this.calculateViewProjection();
        });
    }

    calculateViewProjection() {
        this.viewMatrix.setLookAt(
            ...this.eye.elements,
            ...this.at.elements,
            ...this.up.elements
        );
        this.projectionMatrix.setPerspective(this.fov, this.aspect, 0.01, 10);
    }

    info() {
        console.log("eye: " + this.eye.elements);
        console.log("at: " + this.at.elements);
    }

    setfAtEye() {
        return this.f.set(this.at).sub(this.eye);
    }

    checkHit() {
        // should arrive back one unit vector away from this.eye
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
            this.calculateViewProjection();
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
            this.calculateViewProjection();
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
        this.calculateViewProjection();
    } 
    
    moveRight() {
        this.setfAtEye().normalize();
        var s = Vector3.cross(this.f, this.up);
        s.normalize().mul(this.df);
        this.at.add(s);
        this.eye.add(s);
        this.calculateViewProjection();
    }
  
    setfAtEye() {
        return this.f.set(this.at).sub(this.eye).normalize();
    }

    panLeft() {
        this.setfAtEye();
        var r = new Matrix4();
        r.setRotate(this.dangle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(this.f));
        this.calculateViewProjection();
    }
    
    panRight() {
        this.setfAtEye();
        var r = new Matrix4();
        r.setRotate(-this.dangle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(this.f));
        this.calculateViewProjection();
    }
    
    pan(dangle) {
        this.setfAtEye();
        var r = new Matrix4();
        r.setRotate(dangle, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(this.f));
    }
    
    panRotation = () => {
        this.setfAtEye();
        const eyeAt = new Vector3();
        const [rx, ry, rz] = this.rotation.elements;

        // Only get the xz direction
        eyeAt.set(this.eye).sub(this.at);
        // console.log(eyeAt);
        eyeAt.elements[1] = 0;
        eyeAt.normalize();

        var r = new Matrix4();
        r.rotate(rx, ...this.up.elements).rotate(ry, 1,0,0);

        this.at.set(this.eye);
        this.at.add(r.multiplyVector3(this.f0));
        this.calculateViewProjection();
    }
}

export { Camera };