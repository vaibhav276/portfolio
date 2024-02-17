import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Declare the chart dimensions and margins.
const width = 640;
const height = 400;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

/*
const data = [
  {state: 'AL', age: '10', population: 123},
  {state: 'AK', age: '10', population: 123},
  {state: 'AZ', age: '10', population: 123},
  {state: 'AL', age: '20', population: 123},
  {state: 'AK', age: '20', population: 123},
  {state: 'AZ', age: '20', population: 123},
  {state: 'AL', age: '30', population: 123},
  {state: 'AK', age: '30', population: 123},
  {state: 'AZ', age: '30', population: 123},
  {state: 'AL', age: '40', population: 123},
  {state: 'AK', age: '40', population: 123},
  {state: 'AZ', age: '40', population: 123},
];

const indexed = d3.index(data, d => d.state, d => d.age);

const series = d3.stack()
      .keys(d3.union(data.map(d => d.age))) // distinct series keys, in input order
      .value(([, D], key) => D.get(key).population) // get value for each series key and stack
    (indexed); // group by stack then series key

const x = d3.scaleBand()
            .domain(d3.groupSort(data, D => -d3.sum(D, d => d.population), d => d.state))
            .range([marginLeft, width - marginRight])
            .padding(0.1);

*/

const data = await d3.dsv(";", "data/data.csv");
console.log('data', data);

const indexed = d3.group(data, d => d.remedy, d => d.problem_area);
const series = d3.stack()
      .keys(d3.union(data.map(d => d.problem_area))) // distinct series keys, in input order
      .value(([, D], key) => D.has(key)? D.get(key).length : 0) // get value for each series key and stack
    (indexed); // group by stack then series key

const groupSorted = d3.groupSort(data, D => -D.length , d => d.remedy);
const x = d3.scaleBand()
            .domain(groupSorted)
            // .range([marginTop, height - marginBottom]);
            .range([marginLeft, width - marginRight])
            .padding(0.5);

const grouped = d3.group(data, d => d.remedy);
const maxY = d3.max(d3.map(grouped, d => d), d => d[1].length);

const y = d3.scaleLinear()
            .domain([0, maxY])
            // .range([marginLeft, width - marginRight]);
            .range([height - marginBottom, marginTop]);

const color = d3.scaleOrdinal()
                .domain(series.map(d => d.key))
                .range(d3.schemeSpectral[series.length])
                .unknown("#ccc");

const svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto;");

svg.append("g")
  .selectAll()
  .data(series)
  .join("g")
  .attr("fill", d => color(d.key))
  .selectAll("rect")
  .data(D => D.map(d => (d.key = D.key, d)))
  .join("rect")
  .attr("x", d => x(d.data[0]))
  .attr("y", d => y(d[1]))
  .attr("height", d => y(d[0]) - y(d[1]))
  .attr("width", x.bandwidth());

console.log('series', series);
// Append the SVG element.
sketch.append(svg.node());