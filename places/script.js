function loadPlaces() {
    return [
        { name: 'Place One', latitude: 38.989593, longitude: -76.935990, link: 'https://maps.umd.edu/abg/' }
    ];
}

window.onload = () => {
    const scene = document.querySelector('a-scene');
    const userLocation = document.getElementById('user-location');

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            userLocation.textContent = `Lat: ${userLat.toFixed(6)}, Lon: ${userLon.toFixed(6)}`;
            console.log("User Location:", userLat, userLon);

            const userDot = document.getElementById('user-dot');
            userDot.setAttribute('gps-entity-place', `latitude: ${userLat}; longitude: ${userLon};`);

            const places = loadPlaces();
            places.forEach((place) => {
                const placeText = document.createElement('a-link');
                placeText.setAttribute('gps-entity-place', `latitude: ${userLat}; longitude: ${userLon};`);
                placeText.setAttribute('title', place.name);
                placeText.setAttribute('scale', '15 15 15');
                placeText.setAttribute('href', place.link);
                placeText.setAttribute('target', '_blank');
                
                placeText.addEventListener('loaded', () => {
                    window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
                });
                
                scene.appendChild(placeText);
            });
        },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};
