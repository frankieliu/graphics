# Course

[course](https://canvas.ucsc.edu/courses/56622)

# Videos

[playlist](https://www.youtube.com/watch?v=dZOy1n0d8r0&list=PLbyTU_tFIkcMK5FiV6btXxHQAy15p0j7X)

# import

1. must have type="module" on <script>
2. must include .js extension on imports

[import](https://tutorials.yax.com/articles/javascript/import/index.html#:~:text=The%20import%20statement%20makes%20modular,single%20program%20in%20one%20file.)

[outside module](https://stackoverflow.com/questions/58384179/syntaxerror-cannot-use-import-statement-outside-a-module)

# vscode settings

[Default browser](https://stackoverflow.com/questions/49289233/how-to-change-default-browser-with-vs-codes-open-with-live-server)

1. liveserver config
   Go to Files > Preferences > Settings
  
   From Default User settings choose LiveServer Config
   Open settings.json and add

   "liveServer.settings.CustomBrowser": "chrome"

# default browser

Start/Default Apps/Web Browser -> chrome

# default PDF

Right Click on PDF/Properties/Change -> chrome

# git

1. Download windows client
2. Use mingw

## existing repository

1. git clone <repository>
2. add files from vscode to directory
3. git add, commit, push
4. need to set email and user git config --global user.email | user.name

# python

miniconda
pandas
matplotlib
scikit-image
conda install -c conda-forge jupyterlab
ipython

## json dump
[json dump](https://www.geeksforgeeks.org/reading-and-writing-json-to-a-file-in-python/)

[json](https://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript)

# div color

[div color](https://stackoverflow.com/questions/11067516/js-setting-div-background-color-using-a-variable)

[html colors](https://www.w3schools.com/html/html_colors_rgb.asp)

# side by side div

[side by side](https://coder-coder.com/display-divs-side-by-side/)

# click

Detecting a click and move together

(ev) => { if(ev.buttons == 1) {do();}}

[mouse move](https://stackoverflow.com/questions/14538743/what-to-do-if-mousemove-and-click-events-fire-simultaneously)

[drag](https://stackoverflow.com/questions/18544890/onchange-event-on-input-type-range-is-not-triggering-in-firefox-while-dragging)

[drag](https://www.w3schools.com/JSREF/event_ondrag.asp)

[drag](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations)

# img changing src

[change](https://www.delftstack.com/howto/javascript/change-image-src-javascript/#:~:text=To%20change%20the%20source%20or%20src%20of%20an%20image%2C%20you,image%20using%20the%20src%20property.)

## img src validation
How to validate images that are loaded

[validatio](https://bobbyhadz.com/blog/javascript-check-if-img-src-is-valid#:~:text=To%20check%20if%20an%20img,Alternatively%2C%20hide%20the%20image.)

# image overlap

Use relative to position on top on one another

[overlap](http://jsfiddle.net/s1xxeza9/)

[multiple layers](https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers)

[stack canvas](https://stackoverflow.com/questions/10037649/how-can-i-stack-two-same-sized-canvas-on-top-of-each-other)

## Opacity

[opacity](https://www.w3schools.com/css/css_image_transparency.asp)

## webgl and canvas 2d

[webgl and canvas](https://geoffrichards.co.uk/blog/2022/01/webgl-wireframe/wireframe.html)

# canvas images
Images have to be drawn into a canvas element

[drawImage](https://stackoverflow.com/questions/6011378/how-to-add-image-to-canvas
)

[wireframe](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images)

# canvas changing program

[useProgram](https://www.khronos.org/opengl/wiki/GLSL_:_common_mistakes)

# images to triangles

[entropy rank](http://www.degeneratestate.org/posts/2017/May/24/images-to-triangles/)

[github](https://github.com/ijmbarr/images-to-triangles)

# js

You can't really export global variables, you can export const pointers, so then you can modify the thing pointed by the references, but the pointer itself must
be a const

[global variables](https://stackoverflow.com/questions/66683758/import-js-file-to-make-its-variables-part-of-the-global-scope-of-file-that-is-im)

[global variable](https://stackoverflow.com/questions/52427167/access-a-global-variable-in-main-file-with-an-imported-javascript-function-es6)

# multiple shaders

[30](https://github.com/davidwparker/programmingtil-webgl)
[video](https://www.youtube.com/watch?v=46Gt9Q2flDQ)
[so](https://stackoverflow.com/questions/29355582/webgl-multiple-shaders#:~:text=So%2C%20if%20you%20want%20to,)%20)%20and%20dispatch%20another%20call.)

# webgl textures
[webgl2fund](https://webgl2fundamentals.org/webgl/lessons/webgl-2d-drawimage.html)
[img proc](https://webglfundamentals.org/webgl/lessons/webgl-image-processing.html)
[drawing images](https://jameshfisher.com/2017/10/06/webgl-loading-an-image/)
[github](https://github.com/gfxfundamentals/webgl2-fundamentals)

# webgl bindbuffer
[bindbuffer](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer)

[buffer](http://learnwebgl.brown37.net/rendering/buffer_object_primer.html)

# butterfly 400x400
[butterfly](https://www.rainforest-alliance.org/wp-content/uploads/2021/06/blue-morpho-butterfly-1-400x400.jpg.webp)

# canvas background image
[background](https://stackoverflow.com/questions/14012768/html5-canvas-background-image)

# anaconda m2-base shell commands
conda install m2-base
conda search m2-*
conda install m2-zip

windows search: anaconda prompt (miniconda3)

(base) c:\Users\adam> bash    # Yay you can have a bash shell

## location of / /c/Users/adam/miniconda3/Library

/c/Users/adam/miniconda3/Library/usr/bin/bash.exe

## set -o vi

So you can use vi in the command line

# adding wireframe
https://www.mattdesl.com/
Need to read an article
net November 2017 — Stylized Wireframe Rendering in WebGL

# chinedufn skeleton animation
https://github.com/chinedufn/skeletal-animation-system

# bones in threejs
https://threejs.org/docs/#api/en/objects/Skeleton

# skinning in webgl
https://webglfundamentals.org/webgl/lessons/webgl-skinning.html

# web-gl game development
Skinning and good discussion
http://what-when-how.com/Tutorial/topic-666frc6uv/WebGL-Game-Development-298.html

# texas cs354
Good lecture on on bones
https://www.cs.utexas.edu/~theshark/courses/cs354/lectures/cs354-15.pdf

Refers to this
https://www.gamedev.net/articles/programming/graphics/skinned-mesh-animation-using-matrices-r3577/

But hard to understand

# three js animation
https://discoverthreejs.com/book/first-steps/animation-system/

Birds - stork parrot flamingo

# Fun with webgl
https://www.youtube.com/watch?v=ZkHHjNec3l0&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF&index=9

SketchPunkLabs

# three.js walking
https://codepen.io/nik-lever/pen/xMGwqq

# wireframe overlay with canvas 2d
https://geoffrichards.co.uk/blog/2022/01/webgl-wireframe/

# interpolating linear and spherical animation
https://veeenu.github.io/blog/implementing-skeletal-animation/

# understanding different loaders javascript

# code quick navigation
Ctrl-P (Open)
You can remove things that you don't need anymore

Ctrl-Tab (Only open )