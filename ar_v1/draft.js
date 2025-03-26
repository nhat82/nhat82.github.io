window.onload = () => {
    let userMarkerAdded = false;
    const scene = document.querySelector("a-scene");
    const userLocation = document.getElementById('user-location');
    const camera = document.querySelector("[gps-new-camera]");
    const plantList = document.getElementById('plant-list');

    camera.addEventListener("gps-camera-update-position", (e) => {
        const userLat = e.detail.position.latitude;
        const userLon = e.detail.position.longitude;

        console.log(`User Location: ${userLat}, ${userLon}`);
        userLocation.textContent = `Lat: ${userLat}, Lon: ${userLon}`;

        // Add red box at user location (only once)
        if (!userMarkerAdded) {
            const userMarker = document.createElement("a-box");
            userMarker.setAttribute("scale", { x: 1, y: 1, z: 1 });
            userMarker.setAttribute("material", { color: "red" });
            userMarker.setAttribute("gps-new-entity-place", {
                latitude: userLat,
                longitude: userLon
            });
            scene.appendChild(userMarker);
            userMarkerAdded = true;
        }

        // Fetch and process the CSV file
        fetch("ABG_Database_101124wSID_cleaned_112824_wHornbake.csv")
            .then(response => response.text())
            .then(csvText => {
                console.log("CSV Loaded Successfully!");
                let plants = parseCSV(csvText);

                // Filter & sort nearest plants
                plants = plants
                    .map(plant => ({
                        ...plant,
                        distance: getDistance(userLat, userLon, plant.lat, plant.lon)
                    }))
                    .filter(plant => plant.distance <= 10) // Only within 10 meters
                    .sort((a, b) => a.distance - b.distance) // Sort by proximity
                    .slice(0, 10); // Pick the closest 10

                console.log("Nearest Plants:", plants);

                // Display nearest plants as blue boxes
                plants.forEach(plant => {
                    const plantMarker = document.createElement("a-box");
                    plantMarker.setAttribute("scale", { x: 1, y: 1, z: 1 });
                    plantMarker.setAttribute("material", { color: "blue" });
                    plantMarker.setAttribute("gps-new-entity-place", {
                        latitude: plant.lat,
                        longitude: plant.lon
                    });
                    // plantMarker.addEventListener('click', () => {
                    //     alert(`Plant Details:
                    //         s_id: ${plant.s_id}
                    //         cname1: ${plant.cname1 || "N/A"}
                    //         cname2: ${plant.cname2 || "N/A"}
                    //         cname3: ${plant.cname3 || "N/A"}
                    //         Genus: ${plant.genus || "N/A"}
                    //         Species: ${plant.species || "N/A"}
                    //         Cultivar: ${plant.cultivar || "N/A"}`);
                    // });
                    scene.appendChild(plantMarker);
                    
                    // Add to list in UI
                    const listItem = document.createElement('li');
                    listItem.innerText = `${place.cname1 || "N/A"} ${place.cname2 || "N/A"} ${place.cname3 || "N/A"} Genus: ${place.genus || "N/A"} Species: ${place.species || "N/A"} Cultivar: ${place.cultivar || "N/A"} (${place.distance.toFixed(2)}m) ${place.lat},${place.lon}`;
                    plantList.appendChild(listItem);
                });
            })
            .catch(err => console.error("Error loading CSV:", err));
    });
};

// Function to parse CSV text into an array of plant objects
function parseCSV(csvText) {
    const rows = csvText.split("\n").slice(1); // Skip header row

    return rows
        .map(row => {
            const columns = row.split(",");

            if (columns.length < 9) return null; // Skip invalid rows

            return {
                s_id: columns[0]?.trim(),
                cname1: columns[1]?.trim() || "Unknown",
                cname2: columns[2]?.trim() || "",
                cname3: columns[3]?.trim() || "",
                genus: columns[4]?.trim() || "Unknown",
                species: columns[5]?.trim() || "",
                cultivar: columns[6]?.trim() || "",
                lon: parseFloat(columns[7]) || 0, // Default to 0 if missing
                lat: parseFloat(columns[8]) || 0  // Default to 0 if missing
            };
        })
        .filter(plant => plant.s_id && plant.lat !== 0 && plant.lon !== 0); // Remove invalid entries
}

// Function to calculate distance between two GPS points (Haversine formula)
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
    return R * c; // Distance in meters
}
