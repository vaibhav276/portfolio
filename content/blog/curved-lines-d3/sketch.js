import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const svg = d3.create("svg")
  .attr("width", 200)
  .attr("height", 160)
  .attr("viewBox", [0, 0, 200, 160])
  .attr("style", "max-width: 100%; height: auto; background-color: #eeeeee");

svg.append("path")
    .attr("d", d3.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(d3.curveBumpX)
        ([{
            x: 50,
            y: 120
        }, {
            x: 140,
            y: 40
        }])
    )
    .attr("fill", "none")
    .attr("stroke", "#000");

sketch.append(svg.node());