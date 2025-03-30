document.addEventListener('DOMContentLoaded', () => {
    let scene = document.querySelector('a-scene');
    let objectCount = 0; // Track the order of placed objects

    scene.addEventListener('click', (event) => {
        objectCount++; // Increment order count

        // Create the AR object at the tapped location
        const placeMarker = document.createElement('a-entity');
        placeMarker.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
        placeMarker.setAttribute('material', 'color: blue');
        placeMarker.setAttribute('gps-entity-place', `latitude: 0; longitude: 0;`); // Placeholder
        placeMarker.setAttribute('order', objectCount); // Store order

        // Wait for marker to load before setting GPS coordinates
        placeMarker.addEventListener('loaded', () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                placeMarker.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
            });
        });

        // Add click event to show placement order
        placeMarker.addEventListener('click', (ev) => {
            ev.stopPropagation();
            ev.preventDefault();

            const order = ev.target.getAttribute('order');

            // Display order in info panel
            const infoPanel = document.getElementById('info-container');
            const infoText = document.createElement('p');
            infoText.innerText = `You placed object #${order}`;
            infoPanel.appendChild(infoText);

            // Auto-remove message after 2 seconds
            setTimeout(() => {
                infoPanel.removeChild(infoText);
            }, 2000);
        });

        scene.appendChild(placeMarker);
    });
});
