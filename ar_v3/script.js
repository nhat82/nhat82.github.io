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

    let userMarkerAdded = false;
    const scene = document.querySelector("a-scene");
    const userLocation = document.getElementById('user-location');
    const camera = document.querySelector("[gps-new-camera]");
    const plantList = document.getElementById('plant-list');

    if (!navigator.geolocation) {
        userLocation.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    camera.addEventListener("gps-camera-update-position", (e) => {
        if (!e.detail.position) {
            console.warn("No position data received.");
            return;
        }
        
        const userLat = e.detail.position.latitude;
        const userLon = e.detail.position.longitude;
        console.log(`User Location: ${userLat}, ${userLon}`);
        userLocation.textContent = `Lat: ${userLat}, Lon: ${userLon}`;

        if (!userMarkerAdded) {
            const userMarker = document.createElement("a-box");
            userMarker.setAttribute("scale", "1 1 1");
            userMarker.setAttribute("material", "color: red");
            userMarker.setAttribute("gps-new-entity-place", `latitude: ${userLat}; longitude: ${userLon}`);
            userMarker.setAttribute("id", "userDot");
            userMarker.setAttribute("click-info-display", "");
            scene.appendChild(userMarker);
            userMarkerAdded = true;
        }

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
                    plantMarker.setAttribute("scale", "1 1 1");
                    plantMarker.setAttribute("material", "color: blue");
                    plantMarker.setAttribute("gps-new-entity-place", `latitude: ${plant.lat}; longitude: ${plant.lon}`);
                    plantMarker.setAttribute("position", "0 1 0");
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
                    
                    const listItem = document.createElement('li');
                    listItem.innerText = `${plant.cname1 || "N/A"} ${plant.cname2 || ""} ${plant.cname3 || ""} - Genus: ${plant.genus || "N/A"}, Species: ${plant.species || "N/A"}, Cultivar: ${plant.cultivar || "N/A"} (${plant.distance.toFixed(2)}m)`;
                    plantList.appendChild(listItem);
                });
            })
            .catch(err => console.error("Error loading CSV:", err));
    });
};
