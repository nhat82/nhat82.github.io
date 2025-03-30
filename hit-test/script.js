window.onload = () => {
    const scene = document.querySelector('a-scene');
    const userLocation = document.getElementById('user-location');
    const plantList = document.getElementById('plant-list');

    // Watch the user's position continuously
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            userLocation.textContent = `Lat: ${userLat.toFixed(6)}, Lon: ${userLon.toFixed(6)}`;
            console.log("User Location:", userLat, userLon);

            const userDot = document.getElementById('user-dot');
            userDot.setAttribute('gps-entity-place', `latitude: ${userLat}; longitude: ${userLon};`);
            // userDot.addEventListener('click', (ev) => {
            //     ev.stopPropagation();
            //     ev.preventDefault();
        
            //     const el = ev.detail?.intersection?.object?.el;
            //     if (el && el === ev.target) {
            //         // Create and display a label with plant details
            //         const container = document.createElement('div');
            //         container.setAttribute('id', 'plant-label');
            //         container.style.position = 'absolute';
            //         container.style.top = '50%';
            //         container.style.left = '50%';
            //         container.style.transform = 'translate(-50%, -50%)';
            //         container.style.background = 'rgba(0, 0, 0, 0.7)';
            //         container.style.color = 'white';
            //         container.style.padding = '10px';
            //         container.style.borderRadius = '5px';
            //         container.style.fontSize = '14px';
            //         container.style.textAlign = 'center';
            //         container.style.zIndex = '1000';
        
            //         container.innerText = `User Clicked`;
            //     }});
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