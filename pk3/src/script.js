import * as THREE from "three";
window.onload = () => {
  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Device rotation initialization
  const deviceRotation = { x: 0, y: 0, z: 0 };

  // Set up the camera offset
  // const offset = parseFloat(localStorage.getItem('calibrationOffset') || '0');
  // camera.rotation.y = offset * (Math.PI / 180); // Convert offset to radians

  // Force a layout resize after a short delay
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    console.log('🔁 Forced layout resize');
  }, 500);

  // Create user marker and plant markers objects
  let userMarker = null;
  let plantMarkers = {};

  // Elements for UI info
  const userLocation = document.getElementById('user-location');
  const headingDisplay = document.getElementById('heading');
  const plantList = document.getElementById('plant-list');
  const selectedPlantInfo = document.getElementById('selected-plant-info');
  const debugInfo = document.getElementById('debug-info');

  // const calibrationOffset = parseFloat(localStorage.getItem('calibrationOffset') || '0');
  // debugInfo.textContent = `Offset loaded: ${calibrationOffset}°`;

  // Throttle marker updates
  let lastMarkerUpdate = 0;
  const updateInterval = 3000; // Update markers every 3 seconds

  // Track heading continuously
  // For simplicity, we'll assume a fixed heading value (you can replace this with real sensor data if needed)
  let heading = 0;
  setInterval(() => {
    headingDisplay.textContent = `Heading: ${Math.round(heading)}°`;
  }, 1000);

  // Use watchPosition to continuously track the user's location
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        userLocation.textContent = `Lat: ${userLat}, Lon: ${userLon}`;

        // Update or create the red user marker
        if (!userMarker) {
          userMarker = createMarker('./plants_media/hands.glb');
          scene.add(userMarker);
        }
        updateMarkerPosition(userMarker, userLat, userLon);

        // Throttle the update of plant markers
        const now = Date.now();
        if (now - lastMarkerUpdate > updateInterval) {
          lastMarkerUpdate = now;
          updatePlantMarkers(userLat, userLon);
        }
      },
      (err) => {
        console.error('Error getting location:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }

  // Update plant markers with the data from the CSV
  function updatePlantMarkers(userLat, userLon) {
    fetch('./ABG.csv')
      .then((response) => response.text())
      .then((csvText) => {
        // Parse CSV and compute distances
        const plants = parseCSV(csvText)
          .map((p) => ({
            ...p,
            distance: getDistance(userLat, userLon, p.lat, p.lon),
          }))
          .filter((p) => p.distance <= 10) // Only show plants within 10 meters
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);

        // Update the plant list (debug info)
        plantList.innerHTML = '';
        plants.forEach((plant) => {
          const listItem = document.createElement('li');
          listItem.innerText = `Height ${plant.height}, ${plant.cname1 || 'N/A'} - Genus: ${plant.genus}, Species: ${plant.species} (${plant.distance.toFixed(1)}m)`;
          plantList.appendChild(listItem);
        });

        // Create or update markers for each plant
        plants.forEach((plant) => {
          const marker = plantMarkers[plant.s_id] || createMarker('./plants_media/tree.glb');
          updateMarkerPosition(marker, plant.lat, plant.lon);
          if (!plantMarkers[plant.s_id]) {
            plantMarkers[plant.s_id] = marker;
            scene.add(marker);
            marker.addEventListener('click', () => {
              selectedPlantInfo.innerHTML = `
                🌱 <strong>${plant.cname1 || 'Unknown'}</strong><br>
                Genus: ${plant.genus || 'N/A'}<br>
                Species: ${plant.species || 'N/A'}<br>
                Distance: ${plant.distance.toFixed(1)} meters<br>
                Height: ${plant.height || 'N/A'}
              `;
            });
          }
        });

        // Remove markers that are no longer in the dataset
        for (const id in plantMarkers) {
          if (!plants.find((plant) => plant.s_id === id)) {
            scene.remove(plantMarkers[id]);
            delete plantMarkers[id];
          }
        }
      })
      .catch((err) => console.error('CSV load error:', err));
  }

  // Helper to create a marker with a GLTF model
  function createMarker(modelUrl) {
    const marker = new THREE.Object3D();
    const loader = new THREE.GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      marker.add(model);
    });
    return marker;
  }

  // Helper to update marker position
  function updateMarkerPosition(marker, lat, lon) {
    // Convert lat/lon to 3D coordinates (simplified example, use a more precise conversion)
    const x = lon; // You might want to scale this based on the user's area
    const z = lat; // Same as above
    marker.position.set(x, 0, z);
  }

  // --- Helpers ---
  function parseCSV(csvText) {
    const rows = csvText.split('\n').slice(1);
    return rows
      .map((row) => {
        const columns = row.split(',');
        // Ensure we have enough columns
        while (columns.length < 10) columns.push('');
        return {
          s_id: columns[0]?.trim(),
          cname1: columns[1]?.trim() || 'Unknown',
          cname2: columns[2]?.trim() || '',
          cname3: columns[3]?.trim() || '',
          genus: columns[4]?.trim() || 'Unknown',
          species: columns[5]?.trim() || '',
          cultivar: columns[6]?.trim() || '',
          lon: parseFloat(columns[7]) || 0,
          lat: parseFloat(columns[8]) || 0,
          height: parseFloat(columns[9]) || 1,
        };
      })
      .filter((p) => p.s_id && p.lat !== 0 && p.lon !== 0);
  }

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  // Handle device orientation
  window.addEventListener("deviceorientation", handleOrientation, true);
  function handleOrientation(event) {
    deviceRotation.x = event.beta; // Pitch
    deviceRotation.y = event.gamma; // Yaw
    deviceRotation.z = event.alpha; // Roll

    // Apply the device rotation to the camera
    camera.rotation.x = deviceRotation.x * (Math.PI / 180); // Convert to radians
    camera.rotation.y = deviceRotation.y * (Math.PI / 180);
    camera.rotation.z = deviceRotation.z * (Math.PI / 180);
  }

  // Render the scene
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
};
