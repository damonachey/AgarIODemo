import "./styles.css";

const gridWidth = 20;
const width = 800;
const height = 800;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = width;
canvas.height = height;

let foods = [];
const players = [];
let current = 1;

let lastRender = 0;

window.onkeypress = e => {
  if (e.key >= "1" && e.key <= "9") {
    current = parseInt(e.key, 10);
  }
};

canvas.onclick = changeDirection;
canvas.ontouchstart = e =>
  changeDirection({ x: e.touches[0].clientX, y: e.touches[0].clientY });

function changeDirection(e) {
  const player = players[current - 1];

  player.a = getAngleRad(player, e);

  const d = Math.abs(distance(player, e));
  player.v = d < player.r ? 0 : 1;
}

initialize();
window.requestAnimationFrame(loop);

function initialize() {
  while (foods.length < 50) foods.push(randomFood());

  players.push({
    c: "#0000ff",
    x: random(0, width),
    y: random(0, height),
    r: 15,
    a: Math.random() * 2 * Math.PI,
    v: 1
  });
  players.push({
    c: "#ff0000",
    x: random(0, width),
    y: random(0, height),
    r: 15,
    a: Math.random() * 2 * Math.PI,
    v: 1
  });
  players.push({
    c: "#00ff00",
    x: random(0, width),
    y: random(0, height),
    r: 15,
    a: Math.random() * 2 * Math.PI,
    v: 1
  });
}

function loop(timestamp) {
  if (!lastRender) lastRender = timestamp;

  let progress = timestamp - lastRender;

  update(progress);
  draw();

  lastRender = timestamp;

  window.requestAnimationFrame(loop);
}

function update(progress) {
  for (const player of players) {
    let dx = (player.v * Math.cos(player.a) * progress) / (20 + player.r);
    let dy = (player.v * Math.sin(player.a) * progress) / (20 + player.r);

    if (
      dx + player.x + player.r / 3 > canvas.width ||
      dx + player.x - player.r / 3 < 0
    ) {
      player.a = Math.PI - player.a;
      dx = -dx / 3;
    }

    if (
      dy + player.y + player.r / 3 > canvas.height ||
      dy + player.y - player.r / 3 < 0
    ) {
      player.a = 2 * Math.PI - player.a;
      dy = -dy / 3;
    }

    player.x += dx;
    player.y += dy;

    for (let i = 0; i < foods.length; i++)
      if (distance(foods[i], player) < player.r - foods[i].r / 3) {
        player.r += 1;

        foods.splice(i, 1);
        i--;

        foods.push(randomFood());
      }
  }

  for (let i = 0; i < players.length; i++) {
    for (let j = 0; j < players.length; j++) {
      if (i !== j) {
        if (
          distance(players[i], players[j]) < players[i].r - players[j].r / 3 &&
          players[i].r > players[j].r + 10
        ) {
          console.log("eating !");
          players[i].r += players[j].r;
          players.splice(j, 1);
          j--;
          current = 1;
        }
      }
    }
  }
}

function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function getAngleRad(p1, p2) {
  // returns the angle between 2 points in radians
  // p1 = {x: 1, y: 2};
  // p2 = {x: 3, y: 4};
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function draw() {
  drawGrid();

  for (const food of foods) drawCircle(food.c, food.x, food.y, food.r);

  for (const player of players.concat().sort((f, s) => (f.r > s.r ? 1 : -1)))
    drawCircle(player.c, player.x, player.y, player.r, player.name);
}

function randomFood() {
  const c = randomFoodColor();
  const x = random(0, width);
  const y = random(0, height);
  const r = 6;

  return { c, x, y, r };
}

function randomFoodColor() {
  const min = 50;
  const max = 150;

  let r = random(min, max);
  let g = random(min, max);
  let b = random(min, max);

  r = ("00" + r.toString(16)).slice(-2);
  g = ("00" + g.toString(16)).slice(-2);
  b = ("00" + b.toString(16)).slice(-2);

  return `#${r}${g}${b}`;
}

function random(from, to) {
  return from + Math.floor(Math.random() * (to - from));
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;

  for (let i = 0; i < height * gridWidth; i += gridWidth) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width * gridWidth, i);
    ctx.stroke();
  }

  for (let i = 0; i < width * gridWidth; i += gridWidth) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, width * gridWidth);
    ctx.stroke();
  }
}

function drawCircle(c, x, y, r, text) {
  ctx.beginPath();

  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = c;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = colorShift(c, -30);
  ctx.stroke();

  if (text) {
    ctx.fillStyle = "#ffffff";
    ctx.font = fontFitSize("arial", 1.5 * r, text);

    const twidth = ctx.measureText(text).width;
    const theight = ctx.measureText("o").width;

    ctx.fillText(text, x - twidth / 2, y + theight / 2, 2 * r);
  }
}

function fontFitSize(type, maxSize, text) {
  let size = 2;
  let twidth = 0;

  do {
    ctx.font = `${size}px ${type}`;
    twidth = ctx.measureText(text).width;
    size += 2;
  } while (twidth < maxSize);

  ctx.font = `${size - 2}px ${type}`;
}

function colorShift(color, degree) {
  color = color.replace("#", "");

  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  r = Math.min(255, Math.max(0, r + degree));
  g = Math.min(255, Math.max(0, g + degree));
  b = Math.min(255, Math.max(0, b + degree));

  r = ("00" + r.toString(16)).slice(-2);
  g = ("00" + g.toString(16)).slice(-2);
  b = ("00" + b.toString(16)).slice(-2);

  return `#${r}${g}${b}`;
}
