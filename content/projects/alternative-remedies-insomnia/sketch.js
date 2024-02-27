import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Declare the chart dimensions and margins.
const width = 1400;
const height = 1200;
const marginTop = 20;
const marginBottom = 30;
const marginLeft = 40;

const data = await d3.dsv(";", "data/data.csv");

const sources = sourcesFromData(data);
const {mapPA2R, problemAreas} = problemAreasFromData(data);
const {mapR2PA, remedies} = remediesFromData(data);

const sourcesDiv = d3.create("div");
const svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto; background-color: #F2EFE5");

drawSources(sourcesDiv, sources);
drawProblemAreaList(svg, mapPA2R, 'Misc');
drawLinks(svg, mapPA2R, problemAreas, remedies, 'Misc');
drawRemedies(svg, mapR2PA, remedies, problemAreas);

sketch.append(sourcesDiv.node());
sketch.append(svg.node());

function sourcesFromData(data) {
  let sources = {
    set: d3.sort(new Set(d3.map(data, d => d.source))),
    x: 1200
  }
  sources.y = d3.scaleBand()
    .domain(sources.set)
    .range([0, height / 3]);

  return sources;
}

function problemAreasFromData(data) {
  // Map from problem areas to remedies
  let mapPA2R = d3.map(d3.rollup(data, D => D.length, d => d.problem_area, d => d.remedy), d => {
    return {
      key: d[0],
      value: d3.sort(d3.map(d[1], e => Array(e[1]).fill(e[0])).flat())
    }
  });
  mapPA2R = d3.sort(mapPA2R, d => -d.value.length); // sort descending

  let problemAreas = {
    set: d3.map(mapPA2R, d => d.key),
    color: d3.scaleOrdinal()
      .domain(d3.map(mapPA2R, d => d.key))
      .range(["#F72798", "#F57D1F", "#85586F", "#9A031E", "#387ADF", "#50C4ED"]),
    x: 0,
    y: d3.scaleBand()
      .domain(d3.map(mapPA2R, d => d.key))
      .range([marginTop, height - marginBottom]),
  };
  return {mapPA2R: mapPA2R, problemAreas: problemAreas};
}

function remediesFromData(data) {
  // Map from remedies to problem areas
  let mapR2PA = d3.map(d3.rollup(data, D => D.length, d => d.remedy, d => d.problem_area), d => {
    return {
      key: d[0],
      value: d3.sort(d3.map(d[1], e => Array(e[1]).fill(e[0])).flat())
    }
  });
  mapR2PA = d3.sort(mapR2PA, d => -d.value.length); // sort descending

  const remedies = {
    x: 700,
    y: d3.scaleBand()
      .domain(mapR2PA.map(d => d.key))
      .range([marginTop, height - marginBottom])
  };

  return {mapR2PA: mapR2PA, remedies: remedies};
}

function drawSources(container, sources) {
  // Sources checkboxes
  container.append("h4")
    .html("Sources")
    .select(function () { return this.parentNode })
    .selectAll("div")
    .data(sources.set)
    .join("div")
    .append("input")
    .attr("type", "checkbox")
    .attr("id", d => d)
    .attr("name", d => d)
    .attr("value", d => d)
    .attr("checked", true)
    .select(function () { return this.parentNode })
    .append("label")
    .attr("for", d => d)
    .html(d => "&nbsp;" + d)
    .select(function () { return this.parentNode })
    .append("br");
}

function drawProblemAreaList(container, mapPA2R, selectedProblemArea) {
  // problem areas list
  container.append("g")
    .attr("transform", "translate(" + problemAreas.x + ", 45)")
    .attr("class", "mylabel")
    .selectAll("g")
    .data(mapPA2R)
    .join(
      enter => {
        // Problem area background rect
        enter.append("rect")
          .attr("width", 250)
          .attr("height", 50)
          .attr("y", d => problemAreas.y(d.key))
          .attr("x", marginLeft)
          .attr("fill", d => problemAreas.color(d.key))
          .attr("opacity", d => (d.key === selectedProblemArea ? 1.0 : 0.30))
          .attr("rx", "10px");

        // Problem area text
        enter.append("text")
          .attr("y", d => problemAreas.y(d.key) + 35)
          .attr("x", marginLeft + 30)
          .attr("fill", "#ffffff")
          .text(d => d.key);

      },
      update => update,
      exit => exit.remove()
    );
}

function drawLinks(container, mapPA2R, problemAreas, remedies, selectedProblemArea) {

  const points2 = d => d3.map(new Set(d.value), r => {
    return [{
      x: marginLeft + 260,
      y: problemAreas.y(d.key) + 30
    }, {
      x: 690,
      y: remedies.y(r) - 10
    }];
  });

  container.append("g")
    .attr("transform", "translate(" + problemAreas.x + ", 45)")
    .attr("class", "mylabel")
    .selectAll("path")
    .data(mapPA2R)
    .join(
      enter => {
        // Connector line from problem area to remedy
        enter.append("path")
          .attr("d", d => {
            return d3.map(points2(d), pair => {
              return d3.line()
                .x(p => p.x)
                .y(p => p.y)
                .curve(d3.curveBumpX)
                (pair)
            });
          }
          )
          .attr("fill", "none")
          .attr("stroke", d => problemAreas.color(d.key))
          .attr("stroke-width", d => (d.key === selectedProblemArea ? 3.0 : 1.0))
          .attr("opacity", d => (d.key === selectedProblemArea ? 1.0 : 0.30));
        },
        update => update,
        exit => exit.remove()
    );
}

function drawRemedies(container, mapR2PA, remedies, problemAreas) {
  // remedies list
  container.append("g")
    .attr("transform", "translate(" + remedies.x + ", 45)")
    .attr("class", "mylabel")
    .selectAll("text")
    .data(mapR2PA, d => d.key)
    .join("text")
    .attr("y", d => remedies.y(d.key))
    .attr("x", 0)
    .text(d => d.key);

  // stacked bar chart
  svg.append("g")
    .attr("transform", "translate(" + (remedies.x + 450) + ", 30)")
    .selectAll("g")
    .data(mapR2PA, d => d.key)
    .join("g")
    .attr("transform", d => "translate(0, " + remedies.y(d.key) + ")")
    .selectAll("circle")
    .data(d => d.value)
    .join("circle")
    .attr("fill", d => problemAreas.color(d))
    .attr("cx", (_, i) => i * 30)
    .attr("cy", 0)
    .attr("r", 10);
}