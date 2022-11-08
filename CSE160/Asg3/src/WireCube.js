const WireCubePositions = [
     1,  1,  1,
     1,  1, -1,
     1, -1,  1,
    -1,  1,  1,
    -1, -1,  1,
    -1,  1, -1,
     1, -1, -1,
    -1, -1, -1
];

/*              (-1,-1,1) 4
                 +---------+ (-1,1,1) 3
              /  |         |
           /     |         |
        /    (-1,-1,-1) 7  |
     /           +---------+ (-1,1,-1) 5 
     +---------+ (1,1,1) 0
    (1,-1,1) 2 |
     |         |
     |         |
     +---------+ (1,1,-1) 1         
   (1,-1,-1) 6


*/
const WireCubeIndices = [
    0, 1, 6,
    0, 2, 6,
    0, 2, 4, 
    0, 3, 4,
    0, 1, 5,
    0, 3, 5,
    7, 5, 3,
    7, 4, 3,
    7, 6, 1,
    7, 5, 1,
    7, 6, 2,
    7, 4, 2,
];

var SpherePositions = [];
var SphereNormals = [];
var SphereIndices = [];
var SphereTriIndices = [];

(function() {

    var NumPhiBands = 30;
    var NumThetaBands = NumPhiBands/2;

    for (var i = 0; i <= NumThetaBands; ++i) {
        for (var j = 0; j < NumPhiBands; ++j) {
            var theta = (i/NumThetaBands - 0.5)*Math.PI;
            var phi = 2*Math.PI*j/NumPhiBands

            var x = Math.cos(phi)*Math.cos(theta);
            var y = Math.sin(theta);
            var z = Math.sin(phi)*Math.cos(theta);

            SpherePositions.push(x);
            SpherePositions.push(y);
            SpherePositions.push(z);
            SphereNormals.push(x);
            SphereNormals.push(y);
            SphereNormals.push(z);

            if (i < NumThetaBands) {
                var i0 = i, i1 = i + 1;
                var j0 = j, j1 = (j + 1) % NumPhiBands;
                SphereIndices.push(i0*NumPhiBands + j0);
                SphereIndices.push(i0*NumPhiBands + j1);
                SphereIndices.push(i1*NumPhiBands + j0);
                SphereIndices.push(i0*NumPhiBands + j0);
                SphereTriIndices.push(i0*NumPhiBands + j0);
                SphereTriIndices.push(i0*NumPhiBands + j1);
                SphereTriIndices.push(i1*NumPhiBands + j1);
                SphereTriIndices.push(i0*NumPhiBands + j0);
                SphereTriIndices.push(i1*NumPhiBands + j1);
                SphereTriIndices.push(i1*NumPhiBands + j0);
            }
        }
    }
})();

export { WireCubePositions, WireCubeIndices,
SpherePositions, SphereIndices, SphereTriIndices, SphereNormals };