window.onload = () => {
    if (!navigator.xr) {
        console.error("WebXR is not supported in this browser.");
        return;
    }

    let xrSession;
    let xrRefSpace;

    // Start WebXR session (AR mode)
    navigator.xr.requestSession('immersive-ar').then((session) => {
        xrSession = session;
        xrSession.addEventListener('end', onXRSessionEnded);

        // Setup the reference space (for AR)
        xrSession.requestReferenceSpace('local').then((refSpace) => {
            xrRefSpace = refSpace;

            // Set up the WebXR DOM and scene
            let scene = document.querySelector("a-scene"); // Keep this for managing DOM elements
            scene.innerHTML = ''; // Clear any pre-existing content

            // Geolocation tracking
            trackUserLocation();
            setupInteraction(scene);
        });
    });

    // Function to handle user location and place markers
    function trackUserLocation() {
        const userLocation = document.getElementById('user-location');
        const plantList = document.getElementById('plant-list');

        if (!navigator.geolocation) {
            userLocation.textContent = "Geolocation is not supported by your browser.";
            return;
        }

        navigator.geolocation.watchPosition((position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            userLocation.textContent = `Lat: ${userLat}, Lon: ${userLon}`;

            const existingUserMarker = document.getElementById("userDot");
            if (existingUserMarker) existingUserMarker.remove();

            // Create user marker (arbitrary 3D model, e.g., sphere)
            const userMarker = document.createElement("a-sphere");
            userMarker.setAttribute("radius", "0.1");
            userMarker.setAttribute("material", "color: red");
            userMarker.setAttribute("position", `${userLat} ${userLon} 0`);
            userMarker.setAttribute("id", "userDot");
            scene.appendChild(userMarker);

            // Fetch plant data and place markers
            fetchPlantsData(userLat, userLon, scene);
        }, (error) => {
            console.error("Geolocation error:", error.message);
        });
    }

    // Function to fetch plant data and create markers
    function fetchPlantsData(userLat, userLon, scene) {
        fetch("../ABG.csv")
            .then(response => {
                if (!response.ok) throw new Error("Failed to load CSV file.");
                return response.text();
            })
            .then(csvText => {
                let plants = parseCSV(csvText);
                plants = plants
                    .map(plant => ({
                        ...plant,
                        distance: getDistance(userLat, userLon, plant.lat, plant.lon)
                    }))
                    .filter(plant => plant.distance <= 10)
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 10);

                plantList.innerHTML = `Total Plants Found: ${plants.length}`;

                plants.forEach(plant => {
                    const plantMarker = document.createElement("a-sphere");
                    plantMarker.setAttribute("radius", "0.1");
                    plantMarker.setAttribute("material", "color: blue");
                    plantMarker.setAttribute("position", `${plant.lat} ${plant.lon} 0`);
                    plantMarker.setAttribute("id", `plantDot-${plant.s_id}`);
                    plantMarker.addEventListener("click", () => {
                        displayPlantInfo(plant);
                    });
                    scene.appendChild(plantMarker);
                });
            })
            .catch(err => console.error("Error loading CSV:", err));
    }

    // Function to display plant information
    function displayPlantInfo(plant) {
        const info = document.getElementById("info");
        info.innerText = `${plant.cname1} - Genus: ${plant.genus}, Species: ${plant.species}`;
    }

    // Parse CSV function
    function parseCSV(csvText) {
        const rows = csvText.split("\n").slice(1); // Skip header row

        return rows.map(row => {
            const columns = row.split(",");
            while (columns.length < 9) columns.push(""); // Handle missing columns

            return {
                s_id: columns[0]?.trim(),
                cname1: columns[1]?.trim() || "Unknown",
                cname2: columns[2]?.trim() || "",
                genus: columns[4]?.trim() || "Unknown",
                species: columns[5]?.trim() || "",
                lat: parseFloat(columns[7]) || 0,
                lon: parseFloat(columns[8]) || 0
            };
        }).filter(plant => plant.s_id && plant.lat !== 0 && plant.lon !== 0);
    }

    // Distance calculation function
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
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

    // Function to handle XR session end
    function onXRSessionEnded() {
        console.log("WebXR session ended.");
    }

    // WebXR input handling (controllers, gestures, etc.)
    function setupInteraction(scene) {
        xrSession.requestAnimationFrame((time, frame) => {
            // Handle user interactions here, like tapping with AR controllers
        });
    }
};
