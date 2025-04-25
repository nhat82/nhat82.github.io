import 'aframe';
import 'locar-aframe';

let firstLocation = true;
const locarCamera = document.querySelector('[locar-camera]');
const scene = document.querySelector('a-scene');
const plantInfoDisplay = document.querySelector('#plantInfoDisplay'); // Make sure you have a div for displaying plant info.

const plantMarkers = {}; // Object to store plant markers by their s_id.

locarCamera.addEventListener('gpsupdate', e => {
    // Default location is lat 0, lon 0 so ignore gpsupdate if for this location
    if (
        e.detail.position.coords.latitude != 0 && 
        e.detail.position.coords.longitude != 0 && 
        firstLocation
    ) {
        alert(`Got the initial location: longitude ${e.detail.position.coords.longitude}, latitude ${e.detail.position.coords.latitude}`);
        updatePlantMarkers(e.detail.position.coords.latitude, e.detail.position.coords.longitude);
        firstLocation = false;
    }
});

document.querySelector('#setFakeLoc').addEventListener('click', e => {
    const lat = document.getElementById('fakeLat').value;
    const lon = document.getElementById('fakeLon').value;
    locarCamera.setAttribute('locar-camera', {
        simulateLatitude: parseFloat(lat),
        simulateLongitude: parseFloat(lon)
    });
});

function updatePlantMarkers(userLat, userLon) {
    fetch("./ABG.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const plants = parseCSV(csvText)
          .map((p) => ({
            ...p,
            distance: getDistance(userLat, userLon, p.lat, p.lon),
          }))
          .filter((p) => p.distance <= 10) // Only consider plants within 10 meters
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10); // Limit to 10 closest plants

        plants.forEach((plant) => {
          const box = document.createElement("a-box");
          box.setAttribute("locar-entity-place", {
            latitude: plant.lat,
            longitude: plant.lon,
          });
          box.setAttribute('material', {
            color: 'blue' // Blue box color
          });
          box.setAttribute('scale', {
            x: 2,
            y: 2,
            z: 2
          });

          // When clicked, display plant info
          box.addEventListener('click', () => {
            plantInfoDisplay.style.display = "block";
            plantInfoDisplay.innerHTML = `
              <div style="font-size: 1em; font-weight: bold;">
                Common Name:
              </div>
              <div style="font-size: 0.7em;">
                ${plant.cname2 ? plant.cname2 + ", " : ""}${plant.cname1 || ""}
              </div>
              <div style="font-size: 0.5em;">
                Genus: ${plant.genus || "N/A"} &nbsp;&nbsp;
                Species: ${plant.species || "N/A"}
              </div>
            `;
          });

          scene.appendChild(box);
        });
      })
      .catch((err) => console.error("CSV load error:", err));
}

function parseCSV(csvText) {
  const rows = csvText.split("\n").slice(1); // Skip the header row
  return rows
    .map((row) => {
      const columns = row.split(",");
      while (columns.length < 11) columns.push(""); // Ensure there are enough columns
      return {
        s_id: columns[0]?.trim(),
        cname1: columns[1]?.trim() || "Unknown",
        cname2: columns[2]?.trim() || "",
        cname3: columns[3]?.trim() || "",
        genus: columns[4]?.trim() || "Unknown",
        species: columns[5]?.trim() || "",
        cultivar: columns[6]?.trim() || "",
        lon: parseFloat(columns[7]) || 0,
        lat: parseFloat(columns[8]) || 0,
        height: parseFloat(columns[10]) || 1,
      };
    })
    .filter((p) => p.s_id && p.lat !== 0 && p.lon !== 0);
}

// Helper function to calculate the distance between two GPS coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance * 1000; // Convert to meters
}
