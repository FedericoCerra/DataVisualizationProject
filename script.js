// ============================================================
// DATA FILES (downloaded from Eurostat, last update 15 June 2026)
//
// data/ai_by_size.csv   -> dataset isoc_eb_ai
//   % of enterprises using at least one AI technology (E_AI_TANY)
//   by country, company size and year (2021, 2023, 2024, 2025)
//
// data/ai_by_sector.csv -> dataset isoc_eb_ain2
//   % of enterprises using at least 1, 2 or 3 AI technologies
//   (E_AI_TANY, E_AI_TGE2, E_AI_TGE3) by country and sector, 2025
//
// Useful columns: size_emp, nace_r2, indic_is, geo, TIME_PERIOD, OBS_VALUE
// ============================================================

const countryNames = {
  EU27_2020: "EU-27", BE: "Belgium", BG: "Bulgaria", CZ: "Czechia", DK: "Denmark", DE: "Germany",
  EE: "Estonia", IE: "Ireland", EL: "Greece", ES: "Spain", FR: "France", HR: "Croatia", IT: "Italy",
  CY: "Cyprus", LV: "Latvia", LT: "Lithuania", LU: "Luxembourg", HU: "Hungary", MT: "Malta",
  NL: "Netherlands", AT: "Austria", PL: "Poland", PT: "Portugal", RO: "Romania", SI: "Slovenia",
  SK: "Slovakia", FI: "Finland", SE: "Sweden"
};

const sectorNames = {
  C: "Manufacturing",
  D_E: "Energy & water",
  F: "Construction",
  G: "Trade",
  H: "Transport & storage",
  I: "Accommodation & food",
  J: "Information & communication",
  L: "Real estate",
  M: "Professional & scientific",
  N: "Administrative & support",
  "C10-S951_X_K": "All sectors"
};

// ============================================================
// COLORS
// ============================================================
const blue = "#2a78d6";
const orange = "#eb6834";
const lightBlue = "#86b6ef";
const darkBlue = "#104281";
const grey = "#d3d1cb";

// ============================================================
// LOAD THE CSV FILES, THEN DRAW THE CHARTS
// ============================================================
Promise.all([
  d3.csv("data/ai_by_size.csv"),
  d3.csv("data/ai_by_sector.csv")
]).then(([sizeRows, sectorRows]) => {

  // convert the values to numbers (empty value = data not available)
  sizeRows.forEach(d => d.value = d.OBS_VALUE === "" ? null : +d.OBS_VALUE);
  sectorRows.forEach(d => d.value = d.OBS_VALUE === "" ? null : +d.OBS_VALUE);

  // small helper: find one value in the size dataset
  function getSizeValue(geo, size, year) {
    const row = sizeRows.find(d => d.geo === geo && d.size_emp === size && d.TIME_PERIOD === year);
    return row ? row.value : null;
  }

  // small helper: find one value in the sector dataset
  function getSectorValue(geo, sector, indicator) {
    const row = sectorRows.find(d => d.geo === geo && d.nace_r2 === sector && d.indic_is === indicator);
    return row ? row.value : null;
  }

  // ---------- Chart 1: all companies (10+ employees), 2025, sorted ----------
  const countryData = sizeRows
    .filter(d => d.size_emp === "GE10" && d.TIME_PERIOD === "2025")
    .map(d => ({ geo: d.geo, country: countryNames[d.geo], value: d.value }))
    .sort((a, b) => b.value - a.value);

  // ---------- Chart 2: small / medium / large, selected countries, 2025 ----------
  const selectedCountries = ["EU27_2020", "DK", "FI", "DE", "FR", "IT", "ES", "RO"];
  const sizeData = selectedCountries.map(geo => ({
    country: countryNames[geo],
    small: getSizeValue(geo, "10-49", "2025"),
    medium: getSizeValue(geo, "50-249", "2025"),
    large: getSizeValue(geo, "GE250", "2025")
  }));

  // ---------- Chart 3: country x sector, 2025 (same order as chart 1) ----------
  const sectorCodes = ["C", "D_E", "F", "G", "H", "I", "J", "L", "M", "N"];
  const heatmapData = [];
  countryData.forEach(c => {
    sectorCodes.forEach(code => {
      heatmapData.push({
        country: c.country,
        sector: sectorNames[code],
        value: getSectorValue(c.geo, code, "E_AI_TANY")
      });
    });
  });

  // ---------- Chart 4: number of AI technologies by sector, EU-27, 2025 ----------
  // "at least 1" - "at least 2" = exactly 1 technology, and so on
  const techData = sectorCodes.concat(["C10-S951_X_K"]).map(code => {
    const atLeast1 = getSectorValue("EU27_2020", code, "E_AI_TANY");
    const atLeast2 = getSectorValue("EU27_2020", code, "E_AI_TGE2");
    const atLeast3 = getSectorValue("EU27_2020", code, "E_AI_TGE3");
    return {
      sector: sectorNames[code],
      none: 100 - atLeast1,
      one: atLeast1 - atLeast2,
      two: atLeast2 - atLeast3,
      three: atLeast3
    };
  }).sort((a, b) => b.none - a.none);

  // ---------- Chart 5: EU-27 over the years ----------
  const yearData = ["2021", "2023", "2024", "2025"].map(year => ({
    year: year,
    value: getSizeValue("EU27_2020", "GE10", year)
  }));

  drawBarChart(countryData);
  drawGroupedBarChart(sizeData);
  drawHeatmap(heatmapData, countryData.map(d => d.country), sectorCodes.map(c => sectorNames[c]));
  drawStackedChart(techData);
  drawWaffleChart(yearData);
});

