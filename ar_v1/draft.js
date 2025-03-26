window.onload = () => {
    let testEntityAdded = false;
    const userLocation = document.getElementById('user-location');
    const el = document.querySelector("[gps-new-camera]");

    el.addEventListener("gps-camera-update-position", e => {
        if(!testEntityAdded) {
            userLocation.textContent = `lat ${e.detail.position.latitude},lon ${e.detail.position.longitude}`;
            // box for current user's location
            const entity = document.createElement("a-box");
            entity.setAttribute("scale", {x: 10, y: 10,z: 10});
            entity.setAttribute('material', { color: 'yellow' } );
            entity.setAttribute('gps-new-entity-place', {
                latitude: e.detail.position.latitude,
                longitude: e.detail.position.longitude
            });
            document.querySelector("a-scene").appendChild(entity);
        }
        testEntityAdded = true;
    });
};