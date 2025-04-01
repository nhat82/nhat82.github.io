window.onload = () => {
    AFRAME.registerComponent("click-info-display", {
        init: function () {
            let entity = this.el;
            let info = document.getElementById("info");
            entity.addEventListener("click", function () {
                if (entity.id === "userDot") {
                    info.innerText = "Current User Dot";
                } else if (entity.classList.contains("plantMarker")) {
                    let plantData = entity.dataset;
                    info.innerText = `Plant Info:\nS_ID: ${plantData.s_id}\nCommon Names: ${plantData.cname1}, ${plantData.cname2}, ${plantData.cname3}\nGenus: ${plantData.genus}\nSpecies: ${plantData.species}\nCultivar: ${plantData.cultivar}`;
                }
            });
        }
    });

    
    const scene = document.querySelector("a-scene");
    const userLocation = document.getElementById('user-location');
    // const camera = document.querySelector("[gps-new-camera]");
    // const plantList = document.getElementById('plant-list');

    if (!navigator.geolocation) {
        userLocation.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    navigator.geolocation.watchPosition((position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        console.log(`User Location: ${userLat}, ${userLon}`);
        userLocation.textContent = `Lat: ${userLat}, Lon: ${userLon}`;

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

                plantList.innerHTML = "";
                plants.forEach(plant => {
                    const plantMarker = document.createElement("a-box");
                    plantMarker.setAttribute("scale", "0.1 0.1 0.1");
                    plantMarker.setAttribute("material", "color: blue");
                    plantMarker.setAttribute("gps-new-entity-place", `latitude: ${plant.lat}; longitude: ${plant.lon}`);
                    plantMarker.setAttribute("position", "0 1 0");
                    userMarker.setAttribute("id", "plantDot");
                    plantMarker.classList.add("plantMarker");
                    plantMarker.dataset.s_id = plant.s_id;
                    plantMarker.dataset.cname1 = plant.cname1;
                    plantMarker.dataset.cname2 = plant.cname2;
                    plantMarker.dataset.cname3 = plant.cname3;
                    plantMarker.dataset.genus = plant.genus;
                    plantMarker.dataset.species = plant.species;
                    plantMarker.dataset.cultivar = plant.cultivar;
                    plantMarker.setAttribute("click-info-display", "");
                    scene.appendChild(plantMarker);
                    
                    // const listItem = document.createElement('li');
                    // listItem.innerText = `${plant.cname1 || "N/A"} ${plant.cname2 || ""} ${plant.cname3 || ""} - Genus: ${plant.genus || "N/A"}, Species: ${plant.species || "N/A"}, Cultivar: ${plant.cultivar || "N/A"} (${plant.distance.toFixed(2)}m)`;
                    // plantList.appendChild(listItem);
                });
            })
            .catch(err => console.error("Error loading CSV:", err));
    }, (error) => {
        console.error("Error obtaining geolocation:", error);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 });
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