// ============================================================
// TOOLTIP (shared by all charts)
// ============================================================
const tooltip = d3.select("#tooltip");

function showTooltip(event, html) {
  tooltip.style("opacity", 1)
    .html(html)
    .style("left", (event.pageX + 12) + "px")
    .style("top", (event.pageY + 12) + "px");
}

function hideTooltip() {
  tooltip.style("opacity", 0);
}

// ============================================================
// CHART 1 - BAR CHART
// ============================================================
function drawBarChart(data) {
  const margin = { top: 30, right: 40, bottom: 10, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 560 - margin.top - margin.bottom;

  const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("viewBox", "0 0 800 560")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 45]).range([0, width]);
  const y = d3.scaleBand().domain(data.map(d => d.country)).range([0, height]).padding(0.2);

  svg.append("g").call(d3.axisTop(x).tickFormat(d => d + "%"));
  svg.append("g").call(d3.axisLeft(y));

  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", 0)
    .attr("y", d => y(d.country))
    .attr("width", d => x(d.value))
    .attr("height", y.bandwidth())
    .attr("fill", d => d.country === "EU-27" ? orange : blue)
    .on("mousemove", (event, d) => showTooltip(event, `<b>${d.country}</b><br>${d.value.toFixed(1)}% of enterprises use AI`))
    .on("mouseout", hideTooltip);

  // value labels
  svg.selectAll(".label")
    .data(data)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d.value) + 4)
    .attr("y", d => y(d.country) + y.bandwidth() / 2 + 4)
    .text(d => d.value.toFixed(1));
}

// ============================================================
// CHART 2 - GROUPED BAR CHART
// ============================================================
function drawGroupedBarChart(data) {
  const margin = { top: 20, right: 10, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const sizes = ["small", "medium", "large"];
  const color = d3.scaleOrdinal().domain(sizes).range([lightBlue, blue, darkBlue]);
  const sizeNames = { small: "Small (10–49)", medium: "Medium (50–249)", large: "Large (250+)" };

  const svg = d3.select("#grouped-chart")
    .append("svg")
    .attr("viewBox", "0 0 800 400")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand().domain(data.map(d => d.country)).range([0, width]).padding(0.2);
  const x1 = d3.scaleBand().domain(sizes).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0));
  svg.append("g").call(d3.axisLeft(y).tickFormat(d => d + "%"));

  const groups = svg.selectAll(".group")
    .data(data)
    .join("g")
    .attr("transform", d => `translate(${x0(d.country)},0)`);

  groups.selectAll("rect")
    .data(d => sizes.map(size => ({ country: d.country, size: size, value: d[size] })))
    .join("rect")
    .attr("x", d => x1(d.size))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", d => color(d.size))
    .on("mousemove", (event, d) => showTooltip(event, `<b>${d.country}</b><br>${sizeNames[d.size]}: ${d.value.toFixed(1)}%`))
    .on("mouseout", hideTooltip);

  makeLegend("#grouped-legend", sizes.map(s => sizeNames[s] + " employees"), [lightBlue, blue, darkBlue]);
}

