canvas.onmousemove = mousemove;
canvas.onmousedown = mousedown;
canvas.onmouseup = mouseup;

var prevXPos = null;
function mousemove(ev) {
    if (isMouseDown) {
        var diff = (ev.clientX - prevXPos) / ev.target.clientWidth;
        g_camera.pan(90 * diff);
    }
}
var isMouseDown = false;
function mousedown(ev) {
    if (!isMouseDown) {
        prevXPos = ev.clientX;
        isMouseDown = true;
    }
}
function mouseup(ev) {
    isMouseDown = false;
}