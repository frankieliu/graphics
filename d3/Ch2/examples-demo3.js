function makeDemo3() {
    d3.tsv("examples-multiple.tsv")
        .then( function(data) {
            // select svg element to draw on
            var svg = d3.select("svg");

            // query the size of the svg element
            // NOTE that attr is both a getter and a setter
            var pxX = svg.attr("width");
            var pxY = svg.attr("height");

            // nice extends the range to the nearest round
            // extent() takes an array of objects and return the
            // greatest and smallest values as a two-element
            // array, must also supply an accessor to get
            // the values from the objects 
            var makeScale = function(accessor, range) {
                return d3.scaleLinear()
                    .domain(d3.extent(data, accessor))
                    .range(range).nice();
            }

            var scX = makeScale(d=>d["x"], [0, pxX]);
            var scY1 = makeScale(d=>d["y1"], [pxY, 0]);
            var scY2 = makeScale(d=>d["y2"], [pxY, 0]);

            // functions that take a selection as their
            // first argument then add elements to it are
            // known as "components"
            var drawData = function(g, accessor, curve) {
                // draw circles
                g.selectAll("circle")
                    .data(data).enter()
                    .append("circle")
                    .attr("r",5)
                    .attr("cx", d=>scX(d['x']))
                    .attr("cy", d=>accessor);
                // draw lines
                // line() factory returns a function obj
                // which given data produces a string
                // suitable for the d attribute of the
                // SVG <path> element
                // The line generator requires accessor
                // functions to pick out info from the
                // data objects
                var lnMkr = d3.line().curve(curve)
                    .x(d=>scX(d["x"])).y(accessor);
                g.append("path").attr("fill", "none")
                    .attr("d", lnMkr(data));
            }

            var g1 = svg.append("g");
            var g2 = svg.append("g");
            
            drawData(g1, d=>scY1(d["y"]), d3.curveStep);
            drawData(g2, d=>scY[d["y2"]], d3.curveNatural);

            g1.selectAll("circle").attr("fill", "green");
            g1.selectAll("path").attr("stroke", "cyan");

            g2.selectAll("circle").attr("fill", "blue");
            g2.selectAll("path").attr("stroke", "red");

            var axMkr = d3.axisRight(scY1);
            axMkr( svg.append("g") );
            axMkr = d3.axisLeft(scY2);
            svg.append("g")
                .attr("transform", "translate("+pxX+",0)")
                .call(axMkr);
            
            svg.append("g").call(d3.axisTop(scX)
                .attr("transform", "translate(0,"+pxY+")");
        }
        );
}