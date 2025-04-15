const videoElement = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fruits = [];
let score = 0;
let slashTrail = [];

function spawnFruit() {
  const x = Math.random() * canvas.width;
  const y = canvas.height + 20;
  const speedY = -10 - Math.random() * 5;
  const speedX = (Math.random() - 0.5) * 8;
  fruits.push({ x, y, vx: speedX, vy: speedY, radius: 30, sliced: false });
}

function drawFruit(fruit) {
  ctx.beginPath();
  ctx.fillStyle = fruit.sliced ? "red" : "orange";
  ctx.arc(fruit.x, fruit.y, fruit.radius, 0, Math.PI * 2);
  ctx.fill();
}

function updateFruits() {
  fruits.forEach(fruit => {
    fruit.x += fruit.vx;
    fruit.y += fruit.vy;
    fruit.vy += 0.5; // gravity
  });
  fruits = fruits.filter(f => f.y < canvas.height + 40);
}

function drawSlashTrail() {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i < slashTrail.length - 1; i++) {
    ctx.moveTo(slashTrail[i].x, slashTrail[i].y);
    ctx.lineTo(slashTrail[i + 1].x, slashTrail[i + 1].y);
  }
  ctx.stroke();
}

function detectCollisions(handX, handY) {
  fruits.forEach(fruit => {
    const dx = fruit.x - handX;
    const dy = fruit.y - handY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < fruit.radius && !fruit.sliced) {
      fruit.sliced = true;
      score++;
      console.log("Sliced! Score:", score);
    }
  });
}

// ---- Hand Tracking with MediaPipe ---- //
const hands = new Hands({locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
});

hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateFruits();
  fruits.forEach(drawFruit);

  if (results.multiHandLandmarks.length > 0) {
    const indexTip = results.multiHandLandmarks[0][8];
    const x = indexTip.x * canvas.width;
    const y = indexTip.y * canvas.height;
    slashTrail.push({ x, y });
    if (slashTrail.length > 10) slashTrail.shift();
    detectCollisions(x, y);
  }
  
  drawSlashTrail();
});

// ---- Camera Setup ---- //
const camera = new Camera(videoElement, {
  onFrame: async () => await hands.send({image: videoElement}),
  width: 640,
  height: 480
});
camera.start();

// ---- Game Loop ---- //
setInterval(() => {
  if (Math.random() < 0.1) spawnFruit();
}, 300);
