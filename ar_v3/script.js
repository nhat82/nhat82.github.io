window.onload = () => {
    AFRAME.registerComponent("click-info-display", {
        init: function () {
            let entity = this.el;
            let info = document.getElementById("info");
            entity.addEventListener("click", function () {
                if (entity.id === "userDot") {
                    info.innerText = "Current User Dot";
                } else if (entity.id === "plantDot") {
                    info.innerText = entity.getAttribute("data-plant-info");
                }
            });
        }
    });

    const scene = document.querySelector("a-scene");
    const userLocation = document.getElementById('user-location');
    const plantList = document.getElementById('plant-list');

    if (!navigator.geolocation) {
        userLocation.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    navigator.geolocation.watchPosition((position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        console.log(`User Location: ${userLat}, ${userLon}`);
        userLocation.textContent = `Lat: ${userLat}, Lon: ${userLon}`;

        // Remove previous user marker (if any) to prevent duplication
        const existingUserMarker = document.getElementById("userDot");
        if (existingUserMarker) {
            existingUserMarker.remove();
        }

        // Create user marker
        const userMarker = document.createElement("a-box");
        userMarker.setAttribute("scale", "0.2 0.2 0.2");
        userMarker.setAttribute("material", "color: red");
        userMarker.setAttribute("gps-new-entity-place", `latitude: ${userLat}; longitude: ${userLon}`);
        userMarker.setAttribute("id", "userDot");
        userMarker.setAttribute("click-info-display", "");
        scene.appendChild(userMarker);

        fetch("../ABG.csv")
            .then(response => {
                if (!response.ok) throw new Error("Failed to load CSV file.");
                return response.text();
            })
            .then(csvText => {
                console.log("CSV Loaded Successfully!");
                let plants = parseCSV(csvText);
                
                plants = plants
                    .map(plant => ({
                        ...plant,
                        distance: getDistance(userLat, userLon, plant.lat, plant.lon)
                    }))
                    .filter(plant => plant.distance <= 10)
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 10);

                console.log("Nearest Plants:", plants);

                plantList.innerHTML = `Total Plants Found: ${plants.length}`;

                plants.forEach(plant => {
                    const plantMarker = document.createElement("a-box");
                    plantMarker.setAttribute("scale", "0.1 0.1 0.1");
                    plantMarker.setAttribute("material", "color: blue");
                    plantMarker.setAttribute("gps-new-entity-place", `latitude: ${plant.lat}; longitude: ${plant.lon}`);
                    plantMarker.setAttribute("id", "plantDot");
                    plantMarker.setAttribute("click-info-display", "");
                    plantMarker.setAttribute("data-plant-info", `${plant.cname1 || "N/A"} - Genus: ${plant.genus || "N/A"}, Species: ${plant.species || "N/A"} (${plant.distance.toFixed(2)}m)`);

                    // Add a text label above the plant marker
                    const textEntity = document.createElement("a-text");
                    textEntity.setAttribute("value", `${plant.cname1 || "N/A"}`);
                    textEntity.setAttribute("position", "0 0.5 0"); // Position above the box
                    textEntity.setAttribute("align", "center");
                    textEntity.setAttribute("color", "black");
                    textEntity.setAttribute("scale", "1 1 1");
                    
                    plantMarker.appendChild(textEntity);
                    scene.appendChild(plantMarker);
                });
            })
            .catch(err => console.error("Error loading CSV:", err));
    }, (error) => {
        console.error("Error obtaining geolocation:", error);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 2000 });
};

// Function to parse CSV text into an array of plant objects
function parseCSV(csvText) {
    const rows = csvText.split("\n").slice(1); // Skip header row

    return rows
        .map(row => {
            const columns = row.split(",");

            // Handle missing columns by concatenating empty strings
            while (columns.length < 9) {
                columns.push(""); // Add empty strings for missing cells
            }

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
