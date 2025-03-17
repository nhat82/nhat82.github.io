import * as THREE from 'three';
import * as LocAR from 'locar';

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const locar = new LocAR.LocationBased(scene, camera);

window.addEventListener("resize", e => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const cam = new LocAR.WebcamRenderer(renderer);

let firstLocation = true;

const deviceOrientationControls = new LocAR.DeviceOrientationControls(camera);

// Load CSV and parse plant data
async function loadPlantData() {
    const response = await fetch('public/ABG_Database_101124wSID_cleaned_112824_wHornbake.csv');
    const csvText = await response.text();
    return parseCSV(csvText);
}

function parseCSV(csvText) {
    const rows = csvText.split('\n').slice(1);
    return rows
        .map(row => {
            const columns = row.split(',');
            if (columns.length < 9) return null;
            const name = columns[0]?.trim();
            const lat = parseFloat(columns[8]);
            const lon = parseFloat(columns[7]);
            return name && !isNaN(lat) && !isNaN(lon) ? { name, lat, lon } : null;
        })
        .filter(place => place !== null);
}

// Haversine formula to calculate distance
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

locar.on("gpsupdate", async (pos, distMoved) => {
    if (firstLocation) {
        alert(`Got the initial location: longitude ${pos.coords.longitude}, latitude ${pos.coords.latitude}`);
        
        let plants = await loadPlantData();
        plants = plants.map(plant => ({
            ...plant,
            distance: getDistance(pos.coords.latitude, pos.coords.longitude, plant.lat, plant.lon)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);

        const geom = new THREE.BoxGeometry(20, 20, 20);

        for (const plant of plants) {
            const latDis = plant.lat - pos.coords.latitude;
            const lonDis = plant.lon - pos.coords.longitude;
            
            const mesh = new THREE.Mesh(
                geom, 
                new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            );
        
            console.log(`Adding plant ${plant.name} at ${plant.lon}, ${plant.lat} (latDis: ${latDis}, lonDis: ${lonDis}, distance: ${plant.distance.toFixed(2)}m)`); 
            locar.add(mesh, pos.coords.longitude + plant.lonDis, pos.coords.latitude + plant.latDis);
        }
        
        firstLocation = false;
    }
});

locar.startGps();

renderer.setAnimationLoop(animate);

function animate() {
    cam.update();
    deviceOrientationControls.update();
    renderer.render(scene, camera);
}
