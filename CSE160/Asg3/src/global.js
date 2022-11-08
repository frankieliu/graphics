const globals = {
    canvas: null,
    gl: null,
    stats: null,
    program: [
        {
            a_Position: null,
            u_FragColor: null,
            u_PointSize: null,
            u_ModelMatrix: null,
            // Assignment asks for gAnimalGlobalRotation
            // Here we just use the same name as in the
            // vertex shader program
            u_GlobalRotateMatrix: null,
            
            // drawing elements
            shapes: [],

            // Triangles for butterfly
            butterfly: [],

            // Texture
            a_UV: null,

            // Camera
            u_ProjectionMatrix: null,
            u_ViewMatrix: null,
        },
    ],

    // ui selections
    select: {
        color: [255, 255, 255],
        size: 4,                  // scale of everything
        opacity: 100,
        globalRotation: 20,       // global rotation angle (0,90)
        animate: false,           // whether or not to animate
    },

    animate: {
        index: 0, 
        animation: [],
        startTime: 0
    }
    
}

export { globals };