import * as THREE from 'three';
import * as LocAR from 'locar';

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('glscene')
});
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const locar = new LocAR.LocationBased(scene, camera);

window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const cam = new LocAR.Webcam({
    idealWidth: 1024,
    idealHeight: 768,
    onVideoStarted: texture => {
        scene.background = texture;
    }
}, null);

let firstLocation = true;

let deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

const plantMarkers = {}; // Store plant markers by their ID
const plantInfoDisplay = document.querySelector('#plantInfoDisplay'); // Make sure you have a div for plant info

locar.on("gpsupdate", (pos, distMoved) => {
    if (firstLocation) {
        alert(`Got the initial location: longitude ${pos.coords.longitude}, latitude ${pos.coords.latitude}`);
        updatePlantMarkers(pos.coords.latitude, pos.coords.longitude);
        firstLocation = false;
    }
});

locar.startGps();

document.getElementById("setFakeLoc").addEventListener("click", e => {
    alert("Using fake input GPS, not real GPS location");
    locar.stopGps();
    locar.fakeGps(
        parseFloat(document.getElementById("fakeLon").value),
        parseFloat(document.getElementById("fakeLat").value)
    );
});

function updatePlantMarkers(userLat, userLon) {
    fetch("./ABG.csv")
        .then(response => response.text())
        .then(csvText => {
            const plants = parseCSV(csvText)
                .map(p => ({
                    ...p,
                    distance: getDistance(userLat, userLon, p.lat, p.lon),
                }))
                .filter(p => p.distance <= 10) // Only consider plants within 10 meters
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10); // Limit to 10 closest plants

            plants.forEach(plant => {
                const geom = new THREE.BoxGeometry(10, 10, 10);
                const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue box

                const mesh = new THREE.Mesh(geom, material);
                locar.add(mesh, plant.lon, plant.lat); // Add plant position to the scene

                // Add click event to display plant info
                mesh.addEventListener('click', () => {
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
                    // Hide the info display after 3 seconds
                    // setTimeout(() => {
                    //     plantInfoDisplay.style.display = "none";
                    // }, 3000);
                });
                plantMarkers[plant.s_id] = mesh;
            });
        })
        .catch(err => console.error("CSV load error:", err));
}

function parseCSV(csvText) {
    const rows = csvText.split("\n").slice(1); // Skip the header row
    return rows.map(row => {
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
    }).filter(p => p.s_id && p.lat !== 0 && p.lon !== 0);
}

// Helper function to calculate the distance between two GPS coordinates
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance * 1000; // Convert to meters
}

renderer.setAnimationLoop(animate);

function animate() {
    deviceOrientationControls?.update();
    renderer.render(scene, camera);
}
