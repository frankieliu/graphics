# hierarchical modeling

cs354-13.pdf
cs354-15.pdf - animation and skinning

# skeleton - transformations

csci480-21w
a3_skel

This is much better as a tutorial with skeleton code
than the ucsc course.

## skeletons
http://127.0.0.1:5500/graphics/csci480-21w/a3_skel/a3.html
https://github.com/csci480-21w
https://facultyweb.cs.wwu.edu/~wehrwes/courses/csci480_21w/a3/

# mmd loader
https://github.com/mrdoob/three.js/blob/master/examples/jsm/animation/MMDPhysics.js

three.js mmd loader

# three js webgl_animation_skinning

https://threejs.org/examples/#webgl_animation_skinning_ik

Allows you to move object and the other bones move as well

# maximo models
https://www.mixamo.com/#/?page=1&type=Motion%2CMotionPack
FBX format for downloading model

# three js webgl_animation_skinning_blending
https://threejs.org/examples/#webgl_animation_skinning_blending

# mmd animation helper
https://threejs.org/docs/#examples/en/animations/MMDAnimationHelper

# Implement skeletal animation
interpolation between two bones
https://veeenu.github.io/blog/implementing-skeletal-animation/

```javascript
keyframeA = keyframe[ integerPartOf(t) % #keyframes ]
keyframeB = keyframe[ integerPartOf(t) + 1 % #keyframes ]
lerpFact = fractionalPartOf(t)

boneResults = []

for(bone in bones) {

  boneA = keyframeA[ bone ]
  boneB = keyframeB[ bone ]

  translation = lerp(boneA.position, boneB.position, lerpFact)
  quaternion  = slerp(boneA.rotation, boneB.rotation, lerpFact)
  localMatrix = calculateMatrix(quaternion, translation)

  if(bone is root)
    boneResults[bone].worldMatrix = localMatrix
  else
    boneResults[bone].worldMatrix = boneResults[bone.parent].worldMatrix * localMatrix

  boneResults[bone].offsetMatrix = bone.inverseBindpose * boneResults[bone].worldMatrix
}
```

# walking figure from nik lever

https://codepen.io/nik-lever/pen/xMGwqq

# walking animation

smashing magazine

https://www.smashingmagazine.com/2017/09/animation-interaction-techniques-webgl/

Great use of cos and sin to create animation cycle

# mmd on html5
https://playcanvas.com/project/367166/overview/mmd-on-html5

# mmd multiply bone
https://learnmmd.com/http:/learnmmd.com/multiply-of-bone-frame-position-angle/

# three js examples
https://stemkoski.github.io/Three.js/

# collision detection
https://github.com/WebMaestroFr/collisions-detection-three-js/tree/master/js

# open gl programming guide
http://glprogramming.com/red/chapter03.html#name8
Viewing
Combine matrix transformations

# stylized wireframing
https://github.com/mattdesl/webgl-wireframes
https://github.com/mattdesl/webgl-wireframes/blob/gh-pages/screenshots/banner.jpg
https://github.com/mattdesl/webgl-wireframes

