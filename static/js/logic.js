// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 3); // Centered on North America

// Base Maps
const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

const topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap'
});

// Add the default base map
streetMap.addTo(map);

// Overlays
const earthquakesLayer = L.layerGroup();
const tectonicPlatesLayer = L.layerGroup();

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
  return magnitude * 4; // Scale factor for size
}

// Function to determine marker color based on depth
function markerColor(depth) {
  return depth > 90 ? '#ff5e5e' :
         depth > 70 ? '#fca35d' :
         depth > 50 ? '#fdb72a' :
         depth > 30 ? '#f7db11' :
         depth > 10 ? '#dcf400' :
                      '#a3f600';
}

// Fetch earthquake data
const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

fetch(earthquakeUrl)
  .then(response => response.json())
  .then(data => {
    // Loop through the features array
    data.features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      const properties = feature.properties;

      // Create a circle marker and add to the earthquake layer
      L.circleMarker([coords[1], coords[0]], {
        radius: markerSize(properties.mag), // Size based on magnitude
        fillColor: markerColor(coords[2]), // Color based on depth
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(earthquakesLayer)
        .bindPopup(`<h3>${properties.place}</h3>
                    <hr>
                    <p>Magnitude: ${properties.mag}</p>
                    <p>Depth: ${coords[2]} km</p>
                    <p>${new Date(properties.time)}</p>`);
    });
  })
  .catch(error => console.error("Error fetching earthquake data:", error));

// Fetch tectonic plates data
const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

fetch(tectonicPlatesUrl)
  .then(response => response.json())
  .then(data => {
    // Add tectonic plates data to the layer
    L.geoJSON(data, {
      style: {
        color: "#ff7800",
        weight: 2
      }
    }).addTo(tectonicPlatesLayer);
  })
  .catch(error => console.error("Error fetching tectonic plates data:", error));

// Add layer controls
const baseMaps = {
  "Street Map": streetMap,
  "Topographic Map": topoMap
};

const overlays = {
  "Earthquakes": earthquakesLayer,
  "Tectonic Plates": tectonicPlatesLayer
};

// Add layers to the map
earthquakesLayer.addTo(map);
tectonicPlatesLayer.addTo(map);

// Add control to switch between base maps and overlays
L.control.layers(baseMaps, overlays, {
  collapsed: false // Keep the control expanded
}).addTo(map);

// Add a legend to the map
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function() {
  const div = L.DomUtil.create('div', 'info legend');
  const depths = [-10, 10, 30, 50, 70, 90];
  const labels = [];

  // Loop through the depth intervals to generate a label with a colored square
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML +=
      `<i style="background: ${markerColor(depths[i] + 1)}"></i> ` +
      `${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}` : '+'}<br>`;
  }

  return div;
};

legend.addTo(map);