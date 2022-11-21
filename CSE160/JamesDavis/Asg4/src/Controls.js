import { Matrix4, Vector3 } from "../lib/cuon-matrix.js";

class Controls {
  constructor(gl, rotation, callback,  lerpRotation = [0, 0, 0]) {
    this.canvas = gl.canvas;
    this.rotation = rotation;   // Vector3 being manipulated
    this.callback = callback;   // Callback when rotation is changed

    this.mouse = new Vector3(); // will use as vector2
    this.lerpRotation = new Vector3(lerpRotation);
    this.dragging = false;

    this.setHandlers();
  }

  setHandlers() {
    this.canvas.onmousedown = (e) => {
      this.dragging = true;

      let x = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
      let y = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

      this.mouse.elements.set([x, y, 0]);
      // -1, 1  on x
      // -1, 1  on y
    };

    this.canvas.onmouseup = this.canvas.onmouseleave = (e) => {
      this.dragging = false;
    };

    this.canvas.onmousemove = (e) => {
      let x = (e.clientX / e.target.clientWidth) * 2.0 - 1.0;
      let y = (-e.clientY / e.target.clientHeight) * 2.0 + 1.0;

      if (this.dragging) {
        let dx = x - this.mouse.elements[0];
        let dy = y - this.mouse.elements[1];

        this.lerpRotation.elements[0] -= dx * 180;
        this.lerpRotation.elements[1] += dy * 180;

        this.mouse.elements.set([x, y, 0]);
      }
    };
  }
  update() {
    // linearly interpolate rotation of object towards desired rotation
    // results in smooth rotation of camera via mouse by lerping 20% each tick
    let x =
      0.8 * this.rotation.elements[0] + 0.2 * this.lerpRotation.elements[0];

    let y =
      0.8 * this.rotation.elements[1] + 0.2 * this.lerpRotation.elements[1];

    this.rotation.elements.set([x, y, 0]);
    this.callback();
  }
}

export { Controls };