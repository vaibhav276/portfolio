import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Declare the chart dimensions and margins.
const width = 1400;
const height = 1200;
const marginTop = 20;
const marginBottom = 30;
const marginLeft = 40;

const data = await d3.dsv(";", "data/data.csv");

// Sources DIV with checkboxes
const sources = sourcesFromData(data);
const sourcesDiv = d3.create("div")
  .attr("width", width)
  .attr("style", "padding: 20px; background-color: #F2EFE5");
drawSources(sourcesDiv, sources);
sketch.append(sourcesDiv.node());

const svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", "max-width: 100%; height: auto; background-color: #F2EFE5");

// Initially all are selected, but on clicking, selectedSources will be updated
let selectedSources = sources;
drawLayout(svg, data, selectedSources);

sketch.append(svg.node());

function sourcesFromData(data) {
  return d3.sort(new Set(d3.map(data, d => d.source)));
}

function problemAreasFromData(data, selectedSources) {
  let filteredData = data.filter(r => selectedSources.includes(r.source));

  // Map from problem areas to remedies
  let mapPA2R = d3.map(d3.rollup(filteredData, D => D.length, d => d.problem_area, d => d.remedy), d => {
    return {
      key: d[0],
      value: d3.sort(d3.map(d[1], e => Array(e[1]).fill(e[0])).flat())
    }
  });
  mapPA2R = d3.sort(mapPA2R, d => -d.value.length); // sort descending

  let problemAreas = {
    set: d3.map(mapPA2R, d => d.key),
    // Problem areas are hardcoded for colors so that the color coding does not change
    // When list of problem areas change
    color: d3.scaleOrdinal()
      .domain(["Insomnia", "Misc", "Sedative", "Anxiety", "Calming", "Nervousness"])
      .range(["#51829B", "#337357", "#85586F", "#9A031E", "#387ADF", "#50C4ED"]),
    x: 0,
    y: d3.scaleBand()
      .domain(d3.map(mapPA2R, d => d.key))
      .range([marginTop, height - marginBottom]),
  };
  return {mapPA2R: mapPA2R, problemAreas: problemAreas};
}

function remediesFromData(data, selectedSources) {
  let filteredData = data.filter(r => selectedSources.includes(r.source));

  // Map from remedies to problem areas
  let mapR2PA = d3.map(d3.rollup(filteredData, D => D.length, d => d.remedy, d => d.problem_area), d => {
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
    .data(sources)
    .join("div")
    .append("input")
    .attr("type", "checkbox")
    .attr("id", d => d)
    .attr("name", d => d)
    .attr("value", d => d)
    .attr("checked", true)
    .select(function() { return this.parentNode })
    .append("label")
    .attr("for", d => d)
    .html(d => "&nbsp;" + d)
    .select(function() { return this.parentNode })
    .append("br")
    .select(function() { return this.parentNode })
    .on("click", e => {
      updateBySource(e.srcElement.__data__, e.srcElement.checked)
    })
}

function drawProblemAreaList(container, mapPA2R, problemAreas) {
  // problem areas list
  container.attr("style", "font-size: 30px")
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
          .attr("rx", "10px")
          .attr("opacity", 0.3)
          .attr("id", d => "rect-" + d.key)
          .on("mouseenter", e => {
            updateByProblemArea(e.srcElement.__data__.key, true);
          })
          .on("mouseout", e => {
            updateByProblemArea(e.srcElement.__data__.key, false);
          });

        // Problem area text
        enter.append("text")
          .attr("y", d => problemAreas.y(d.key) + 35)
          .attr("x", marginLeft + 30)
          .attr("fill", "#ffffff")
          .text(d => d.key)
          .on("mouseenter", e => {
            updateByProblemArea(e.srcElement.__data__.key, true);
          })
          .on("mouseout", e => {
            updateByProblemArea(e.srcElement.__data__.key, false);
          });

      },
      update => update,
      exit => exit.remove()
    );
}

function drawLinks(container, mapPA2R, problemAreas, remedies) {

  const points2 = d => d3.map(new Set(d.value), r => {
    return [{
      x: 240,
      y: problemAreas.y(d.key) + 30
    }, {
      x: 650,
      y: remedies.y(r) - 10
    }];
  });

  //container.select("g").remove();
  container.attr("style", "font-size: 30px")
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
          .attr("stroke-width", 1.0)
          .attr("opacity", 0.3)
          .attr("id", d => "path-" + d.key);
        },
        update => update,
        exit => exit.remove()
    );
}

function drawRemedies(container, mapR2PA, remedies, problemAreas) {
  // remedies list
  container.attr("style", "font-size: 30px")
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
    .attr("r", 10)
    .attr("opacity", 0.3)
    .attr("id", d => "circle-" + d);
}

function updateByProblemArea(name, selected) {
  d3.selectAll("#rect-" + name)
    .attr("opacity", selected ? 1.0 : 0.3);

  d3.selectAll("#path-" + name)
    .attr("stroke-width", selected ? 3.0 : 1.0)
    .attr("opacity", selected ? 1.0 : 0.3);

  d3.selectAll("#circle-" + name)
    .attr("opacity", selected ? 1.0 : 0.3);
}

function updateBySource(name, selected) {
  if (!selected && selectedSources.includes(name)) {
    let index = selectedSources.indexOf(name); // We know index won't be -1
    selectedSources.splice(index, 1);
  }
  else if (selected && !selectedSources.includes(name))
    selectedSources.push(name);

  svg.selectAll("g").remove();
  drawLayout(svg, data, selectedSources);
}

function drawLayout(container, data, selectedSources) {
  const { mapPA2R, problemAreas } = problemAreasFromData(data, selectedSources);
  const { mapR2PA, remedies } = remediesFromData(data, selectedSources);

  const layout = {
    problemAreasContainer: container.append("g").attr("transform", "translate(" + problemAreas.x + ", 45)"),
    linksContainer: container.append("g").attr("transform", "translate(" + problemAreas.x + 50 + ", 45)"),
    remediesContainer: container.append("g").attr("transform", "translate(" + remedies.x + ", 45)")
  }

  drawProblemAreaList(layout.problemAreasContainer, mapPA2R, problemAreas);
  drawLinks(layout.linksContainer, mapPA2R, problemAreas, remedies);
  drawRemedies(layout.remediesContainer, mapR2PA, remedies, problemAreas);
}