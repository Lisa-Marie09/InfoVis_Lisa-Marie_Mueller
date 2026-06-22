---
theme: dashboard
toc: false
---
```js
import * as d3 from "npm:d3";
import * as Plot from "npm:@observablehq/plot";
import * as topojson from "npm:topojson-client";

```
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="./style/style.css">


```js
//const data = await FileAttachment("./data/US_Tornado_dataset_2009-2021.csv").csv()
const data = await FileAttachment("./data/tornados.geojson").json()
const us = await FileAttachment("./map/counties-10m.json").json();
import { createFilterBox, createButton } from "./style/layout.js";
```

<h1>Tornado Activity in the United States</h1>


<div class="card">
<span class="tornado-card-h1">Tornado Track Analysis</span>

  ```js
// 1. Inputs erstellen (angepasst an die GeoJSON-Struktur von data.features)
const select = Inputs.select([
  "All months", 
  ...Array.from(d3.group(data.features, d => d.properties.Month).keys()).sort((a, b) => a - b)
], { label: "Months:", value: "All months" });

const yearSlider = Inputs.range([2008, 2021], { label: "Year:", value: 2008, step: 1 });
d3.select(yearSlider)
  .style("display", "flex")
  .style("flex-direction", "column")
  .style("align-items", "flex-start")
  .style("margin-bottom", "50px")
  .style("gap", "4px");

const magnitudeInput = Inputs.checkbox([-9, 0, 1, 2, 3, 4, 5], {
  label: "Magnitudes:",
  value: [-9, 0, 1, 2, 3, 4, 5],
  format: d => d === -9 ? "EFU" : `EF${d}` 
});



const states = topojson.feature(us, us.objects.states).features;
const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

const renderMap = () =>
  Plot.plot({
    className: "tornado-map",
    width: 1200,
    height: 860,
    projection: "albers-usa", 
    figure: false,
    color: {
      type: "ordinal",
      domain: [-9, 0, 1, 2, 3, 4, 5],
      range: ["#adadad", "#84e9e2", "#f1e374", "#d39d32", "#e6771d", "#d44a5f", "#8a6fe0"],
      legend: true,
      label: "Tornado Magnitude (EF-Scale)"
    },
    marks: [
      Plot.geo(states, { 
        fill: "#f7faf5bd", 
        stroke: "#ccc", 
        strokeWidth: 0.5 
      }),
      Plot.geo(statemesh, { 
        className: "state-borders", 
        stroke: "#9ca3af", 
        strokeWidth: 1 
      }),
      Plot.geo(data.features, { 
        className: "tornado-tracks",
        stroke: d => d.properties.Magnitude,
        strokeWidth: 1.5,
        title: d => `Date: ${d.properties.Date}\nMonth: ${d.properties.Month}\nYear: ${d.properties.Year}\nInjuries: ${d.properties.Injuries}\nFatalities: ${d.properties.Fatalities}\nMagnitude: ${d.properties.Magnitude === -9 ? "EFU" : `EF${d.properties.Magnitude}`}`
      })
    ]
  });

const layout = createFilterBox();
const resetButton = createButton();
layout.mapContainer.append(() => resetButton.node());

const chart = renderMap();
layout.mapContainer.append(() => chart);


d3.select(chart).style("width", "100%").style("height", "100%").style("display", "block");

//Adding zoom
const svgContent = d3.select(chart).selectAll("g");

const handleZoom = (e) => {
  svgContent.attr("transform", e.transform);
  d3.select(chart).selectAll(".state-borders").style("stroke-width", 1 / e.transform.k);
  d3.select(chart).selectAll(".tornado-tracks").style("stroke-width", 1.5 / e.transform.k);
};

const zoom = d3.zoom()
  .scaleExtent([1, 18])
  .on("zoom", handleZoom);

layout.mapContainer.call(zoom);

resetButton.on("click", () => {
  layout.mapContainer.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
});


const updateVisibility = () => {
  const activeMags = (magnitudeInput.value || []).map(String);
  const selectedMonth = String(select.value);
  const selectedYear = String(yearSlider.value);

  d3.select(chart)
    .selectAll(".tornado-tracks path")
    .each(function() {
      const titleText = this.textContent || "";
      if (!titleText) return;

      //Extract values from text
      const monthMatch = titleText.match(/Month:\s*(\d+)/);
      const yearMatch  = titleText.match(/Year:\s*(\d+)/);
      const magMatch   = titleText.match(/Magnitude:\s*EF(-?\d+|U)/);

      const month = monthMatch[1];
      const year  = yearMatch[1];
      //If EFU -> adds -9 again for the filter
      const mag   = magMatch[1] === "U" ? "-9" : magMatch[1];

      const magMatches   = activeMags.includes(String(mag));
      const monthMatches = selectedMonth === "All months" || String(month) === selectedMonth;
      const yearMatches  = yearSlider.value === 2008 || String(year) === selectedYear;

      //Change visibility
      this.style.display = (magMatches && monthMatches && yearMatches) ? null : "none";
    });
};

magnitudeInput.addEventListener("input", updateVisibility);
select.addEventListener("input", updateVisibility);
yearSlider.addEventListener("input", updateVisibility);

//Add all filters to the filter box
layout.filterBox.append(() => select);
layout.filterBox.append(() => yearSlider);
layout.filterBox.append(() => magnitudeInput);

display(layout.container);
```

</div>

</div>