window.onload = () => {
    let userMarkerAdded = false;
    const scene = document.querySelector("a-scene");
    const userLocation = document.getElementById('user-location');
    // const camera = document.querySelector("[gps-new-camera]");
    const plantList = document.getElementById('plant-list');

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            userLocation.textContent = `Lat: ${userLat.toFixed(6)}, Lon: ${userLon.toFixed(6)}`;
            console.log("User Location:", userLat, userLon);

            const userDot = document.getElementById('user-dot');
            userDot.setAttribute('gps-entity-place', `latitude: ${userLat}; longitude: ${userLon};`);
            userDot.addEventListener('click', function (evt) {
                console.log('Current user lala');
              });

            fetch('ABG_Database_101124wSID_cleaned_112824_wHornbake.csv')
                .then(response => response.text())
                .then(csvText => {
                    console.log("CSV Loaded Successfully!");
                    let places = parseCSV(csvText);

                    // Filter & sort plants by distance
                    places = places
                        .map(place => ({
                            ...place,
                            distance: getDistance(userLat, userLon, place.lat, place.lon)
                        }))
                        .filter(place => place.distance <= 10) // Only within 10 meters
                        .sort((a, b) => a.distance - b.distance) // Sort nearest first
                        .slice(0, 10); // Pick the closest 10

                    console.log("Nearest Plants:", places);

                    places.forEach(place => {
                        // Add AR markers
                        const placeMarker = document.createElement('a-entity');
                        placeMarker.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
                        placeMarker.setAttribute('material', 'color: blue');
                        placeMarker.setAttribute('gps-entity-place', `latitude: ${place.lat}; longitude: ${place.lon};`);
                        placeMarker.addEventListener('click', () => {
                            alert(`Plant Details:
                                s_id: ${place.s_id}
                                cname1: ${place.cname1 || "N/A"}
                                cname2: ${place.cname2 || "N/A"}
                                cname3: ${place.cname3 || "N/A"}
                                Genus: ${place.genus || "N/A"}
                                Species: ${place.species || "N/A"}
                                Cultivar: ${place.cultivar || "N/A"}`);
                        });
                        
                        scene.appendChild(placeMarker);

                        // Add to list in UI
                        const listItem = document.createElement('li');
                        
                        listItem.innerText = `${place.cname1 || "N/A"} ${place.cname2 || "N/A"} ${place.cname3 || "N/A"} Genus: ${place.genus || "N/A"} Species: ${place.species || "N/A"} Cultivar: ${place.cultivar || "N/A"} (${place.distance.toFixed(2)}m) ${place.lat},${place.lon}`;
                        plantList.appendChild(listItem);
                    });
                })
                .catch(err => console.error('Error loading CSV:', err));
        },
        (error) => {
            console.error("Geolocation error:", error.message);
            userLocation.textContent = "Location unavailable";
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000
        }
    );
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