// ============================================================
// CHART 3 - HEATMAP
// ============================================================
function drawHeatmap(cells, countries, sectors) {
  const margin = { top: 130, right: 120, bottom: 10, left: 100 };
  const width = 900 - margin.left - margin.right;
  const height = 760 - margin.top - margin.bottom;

  const svg = d3.select("#heatmap")
    .append("svg")
    .attr("viewBox", "0 0 900 760")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(sectors).range([0, width]).padding(0.05);
  const y = d3.scaleBand().domain(countries).range([0, height]).padding(0.05);
  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, 90]);

  svg.append("g").call(d3.axisLeft(y).tickSize(0));
  svg.append("g").call(d3.axisTop(x).tickSize(0))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "start");

  svg.selectAll("rect")
    .data(cells)
    .join("rect")
    .attr("x", d => x(d.sector))
    .attr("y", d => y(d.country))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => d.value === null ? "#eeeeee" : color(d.value))
    .on("mousemove", (event, d) => showTooltip(event,
      `<b>${d.country}</b><br>${d.sector}: ${d.value === null ? "not available" : d.value.toFixed(1) + "%"}`))
    .on("mouseout", hideTooltip);

  svg.selectAll(".cell-label")
    .data(cells.filter(d => d.value !== null))
    .join("text")
    .attr("class", "cell-label")
    .attr("x", d => x(d.sector) + x.bandwidth() / 2)
    .attr("y", d => y(d.country) + y.bandwidth() / 2 + 4)
    .attr("text-anchor", "middle")
    .attr("fill", d => d.value > 45 ? "white" : "black")
    .text(d => Math.round(d.value));
}

// ============================================================
// CHART 4 - 100% STACKED BAR CHART
// ============================================================
function drawStackedChart(data) {
  const margin = { top: 30, right: 20, bottom: 10, left: 190 };
  const width = 800 - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;

  const keys = ["none", "one", "two", "three"];
  const labels = ["No AI", "1 technology", "2 technologies", "3 or more"];
  const colors = [grey, lightBlue, blue, darkBlue];
  const color = d3.scaleOrdinal().domain(keys).range(colors);

  const svg = d3.select("#stacked-chart")
    .append("svg")
    .attr("viewBox", "0 0 800 380")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const y = d3.scaleBand().domain(data.map(d => d.sector)).range([0, height]).padding(0.2);

  svg.append("g").call(d3.axisTop(x).tickFormat(d => d + "%"));
  svg.append("g").call(d3.axisLeft(y));

  const stackedData = d3.stack().keys(keys)(data);

  svg.selectAll(".layer")
    .data(stackedData)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(layer => layer.map(d => ({ key: layer.key, start: d[0], end: d[1], sector: d.data.sector })))
    .join("rect")
    .attr("x", d => x(d.start))
    .attr("y", d => y(d.sector))
    .attr("width", d => x(d.end) - x(d.start))
    .attr("height", y.bandwidth())
    .attr("stroke", "white")
    .on("mousemove", (event, d) => showTooltip(event,
      `<b>${d.sector}</b><br>${labels[keys.indexOf(d.key)]}: ${(d.end - d.start).toFixed(1)}%`))
    .on("mouseout", hideTooltip);

  makeLegend("#stacked-legend", labels, colors);
}

// ============================================================
// CHART 5 - WAFFLE CHART (one 10x10 grid per year)
// ============================================================
function drawWaffleChart(data) {
  const cellSize = 16;
  const gap = 2;

  data.forEach(d => {
    const filled = Math.round(d.value); // out of 100 squares

    const box = d3.select("#waffle-chart").append("div").attr("class", "waffle");
    const svg = box.append("svg").attr("viewBox", "0 0 178 178");

    svg.selectAll("rect")
      .data(d3.range(100))
      .join("rect")
      .attr("x", i => (i % 10) * (cellSize + gap))
      .attr("y", i => (9 - Math.floor(i / 10)) * (cellSize + gap)) // fill from the bottom
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 2)
      .attr("fill", i => i < filled ? blue : grey)
      .on("mousemove", event => showTooltip(event, `<b>${d.year}</b><br>about ${filled} out of 100 enterprises use AI`))
      .on("mouseout", hideTooltip);

    box.append("p").attr("class", "waffle-value").text(d.value.toFixed(1) + "%");
    box.append("p").text(d.year);
  });

  makeLegend("#waffle-legend", ["Uses AI", "Does not use AI"], [blue, grey]);
}

// ============================================================
// LEGEND HELPER
// ============================================================
function makeLegend(selector, labels, colors) {
  const legend = d3.select(selector);
  labels.forEach((label, i) => {
    const item = legend.append("span").attr("class", "legend-item");
    item.append("span").attr("class", "legend-color").style("background", colors[i]);
    item.append("span").text(label);
  });
}
