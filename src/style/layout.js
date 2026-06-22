// sidebar.js
import * as d3 from "npm:d3";

export function createFilterBox() {
  // 1. Der Haupt-Container für das Grid
  const mainContainer = d3.create("div")
    .style("display", "flex")
    .style("position", "relative")
    .style("width", "100%")
    .style("height", "800px")
    .style("overflow", "hidden")

  ;

  // 2. Der linke Bereich für deine Karte
  const mapContainer = d3.create("div")
    .style("flex", "1")
    .style("position", "relative")
    .style("height", "100%")
  ;

  // 3. Der rechte Bereich für die Filter
  const sidebar = d3.create("div")
    .style("width", "280px")
    .style("height", "100%")
    .style("background-color", "#f9fafb")
    .style("border-left", "1px solid #e5e7eb")
    .style("padding", "20px")
    .style("box-sizing", "border-box")
    .style("transition", "margin-right 0.3s ease")
    .style("z-index", "15")
    .style("margin-right", "-280px")
    .style("border", "2px solid #d7e0ca")
    .style("border-radius", "12px")
    
  ;

  // HTML-Struktur der Sidebar
  sidebar.html(`
    <h3 style="margin-top:0; margin-bottom:15px; font-size:16px;">Filter Options</h3>
    <hr style="border:0; border-top:1px solid #e5e7eb; margin-bottom:15px;">
    <div id="sidebar-filters"></div>
  `);

  // 4. Der Toggle-Button oben rechts
  const toggleButton = d3.create("button")
    .text("Filter")
    .style("position", "absolute")
    .style("right", "15px")
    .style("z-index", "20")
    .style("padding", "8px 12px")
    .style("background-color", "#2563eb")
    .style("color", "#ffffff")
    .style("border", "none")
    .style("border-radius", "4px")
    .style("cursor", "pointer")
    .style("font-weight", "bold")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
  ;
  mapContainer.append(() => toggleButton.node());

  // Klick-Logik zum Öffnen/Schließen
  let isOpen = false;
  toggleButton.on("click", () => {
    isOpen = !isOpen;
    if (isOpen) {
      sidebar.style("margin-right", "0px");
      toggleButton.text("❌ Close").style("background-color", "#ef4444");
    } else {
      sidebar.style("margin-right", "-280px");
      toggleButton.text("Filter").style("background-color", "#2563eb");
    }
  });

  mainContainer.append(() => mapContainer.node());
  mainContainer.append(() => sidebar.node());

  // Wir geben die Container zurück, damit du in deiner Hauptdatei Sachen reinhängen kannst
  return {
    container: mainContainer.node(),
    mapContainer: mapContainer,
    filterBox: sidebar.select("#sidebar-filters")
  };
}


export function createButton() {
  const resetButton = d3.create("button")
  .text("Reset Map")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("padding", "6px 12px")
  .style("background-color", "#ffffff")
  .style("border", "1px solid #9ca3af")
  .style("border-radius", "4px")
  .style("cursor", "pointer")
  .style("font-size", "13px")
  .style("box-shadow", "0px 2px 4px rgba(0,0,0,0.1)")
  ;



  return resetButton;
}


