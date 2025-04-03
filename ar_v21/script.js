window.onload = () => {
    // DOM Elements
    const calibrationPanel = document.getElementById('calibration-panel');
    const infoContainer = document.getElementById('info-container');
    const calibrationHeadingDisplay = document.getElementById('calibration-heading');
    const calibrateBtn = document.getElementById('calibrate-btn');
    const recalibrateBtn = document.getElementById('recalibrate-btn');
    const userLocationElement = document.getElementById('user-location');
    const headingElement = document.getElementById('heading');
    const selectedPlantInfoElement = document.getElementById('selected-plant-info');
    const plantListElement = document.getElementById('plant-list');
    const compassNeedle = document.getElementById('compass-needle');
    const infoCompassNeedle = document.getElementById('info-compass-needle');

    // State variables
    let currentHeading = 0;
    let currentPosition = null;
    let plants = [];

    // Initialize the application - immediately, not with another event listener
    initializeApp();

    function initializeApp() {
        console.log('🚀 Initializing app...');
        
        // Set up orientation tracking for the calibration compass
        // Wait for A-Frame to be ready
        const scene = document.querySelector('a-scene');
        
        if (scene.hasLoaded) {
            console.log('✅ A-Frame scene already loaded');
            setupAfterSceneLoaded();
        } else {
            console.log('⏳ Waiting for A-Frame scene to load...');
            scene.addEventListener('loaded', setupAfterSceneLoaded);
        }

        // Set up orientation tracking for the compass
        if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientationabsolute", handleOrientation, true);
        } else {
            console.error("❌ Device Orientation API not supported.");
        }
        
        // Set up button event listeners
        calibrateBtn.addEventListener('click', completeCalibration);
        recalibrateBtn.addEventListener('click', showCalibration);
        
        // Start getting user's location
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(updatePosition, handleLocationError, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
        } else {
            console.error('❌ Geolocation not supported by this browser');
            userLocationElement.textContent = 'Location: Not available (Geolocation not supported)';
        }
    }



    function handleOrientation(event) {
        if (event.absolute && event.alpha !== null) {
            let heading = (360 - event.alpha + compassOffset) % 360;
            currentHeading = heading;

            updateCompassUI();
        }
    }

    function updateCompassUI() {
        if (calibrationHeadingDisplay) {
            calibrationHeadingDisplay.textContent = `Current Heading: ${Math.round(currentHeading)}°`;
        }
        if (compassNeedle) {
            compassNeedle.style.transform = `rotate(${currentHeading}deg)`;
        }
        if (infoCompassNeedle) {
            infoCompassNeedle.style.transform = `rotate(${currentHeading}deg)`;
        }
        if (headingElement) {
            headingElement.textContent = `Heading: ${Math.round(currentHeading)}°`;
        }
    }


    function completeCalibration() {
        compassOffset = (360 - currentHeading) % 360;
        localStorage.setItem('compassOffset', compassOffset);
        console.log('✅ Calibration complete. Offset:', compassOffset);
        calibrationPanel.style.display = 'none';
        infoContainer.style.display = 'block';
    }

    function showCalibration() {
        calibrationPanel.style.display = 'flex';
        infoContainer.style.display = 'none';
    }

    function updatePosition(position) {
        currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        userLocationElement.textContent = `Location: ${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}`;
    }

    function handleLocationError(error) {
        console.error('❌ Location error:', error);
        userLocationElement.textContent = `Location error: ${error.message}`;
    }



    function setupAfterSceneLoaded() {
        console.log('🎬 A-Frame scene loaded, setting up camera and orientation tracking');
        
        // Set up camera with any existing calibration
        const camera = document.querySelector('a-camera');
        if (!camera) {
            console.error('❌ Camera element not found');
            return;
        }
        
        const existingOffset = parseFloat(localStorage.getItem('calibrationOffset') || '0');
        camera.setAttribute('gps-new-camera', {
            gpsMinDistance: 5,
            rotate: true,
            rotationOffset: existingOffset
        });
        console.log('✅ Applied rotationOffset from calibration:', existingOffset);
        
        // Set up the orientation tracking for both compasses
        // Use the tick event instead of frame for more reliable updates
        const scene = document.querySelector('a-scene');
        scene.addEventListener('tick', updateOrientation);
        
        // Force layout reflow
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            console.log('🔁 Forced layout resize');
        }, 500);
    }

    function updateOrientation() {
        try {
            const camera = document.querySelector('a-camera');
            if (!camera) return;
            
            const rot = camera.getAttribute('rotation');
            if (!rot) return;
            
            currentHeading = rot.y;
            
            // Update calibration compass
            if (calibrationHeadingDisplay) {
                calibrationHeadingDisplay.textContent = `Current Heading: ${Math.round(currentHeading)}°`;
            }
            
            if (compassNeedle) {
                compassNeedle.style.transform = `rotate(${currentHeading}deg)`;
            }
            
            // Update info panel compass
            if (headingElement) {
                headingElement.textContent = `Heading: ${Math.round(currentHeading)}°`;
            }
            
            if (infoCompassNeedle) {
                infoCompassNeedle.style.transform = `rotate(${currentHeading}deg)`;
            }
        } catch (e) {
            console.error('Error updating orientation:', e);
        }
    }

    function completeCalibration() {
        const offset = (360 - currentHeading + 360) % 360;
        localStorage.setItem('calibrationOffset', offset);
        console.log('✅ Saved calibration offset:', offset);
        
        // Apply the new offset to the camera
        const camera = document.querySelector('a-camera');
        camera.setAttribute('gps-new-camera', {
            gpsMinDistance: 5,
            rotate: true,
            rotationOffset: offset
        });
        
        // Hide calibration panel and show info container
        calibrationPanel.style.display = 'none';
        infoContainer.style.display = 'block';
        
        // Force layout reflow after switching views
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        
        // Load plants after calibration if we have position
        if (currentPosition) {
            loadPlantsFromCSV();
        }
    }

    function showCalibration() {
        calibrationPanel.style.display = 'flex';
        infoContainer.style.display = 'none';
    }

    function updatePosition(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        currentPosition = { lat, lng };
        userLocationElement.textContent = `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${accuracy.toFixed(1)}m)`;
        
        // If calibration is complete (info container is visible), load plants
        if (infoContainer.style.display === 'block') {
            loadPlantsFromCSV();
        }
    }

    function handleLocationError(error) {
        console.error('❌ Location error:', error);
        userLocationElement.textContent = `Location error: ${error.message}`;
    }

    function loadPlantsFromCSV() {
        if (!currentPosition) {
            console.error("❌ Can't load plants: No position available");
            return;
        }
        
        const userLat = currentPosition.lat;
        const userLon = currentPosition.lng;
        
        fetch("../ABG.csv")
            .then(response => {
                if (!response.ok) throw new Error("Failed to load CSV file.");
                return response.text();
            })
            .then(csvText => {
                console.log("✅ CSV Loaded Successfully!");
                plants = parseCSV(csvText);

                plants = plants
                    .map(plant => ({
                        ...plant,
                        distance: getDistance(userLat, userLon, plant.lat, plant.lon)
                    }))
                    .filter(plant => plant.distance <= 10)  // Plants within 10m
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 10);  // Show top 10 closest plants

                console.log("🌱 Nearest Plants:", plants);
                
                // Clear existing plants/markers
                clearExistingPlantMarkers();
                
                // Update the info panel
                updatePlantsList();
                
                // Create AR markers for plants
                createPlantMarkers();
            })
            .catch(err => {
                console.error("❌ Error loading CSV:", err);
                selectedPlantInfoElement.innerHTML = `<p>Error loading plant data: ${err.message}</p>`;
            });
    }

    function parseCSV(csvText) {
        const rows = csvText.split("\n").slice(1); // Skip header row

        return rows
            .map(row => {
                const columns = row.split(",");

                while (columns.length < 9) columns.push(""); // Handle missing columns

                return {
                    s_id: columns[0]?.trim(),
                    cname1: columns[1]?.trim() || "Unknown",
                    cname2: columns[2]?.trim() || "",
                    cname3: columns[3]?.trim() || "",
                    genus: columns[4]?.trim() || "Unknown",
                    species: columns[5]?.trim() || "",
                    cultivar: columns[6]?.trim() || "",
                    lon: parseFloat(columns[7]) || 0,
                    lat: parseFloat(columns[8]) || 0
                };
            })
            .filter(plant => plant.s_id && plant.lat !== 0 && plant.lon !== 0);
    }

    function getDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for distance calculation
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function clearExistingPlantMarkers() {
        // Remove existing plant markers
        const existingMarkers = document.querySelectorAll('[id^="plantDot-"]');
        existingMarkers.forEach(marker => {
            if (marker.parentNode) {
                marker.parentNode.removeChild(marker);
            }
        });
    }

    function createPlantMarkers() {
        const scene = document.querySelector('a-scene');
        
        plants.forEach(plant => {
            console.log(`🌿 Creating marker for plant: ${plant.cname1}, Lat: ${plant.lat}, Lon: ${plant.lon}`);

            const plantMarker = document.createElement("a-box");
            plantMarker.setAttribute("scale", "0.5 0.5 0.5");
            plantMarker.setAttribute("material", "color: blue");
            plantMarker.setAttribute("gps-new-entity-place", `latitude: ${plant.lat}; longitude: ${plant.lon}`);
            plantMarker.setAttribute("id", `plantDot-${plant.s_id}`); // Unique ID
            
            // Add click event to show plant info
            plantMarker.addEventListener('click', () => {
                displayPlantInfo(plant);
            });
            
            scene.appendChild(plantMarker);
        });

        // Add some points of interest with red markers if needed
        addPointsOfInterest();
    }

    function addPointsOfInterest() {
        if (!currentPosition) return;
    
        const scene = document.querySelector('a-scene');
    
        // Remove existing user location marker if any
        const existingUserMarker = document.getElementById("user-location-marker");
        if (existingUserMarker) {
            existingUserMarker.parentNode.removeChild(existingUserMarker);
        }
    
        // Create a new marker for the user's current location
        const userMarker = document.createElement("a-sphere");
        userMarker.setAttribute("scale", "0.2 0.2 0.2");
        userMarker.setAttribute("material", "color: yellow");
        userMarker.setAttribute("gps-new-entity-place", `latitude: ${currentPosition.lat}; longitude: ${currentPosition.lng}`);
        userMarker.setAttribute("id", "user-location-marker");
    
        scene.appendChild(userMarker);
    }
    

    function updatePlantsList() {
        // Update count and list in UI
        plantListElement.innerHTML = '';
        
        if (plants.length === 0) {
            plantListElement.innerHTML = '<li>No plants found nearby</li>';
            return;
        }
        
        plants.forEach(plant => {
            const li = document.createElement('li');
            li.className = 'plant-item';
            li.textContent = `${plant.cname1} (${plant.distance.toFixed(1)}m)`;
            
            li.addEventListener('click', () => {
                displayPlantInfo(plant);
            });
            
            plantListElement.appendChild(li);
        });
    }

    function displayPlantInfo(plant) {
        selectedPlantInfoElement.innerHTML = `
            <h4>${plant.cname1}</h4>
            ${plant.cname2 ? `<p>Also known as: ${plant.cname2}</p>` : ''}
            <p>Scientific name: <i>${plant.genus} ${plant.species}</i>${plant.cultivar ? ` '${plant.cultivar}'` : ''}</p>
            <p>Distance: ${plant.distance.toFixed(1)}m</p>
            <p>ID: ${plant.s_id}</p>
        `;
    }
};