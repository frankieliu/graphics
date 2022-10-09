const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

const globals = {
    canvas: null,
    gl: null,

    a_Position: null,

    // drawing elements
    shapes: [],

    // shader
    u_FragColor: null,
    selectedColor: [1.0, 1.0, 1.0],

    // brush size
    u_PointSize: null,
    selectedSize: 5,

    // shape
    selectedShape: POINT,
    
    // circle
    selectedNumberOfSegments: 5,
}

export { POINT, TRIANGLE, CIRCLE, globals };