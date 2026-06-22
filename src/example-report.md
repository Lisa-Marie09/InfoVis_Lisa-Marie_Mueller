---
theme: dashboard
toc: false
---

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



```js
    const filteredDataByYear = d3.filter(data, d => {
      return(yearSlider === 2008 || d.Year === yearSlider);
    });

    //Sort data by month to properly display the line
    const monthlyCounts = d3.flatRollup(
      filteredDataByYear,
      v => ({
        Count: v.length,
        TotalInjuries: d3.sum(v, d => +d.Injuries),
        TotalFatalities: d3.sum(v, d => +d.Fatalities)
      }),
      d => +d.Month 
    )
    .map(([Month, stats]) => ({ Month, ...stats }))
    .sort((a, b) => a.Month - b.Month);
```


<div class="card grid grid-cols-2" style="grid-auto-rows: auto;">
  <div class="border card grid-colspan-2">
  
  ```js
  const yearSlider = view(Inputs.range([2008, 2021], {label: "Year:", value: 2008, step: 1}));
  ```

  </div>
  <div class="border card">
  
  <span class="tornado-card-h1">Tornadoes per Month</span>

```js
    display(Plot.plot({
      height: 130,
      style: {
        fontSize: "14px",
        marginBottom: 10,
        marginTop: 10, 
      },
      y: {
        grid: true,
        label: "Number of Tornadoes",
        labelOffset: 40,
      },
      x: {
        labelOffset: 45,
        domain: d3.range(1, 13), 
        tickFormat: d => ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"][d - 1]
      },
      marks: [
        Plot.lineY(monthlyCounts, {
          x: "Month",
          y: "Count",
          stroke: "#590301"
        }),
        
        //Dots to make it easier to see
        Plot.dotY(monthlyCounts, {
          x: "Month",
          y: "Count",
          fill: "#590301",
          r: 4,
          tip: true, 
          title: d => `${d.Count}`,
        })
      ]
    }));

   ```
  </div>
  <div class="border card">
  
  <span class="tornado-card-h1">Injuries and Fatalities per Month</span>

```js
    display(Plot.plot({
      height: 130,
      style: {
        fontSize: "14px",
        marginBottom: 10,
        marginTop: 10, 
      },
      y: {
        grid: true,
        label: "Number of Tornadoes",
        labelOffset: 40,
      },
      x: {
        labelOffset: 45,
        domain: d3.range(1, 13), 
        tickFormat: d => ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"][d - 1]
      },
      marks: [
        Plot.lineY(monthlyCounts, {
          x: "Month",
          y: "TotalInjuries",
          stroke: "#c04d0c"
        }),
        //Dots to make it easier to see
        Plot.dotY(monthlyCounts, {
          x: "Month",
          y: "TotalInjuries",
          fill: "#c04d0c",
          r: 4,
          tip: true, 
          title: d => `${d.TotalInjuries}`,
        }),
        Plot.text(monthlyCounts, Plot.selectLast({
          x: "Month",
          y: "TotalInjuries",
          text: () => "Injuries",
          textAnchor: "start", //Ensures that the text starts after the point
          dx: 8,  //moves text 8px to the right
          fill: "#c04d0c"
        })),
        Plot.lineY(monthlyCounts, {
          x: "Month",
          y: "TotalFatalities",
          stroke: "#590301"
        }),
        Plot.dotY(monthlyCounts, {
          x: "Month",
          y: "TotalFatalities",
          fill: "#590301",
          r: 4,
          tip: true, 
          title: d => `${d.TotalFatalities}`,
        }),
        Plot.text(monthlyCounts, Plot.selectLast({
          x: "Month",
          y: "TotalFatalities",
          text: () => "Fatalities",
          textAnchor: "start", //Ensures that the text starts after the point
          dx: 8,  //moves text 8px to the right
          fill: "#590301"
        }))
      ]
    }));

   ```
  
  </div>





  <div class="border card grid-colspan-2">
    <span class="tornado-card-h1">Injuries per Magnitude</span>

<div style="display: flex; gap: 30px; align-items: center; flex-wrap: wrap;">

```js  
  const select = view(Inputs.select(["All months", ...Array.from(d3.group(data, d => d.Month).keys()).sort((a, b) => a - b)], {label: "Months:",value: "All months"}));
   ```

```js

  const selectedMetrics = view(Inputs.checkbox(["Injuries", "Fatalities"], {
  value: ["Injuries", "Fatalities"],
  label: "Display:",
}));
  ```
</div>

  ```js

const chartData = filteredData.flatMap(d => {
  const magnitude = Number(d.Magnitude);
  const points = [];
  const stateName = d.State;
  const Width = d.Width;

  // Injuries absichern (Muss strikt größer als 0 sein für die Log-Skala!)
  const injuriesAmount = +d.Injuries;
  if (selectedMetrics.includes("Injuries")) {
    points.push({ 
      Magnitude: magnitude, 
      Amount: injuriesAmount, 
      Type: "Injury", 
      State: stateName,
      Width: Width,
      Color: "#e05a2b" // <-- WICHTIG: Farbe direkt mitspeichern!
    });
  }

  // Fatalities absichern (Muss strikt größer als 0 sein!)
  const fatalitiesAmount = +d.Fatalities;
  if (selectedMetrics.includes("Fatalities")) {
    points.push({ 
      Magnitude: magnitude, 
      Amount: fatalitiesAmount, 
      Type: "Fatality", 
      State: stateName,
      Width: Width,
      Color: "#2be085"
    });
  }
  
  return points;
});


  display(Plot.plot({
  width: 1400,
  height: 430, 
  marginBottom: 40,
  marginTop: 40, 

  style: {
      fontSize: "14px",
  },
  y: {
    type: "log", // Logarithmische Skala benötigt Werte > 0 (haben wir oben garantiert)
    grid: true,
    label: "Number of Affected People",
  },
  x: {
    label: "Magnitude (abbreviated EF-Scale)",
    labelOffset: 45,
    tickFormat: d => `EF${d}`,
    domain: [0, 1, 2, 3, 4, 5] 
  },
  marks: [
    Plot.dot(chartData, {
      x: "Magnitude",
      y: "Amount",
      stroke: "Color",     // Greift auf das Feld im Objekt zu
      fill: "Color",       // Greift auf das Feld im Objekt zu
      fillOpacity: 0.1,    // Etwas erhöht, damit man die Punkte anfangs besser sieht
      strokeOpacity: 0.5,
      r: d => Math.sqrt(d.Width) * 2, // Sicherer Radius
      tip: true,
      title: d => `State: ${d.State}\nType: ${d.Type}\nAmount: ${d.Amount}\nWidth: ${d.Width} ft`
    })
  ]
}));
  ```
  </div>

  
</div>
