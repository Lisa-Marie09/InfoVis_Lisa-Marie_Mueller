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
const data = await FileAttachment("./data/tornados.json").json()
const us = await FileAttachment("./map/counties-albers-10m.json").json();
```


```js
const filteredData = d3.filter(data, d => {
  return (select === "All months" || d.Month === +select) && 
         (yearSlider === 2008 || d.Year === yearSlider);
});
```

<h1>Tornado Activity in the United States</h1>



<div class="card grid grid-cols-4">
    <div class="border card grid-colspan-3 " style="margin-right: 170px">
    <span class="tornado-card-h1">Geographic Distribution by State</span>


<div style="display: flex; gap: 30px; align-items: center; flex-wrap: wrap;">

  ```js  
  const select = view(Inputs.select(["All months", ...Array.from(d3.group(data, d => d.Month).keys()).sort((a, b) => a - b)], {label: "Months:",value: "All months"}));
   ```
  ```js
  const yearSlider = view(Inputs.range([2008, 2021], {label: "Year:", value: 2008, step: 1}));
  ```
</div>

  ```js

  //Calculate sums with d3
  const sumInjuries = d3.sum(filteredData, d => d.Injuries);
  const sumFatalities = d3.sum(filteredData, d => d.Fatalities);
  const sumTornados = filteredData.length;

  // 2. Die Map befüllen (D3 gruppiert hier automatisch nach ID und zählt die Einträge)
  const dataMap = d3.rollup(
    filteredData, 
    v => v.length, 
    d => d.id
  );

  const states = topojson.feature(us, us.objects.states).features;
  const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

  // 4. Karte zeichnen
  display(Plot.plot({
    projection: "identity",
    width: 1000,
    height: 650,
    
    color: {
      type: "linear", 
      domain: [0, d3.max(Array.from(dataMap.values())) || 1],      
      interpolate: d3.piecewise(d3.interpolateLab, [
        "#faf0bf", 
        "#c04d0c", 
        "#590301"
      ]),
      label: "Tornado Numbers",
      legend: true
    },
    
    marks: [
      Plot.geo(states, {
        fill: d => {
          return dataMap.get(d.id) || 0;
        },
      }),
      
      Plot.geo(statemesh, {stroke: "#590301", strokeWidth: 1})
    ]
  }));
  ```
</div>

<div class="grid-colspan-1" style="margin-left: -170px">

```js
  const shiftedSum = d3.sum(filteredData, d => {
    const isEFU = d.Magnitude === -9;
    //if it's EFU -> count as 0, if not add + 1 to number
    return isEFU ? 0 : d.Magnitude + 1;
  });

// Durchschnitt auf der verschobenen Skala
const avgShifted = filteredData.length > 0 ? shiftedSum / filteredData.length : 0;

// Jetzt ziehen wir die 1 wieder ab, um den echten EF-Wert zurückzubekommen!
const avgMagnitude = (avgShifted - 1).toFixed(2);

```

<div class="border tornado-card">
    <span class="tornado-card-h1">All States</span>
    <div class="border info-box-wrapper">
    <div class="card-row">
    <div class="icon-container">
      <i class="fa-solid fa-tornado icon"></i>
    </div>
    <div class="divider"></div>
    <div class="data-container">
    <span class="big-number">${sumTornados.toLocaleString("de-DE")}</span>
    <span>Tornadoes</span>
  </div>
</div>
</div>

<div class="border info-box-wrapper" >
  <div class="card-row">
    <div class="icon-container">
      <i class="fa-solid fa-bandage icon" style="font-size: 20px"></i>
    </div>
    <div class="divider"></div>
    <div class="data-container">
      <span class="big-number">${sumInjuries.toLocaleString("de-DE")}
      </span>
      <span>Injuries</span>
    </div>
  </div>


<div class="card-row">
    <div class="icon-container">
      <i class="fa-solid fa-skull-crossbones icon"></i>
    </div>
    <div class="divider"></div>
    <div class="data-container">
      <span class="big-number">${sumFatalities.toLocaleString("de-DE")}</span>
      <span>Fatalities</span>
</div>
</div>
</div>
<div class="border info-box-wrapper">
    <div class="card-row">
    <div class="icon-container">
      <i class="fa-solid fa-signal icon" style="font-size: 20px"></i>
    </div>
    <div class="divider"></div>
    <div class="data-container">
    <span class="big-number">${avgMagnitude.toLocaleString("de-DE")}</span>
    <span>Average Magnitude</span>
  </div>
</div>
</div>
</div>



<div class="card border">
<span class="tornado-card-h1">Tornadoes per Magnitude</span>

```js
  
  display(Plot.plot({
    width: 500,
    height: 360, 
    marginBottom: 40,
    marginTop: 40, 

    style: {
        fontSize: "14px",
    },
    color: {
      domain: ["EFU", 0, 1, 2, 3, 4, 5],
      range: [
        "#adadad",
        "#84e9e2", 
        "#f1e374", 
        "#d39d32", 
        "#e6771d", 
        "#d44a5f", 
        "#8a6fe0"
      ]
    },
    x: {
        label: "Magnitude (abbreviated EF-Scale)",
        labelOffset: 45,
        tickFormat: d => typeof d === "number" ? `EF${d}` : d, 
        domain: ["EFU", 0, 1, 2, 3, 4, 5] 
    },
    
    y: {
        label: "Number of Tornadoes",
        labelOffset: 40,
        grid: true,
        line: true,
    },

    marks: [
      Plot.barY(filteredData, Plot.groupX(
        { y: "count" },
        {
          x: d => d.Magnitude === -9 ? "EFU" : d.Magnitude,
          fill: d => d.Magnitude === -9 ? "EFU" : d.Magnitude,
          
          tip: true, 
          
          title: d => `${d.count}` 
        }
      )),
      Plot.ruleY([0])
    ]
}));

  
```
</div>

</div></div>

