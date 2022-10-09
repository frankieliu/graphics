const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

const globals = {
    canvas: null,
    gl: null,

    program: [
        {
            a_Position: null,
            u_FragColor: null,
            u_PointSize: null,
            
            // drawing elements
            shapes: [],
        },
    ],

    // ui selections
    select: {
        color: [255, 255, 255],
        size: 5,                  // brush size
        shape: POINT,             // brush shape
        numberOfSegments: 5,      // circle
        opacity: 20,
    },
}

export { POINT, TRIANGLE, CIRCLE, globals };