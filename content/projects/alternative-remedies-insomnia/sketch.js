import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Declare the chart dimensions and margins.
const width = 1200;
const height = 1400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

const data = await d3.dsv(";", "data/data.csv");
const rolledUp = d3.rollup(data, D => D.length, d => d.remedy, d => d.problem_area);
var rolledUpFlat = d3.map(rolledUp, d => { 
  return {
  key: d[0], 
  value: d3.map(d[1], e => Array(e[1]).fill(e[0])).flat()
} });

const problem_areas = new Set(d3.map(data, d => d.problem_area));
console.log("data", data);
console.log("rolledUp", rolledUp);
console.log("rolledUpFlat", rolledUpFlat);
console.log("problem_areas", problem_areas);

const svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto;");

const y = d3.scaleBand()
            .domain(rolledUpFlat.map(d => d.key))
            .range([marginTop, height - marginBottom]);

const color = d3.scaleOrdinal()
                .domain(problem_areas)
                .range(["steelblue", "yellow", "green", "red", "blue", "black"]);

d3.map(problem_areas, d => {
  console.log(d + " -> " + color(d));
})

svg.append("g")
  .attr("class", "mylabel")
  .selectAll("text")
  .data(rolledUpFlat, d => d.key)
  .join("text")
  .attr("y", d => y(d.key))
  .attr("x", marginLeft)
  .text(d => d.key);

svg.append("g")
  .attr("transform", "translate(500, " + marginTop + ")")
  .selectAll("g")
  .data(rolledUpFlat, d => d.key)
  .join("g")
  .attr("transform", d => "translate(0, " +  y(d.key) + ")")
  .selectAll("circle")
  .data(d => d.value)
  .join("circle")
  .attr("fill", d => color(d))
  .attr("cx", (_, i) => i * 30)
  .attr("cy", 0)
  .attr("r", 10);

sketch.append(svg.node());

// function mycolor(key) {
//   switch(key) {
//     case "Insomnia": return "steelblue";
//     case "Sedative": return "yellow";
//     case "Nervousness": return "green";
//     case "Anxiety": return "red";
//     case "Calming": return "blue";
//     case "Misc": return "black";
//   }
// }