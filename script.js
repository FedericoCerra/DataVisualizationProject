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

  drawBarChart(countryData);
  drawGroupedBarChart(sizeData);
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
