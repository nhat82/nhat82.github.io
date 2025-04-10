import * as THREE from "three";
import { ARButton } from "./lib/ARButton.js";
// init three js
let container;
let camera, scene, renderer;
let controller;
let reticle, pointer;

let hitTestSource = null;
let hitTestSourceRequested = false;

let isUI = false;
let isTracked = false;
let isStarted = false;
let floater = null;
let bouncers = [];

let userLocation = { lat: 0, lon: 0 };  // User's current GPS location

// Array of plant objects loaded from CSV
let plants = []; 
fetch('../ABG.csv')  
  .then(response => response.text())
  .then(csvText => {
    console.log(csvText); 
    const plants = parseCSV(csvText);
    console.log("Successfully read csv");
  })
  .catch(error => console.error('Error loading ABG.csv:', error));



const init = () => {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
  light.position.set(0.5, 1, 1);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  document.body.appendChild(
    ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.getElementById("overlay") },
    })
  );

  window.addEventListener("deviceorientation", handleOrientation, true);

  // Get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        loadClosestPlants();
      },
      (error) => {
        console.log("Error getting location: ", error);
      }
    );
  } else {
    console.log("Geolocation not supported");
  }

  // Load plant models and display closest 5
  const onSelect = () => {
    if (isUI) {
      isUI = false;
    } else {
      if (reticle.visible) {
        const height = new THREE.Vector3().setFromMatrixPosition(
          camera.matrixWorld
        ).y;
        const pos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
        const thing = icon.split("/")[3].split(".")[0];

        let bouncer = new Bouncer(pos, height, thing);

        scene.add(bouncer.mesh);
        bouncers.push(bouncer);

        const nav = document.querySelector("nav");
        if (nav.classList.contains("hidden")) nav.classList.remove("hidden");
      }
    }
  };

  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  reticle = new THREE.Mesh(
    new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;

  pointer = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.02),
    new THREE.MeshLambertMaterial({ color: 0xcccccc })
  );
  pointer.visible = false;

  scene.add(pointer);
  scene.add(reticle);

  window.addEventListener("resize", onWindowResize, false);

  // Initial splash screen setup
  loadMesh(glbSrc.duck).then((mesh) => {
    scene.background = new THREE.Color(0x000000);
    floater = mesh.clone();
    floater.scale.copy(new THREE.Vector3(0.03, 0.03, 0.03));
    floater.rotation.set(0, 0, 0);
    floater.position.set(0, -0.7, -0.7);
    camera.lookAt(floater.position);
    scene.add(floater);
    camera.position.set(0, -0.38, 0);
    document.querySelector(".cool-stuff").classList.remove("hidden");
    document.querySelector(".loader").classList.add("hidden");
    document.querySelector("#ARButton").style.visibility = "visible";
  });

  preload().then(() => {
    console.log("models loaded!");
  });
};

// Function to load the closest plants and render their models
const loadClosestPlants = () => {
  // Get 5 closest plants
  const closestPlants = getClosestPlants(userLocation.lat, userLocation.lon, plants, 5);

  closestPlants.forEach((plant) => {
    loadMesh(`./plants_media/tree.glb`).then((mesh) => {
      // Position the plant model at its GPS coordinates (converted to 3D world coordinates)
      const position = latLonTo3D(plant.lat, plant.lon);
      mesh.position.set(position.x, 0, position.z); // Assuming flat ground (y = 0)

      // Add the plant model to the scene
      scene.add(mesh);

      // Add an event listener to display plant info when clicked
      mesh.on('click', () => {
        displayPlantInfo(plant);
      });
    });
  });
};

// Function to calculate distance between two GPS points
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to find the closest plants to the user's location
function getClosestPlants(lat, lon, plants, n) {
  const plantsWithDistance = plants.map((plant) => {
    const distance = getDistance(lat, lon, plant.lat, plant.lon);
    return { plant, distance };
  });

  plantsWithDistance.sort((a, b) => a.distance - b.distance);
  return plantsWithDistance.slice(0, n).map((item) => item.plant);
}

// Function to convert lat/lon to 3D world coordinates (basic transformation)
function latLonTo3D(lat, lon) {
  const scale = 0.1;  // Scale factor for transforming GPS coordinates to 3D space
  const x = (lon - userLocation.lon) * scale;
  const z = (lat - userLocation.lat) * scale;
  return { x, z };
}

// Function to display the plant's information
function displayPlantInfo(plant) {
  const infoPanel = document.querySelector(".info-panel");
  infoPanel.innerHTML = `
    <h2>${plant.cname1}</h2>
    <p>Genus: ${plant.genus}</p>
    <p>Species: ${plant.species}</p>
    <p>Location: (${plant.lat}, ${plant.lon})</p>
  `;
  infoPanel.classList.remove("hidden");
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (!isStarted) {
    if (floater !== null)
      floater.rotation.set(
        deviceRotation.x * 0.02 - 45,
        (floater.rotation.y += 0.015),
        0
      );
  } else {
    if (floater !== null) {
      scene.remove(floater);
      camera.position.set(0, 0, 0);
      floater = null;
      window.removeEventListener("deviceorientation", handleOrientation, true);
    }
    if (frame) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const session = renderer.xr.getSession();

      if (hitTestSourceRequested === false) {
        session.requestReferenceSpace("viewer").then(function (referenceSpace) {
          session
            .requestHitTestSource({ space: referenceSpace })
            .then(function (source) {
              hitTestSource = source;
            });
        });

        session.addEventListener("end", function () {
          hitTestSourceRequested = false;
          hitTestSource = null;
        });

        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length) {
          const hit = hitTestResults[0];
          reticle.visible = true;
          pointer.visible = true;
          reticle.matrix.fromArray(
            hit.getPose(referenceSpace).transform.matrix
          );
          const reticlePos = new THREE.Vector3().setFromMatrixPosition(
            reticle.matrix
          );
          const cameraPos = new THREE.Vector3().setFromMatrixPosition(
            camera.matrixWorld
          );

          pointer.position.copy(reticlePos);
          pointer.position.y = cameraPos.y;

          if (!isTracked) {
            isTracked = true;
            toggleHints();
            document.querySelector(".subhint").classList.remove("hidden");
            window.setTimeout(() => {
              document.querySelector(".subhint").remove();
            }, 8000);
          }
        } else {
          reticle.visible = false;
          pointer.visible = false;
        }
      }
    }

  }

  renderer.render(scene, camera);
}


// Handle window resize event
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleOrientation(event) {
  var absolute = event.absolute;
  var alpha = event.alpha;
  var beta = event.beta;
  var gamma = event.gamma;

  deviceRotation.x = beta;
  deviceRotation.y = gamma;
  deviceRotation.z = alpha;
}

function preload() {
  // Preload models (implement your preload logic here)
  return Promise.resolve();
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


// Run initialization
init();
animate();





