import { vertices } from "./vertices.js";
import { points } from "./points.js";
import { colors } from "./colors.js";

// Butterfly was created from blue-morpho-butterfly-1-400x400.jpg
// https://www.rainforest-alliance.org/species/blue-morpho-butterfly/
//
// Using method from 
// http://www.degeneratestate.org/posts/2017/May/24/images-to-triangles/
//
// 1. Selecting points
//    a. Basically do a rank entropy filter on the image
//       This means selecting (circular) regions around the picture
//       Then calculating the histogram
//       Then assigning p log(p) to determine how many bits require to describe
//        the region
//    b. Then from this pick the highest entropy point
//    c. Do a gaussian blur of the rank entropy filtered image
//    d. Pick the next highest point, until you have accumulated enough points
// 2. Selecting triangles
//    Basically Delaunay triangularization to get set of triangles
// 3. Get color for each triangle

const butterfly = {
    vertices: vertices,
    points: points,
    colors: colors,
}

export { butterfly };