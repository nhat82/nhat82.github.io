window.addEventListener("load", () => {
  // Set up camera offset.
  const camera = document.querySelector("[gps-new-camera]");
  const offset = parseFloat(localStorage.getItem("calibrationOffset") || "0");
  camera.setAttribute("gps-new-camera", {
    gpsMinDistance: 3,
    rotate: true,
    rotationOffset: offset,
  });

  // Force layout resize
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"));
    console.log("🔁 Forced layout resize");
  }, 500);

  let userMarker = null;
  let plantMarkers = {};
  let lastMarkerUpdate = 0;
  let lastLat = null, lastLon = null;
  const updateInterval = 10000;
  const scene = document.querySelector("a-scene");
  const plantInfoDisplay = document.getElementById("plant-info");

  // Optional compass smoothing
  let smoothedHeading = 0;
  window.addEventListener("deviceorientationabsolute", (e) => {
    if (e.alpha != null) {
      smoothedHeading = smoothedHeading * 0.8 + e.alpha * 0.2;
      camera.setAttribute("gps-new-camera", {
        gpsMinDistance: 3,
        rotate: true,
        rotationOffset: offset - smoothedHeading,
      });
    }
  });

  camera.addEventListener("gps-camera-update-position", (e) => {
    const userLat = e.detail.position.latitude;
    const userLon = e.detail.position.longitude;

    // Reject sudden GPS jumps
    if (lastLat && lastLon && getDistance(lastLat, lastLon, userLat, userLon) > 50) return;
    lastLat = userLat;
    lastLon = userLon;

    // Update or create red user marker
    if (!userMarker) {
      userMarker = document.createElement("a-sphere");
      userMarker.setAttribute("scale", "0.2 0.2 0.2");
      userMarker.setAttribute("material", "color: red");
      userMarker.setAttribute("class", "clickable");
      userMarker.addEventListener("click", () => {
        plantInfoDisplay.style.display = "block";
        plantInfoDisplay.innerHTML = `
          <div style="font-size: 2em; font-weight: bold;">
            Current User
          </div>
        `;
      });      
      scene.appendChild(userMarker);
    }
    userMarker.setAttribute("gps-new-entity-place", `latitude: ${userLat}; longitude: ${userLon}`);

    const now = Date.now();
    if (now - lastMarkerUpdate > updateInterval) {
      lastMarkerUpdate = now;
      updatePlantMarkers(userLat, userLon);
    }
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
          .filter((p) => p.distance <= 10)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);

        plants.forEach((plant) => {
          const heightScale = getAdjustedHeight(plant.height);
          const yPos = heightScale / 2;

          if (plantMarkers[plant.s_id]) {
            plantMarkers[plant.s_id].setAttribute(
              "gps-new-entity-place",
              `latitude: ${plant.lat}; longitude: ${plant.lon}`
            );
          } else {
            const marker = document.createElement("a-entity");
            marker.setAttribute("gltf-model", getPolyModelURL(plant.height));
            marker.setAttribute("scale", "2 2 2");
            marker.setAttribute("position", `0 ${yPos} 0`);
            // Remove this line if you're seeing jitter due to "look-at"
            // marker.setAttribute("look-at", "[gps-new-camera]");
            marker.setAttribute("gps-new-entity-place", `latitude: ${plant.lat}; longitude: ${plant.lon}`);
            marker.setAttribute("class", "clickable");

            marker.addEventListener("click", () => {
              plantInfoDisplay.style.display = "block";
              plantInfoDisplay.innerHTML = `
                <div style="font-size: 2em; font-weight: bold;">
                  Common Name: ${plant.cname2 ? plant.cname2 + ", " : ""}${plant.cname1 || "Unknown"}
                </div>
                <div style="font-size: 1em;">
                  Genus: ${plant.genus || "N/A"} &nbsp;&nbsp; Species: ${plant.species || "N/A"}
                </div>
              `;
            });

            scene.appendChild(marker);
            plantMarkers[plant.s_id] = marker;
          }
        });

        // Remove outdated markers
        for (const id in plantMarkers) {
          if (!plants.find((plant) => plant.s_id === id)) {
            scene.removeChild(plantMarkers[id]);
            delete plantMarkers[id];
          }
        }
      })
      .catch((err) => console.error("CSV load error:", err));
  }

  // Same helper functions as before
  function parseCSV(csvText) {
    const rows = csvText.split("\n").slice(1);
    return rows
      .map((row) => {
        const columns = row.split(",");
        while (columns.length < 11) columns.push("");
        return {
          s_id: columns[0]?.trim(),
          cname1: columns[1]?.trim() || "Unknown",
          cname2: columns[2]?.trim() || "",
          genus: columns[4]?.trim() || "Unknown",
          species: columns[5]?.trim() || "",
          lon: parseFloat(columns[7]) || 0,
          lat: parseFloat(columns[8]) || 0,
          height: parseFloat(columns[10]) || 1,
        };
      })
      .filter((p) => p.s_id && p.lat !== 0 && p.lon !== 0);
  }

  function getAdjustedHeight(h) {
    const mapping = {
      0.5: 0.2,
      1: 0.3,
      1.5: 0.45,
      2: 0.6,
      2.5: 0.8,
      3: 1.1,
      4.5: 1.5,
    };
    const rounded = Math.round(h * 10) / 10;
    return mapping[rounded] || 0.4;
  }

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function getPolyModelURL(h) {
    if (h <= 1) return "./models/Shrub.glb";
    else if (h > 1 && h <= 1.5) return "./models/Bush.glb";
    else if (h > 1.5 && h < 3) return "./models/SmallTree.glb";
    else if (h >= 3 && h <= 4.5) return "./models/Tree.glb";
    else return "./models/BigTree.glb";
  }
});
