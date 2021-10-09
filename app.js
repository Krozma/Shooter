const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const W = window.innerWidth;
const H = window.innerHeight;
const w = 50;
const h = 64;
const bullets = [];
const redBullets = [];
const bulletsSpeed = 20;
const redTankPx = document.getElementById("RedTank");
const redBulletPx = document.getElementById("RedBullet");
const tankPx = document.getElementById("Tank");
const greenBulletPx = document.getElementById("GreenBullet");
const blueTankPx = document.getElementById("BlueTank");
const blueBulletPx = document.getElementById("BlueBullet");
const purpleTankPx = document.getElementById("PurpleTank");
const purpleBulletPx = document.getElementById("PurpleBullet");

let score = 0;
const exp = [
  document.getElementById("exp1"),
  document.getElementById("exp2"),
  document.getElementById("exp3"),
  document.getElementById("exp4"),
  document.getElementById("exp5"),
  document.getElementById("exp6"),
  document.getElementById("exp7"),
];

const gameTime = 60;
const tanks = [
  {
    tank: redTankPx,
    bullet: redBulletPx,
    points: 60,
  },
  {
    tank: blueTankPx,
    bullet: blueBulletPx,
    points: 100,
  },
  {
    tank: purpleTankPx,
    bullet: purpleBulletPx,
    points: 200,
  },
];

const tankStates = {
  Alive: "Alive",
  Hit: "Hit",
  Exploding: "Exploding",
  Exploded: "Exploded",
  Dead: "Dead",
};

const gameStates = {
  NotStarted: "not started",
  Running: "running",
  GameStopped: "game stopped",
};

let time;
let state = gameStates.NotStarted;
canvas.width = W - 8;
canvas.height = H - 6;

function run() {
  if (state != gameStates.Running) {
    setStartButton();
    return;
  }
  clear();
  drawEnemyTanks();
  drawPlayerOne();
  drawBullet();
  requestAnimationFrame(run);
  bulletHitTests();
  drawExplosions();
  drawScore();
  tankHitTests();
  setTimer();
  replaceDeadTanks();
}
requestAnimationFrame(run);

function setTimer() {
  let seconds = gameTime - (new Date() - time) / 1000;
  seconds = Math.round(seconds * 100) / 100;
  if (seconds <= 0 || state == gameStates.GameStopped) {
    state = gameStates.GameStopped;
    seconds = 0;
    document.getElementById("game-over").style.display = "block";
  }
  document.getElementById("time").innerText = seconds;
}

function setStartButton() {
  document.getElementById("start-button").style.display = "block";
  if (state == gameStates.GameStopped) {
    document.getElementById('game-over').style.display = 'block';
    return;
  }
}

function startGame() {
  document.getElementById("game-over").style.display = "none";
  document.getElementById("start-button").style.display = "none";
  state = gameStates.Running;
  time = new Date();
  run();
}

function drawScore() {
  document.getElementById("score").innerText = score;
}

function clear() {
  canvas.width = W;
  canvas.height = H;
}

function drawExplosions() {
  enemyTanks.forEach((tank) => drawExplosion(tank));
}

function replaceDeadTanks() {
  for (let i = 0; i < enemyTanks.length; i++) {
    if (enemyTanks[i].state === tankStates.Dead) {
      enemyTanks.splice(i, 1, getNewTank());
    }
  }
}

function drawExplosion(tank) {
  if (tank.expId == 0) {
    return;
  }
  const ix = tank.x;
  const iy = tank.y;
  const iw = 90;
  const ih = 60;
  tank.exploding = true;
  ctx.drawImage(exp[tank.expId - 1], ix - iw / 2, iy - ih / 2, iw, ih);
}

function explode(tank) {
  if (tank.expId > 6) {
    tank.state = tankStates.Dead;
    tank.expId = 0;
    if (tank.tank.tank == tankPx) {
      state = gameStates.GameStopped;
    }
    return;
  }
  if (tank.expId == 1) {
    tank.state = tankStates.Exploding;
  }
  if (tank.expId == 4) {
    tank.state = tankStates.Exploded;
  }
  tank.expId++;
  setTimeout(function () {
    explode(tank);
  }, 100);
}

function drawEnemyTanks() {
  enemyTanks.forEach((tank) => drawEnemyTank(tank));
}

function drawEnemyTank(tank) {
  const rads = (tank.rotation * Math.PI) / 180;
  if (tank.state == tankStates.Alive) {
    tank.x += Math.sin(rads) * tank.speed;
    tank.y -= Math.cos(rads) * tank.speed;
  }
  switch (tank.state) {
    case tankStates.Alive:
    case tankStates.Hit:
    case tankStates.Exploding:
      drawAndRotate(tank, w, h, tank.tank.tank);
      break;
  }

  if (
    tank.x < w / 2 ||
    tank.x > W - w / 2 ||
    tank.y < h / 2 ||
    tank.y > H - h / 2
  ) {
    tank.state = tankStates.Dead;
  }
}

function drawPlayerOne() {
  if (
    playerOne.state == tankStates.Exploded ||
    playerOne.state == tankStates.Dead
  ) {
    return;
  }
  const rads = (playerOne.rotation * Math.PI) / 180;
  if (playerOne.state == tankStates.Alive) {
    playerOne.x += Math.sin(rads) * playerOne.speed;
    playerOne.y -= Math.cos(rads) * playerOne.speed;
  }

  // prevent player to exit the screen
  if (playerOne.x < w / 2) {
    playerOne.x = W - w / 2;
  }
  if (playerOne.x > W - w / 2) {
    playerOne.x = w / 2;
  }
  if (playerOne.y < h / 2) {
    playerOne.y = H - h / 2;
  }
  if (playerOne.y > H - h / 2) {
    playerOne.y = h / 2;
  }

  drawAndRotate(playerOne, w, h, tankPx);
}

function drawAndRotate(item, w, h, img) {
  //draw and rotate player
  let x = item.x;
  let y = item.y;
  let rotation = item.rotation;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-x, -y);
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  ctx.translate(x - w / 2, y - h / 2);
  ctx.restore();
}

const playerOne = {
  x: Math.round(W / 2),
  y: Math.round(H / 2),
  rotation: 0,
  state: tankStates.Alive,
  speed: 0,
  expId: 0,
  tank: {
    tank: tankPx,
  },
};

function getNewTank() {
  let y;
  let x;
  let rotation = Math.floor(Math.random() * 22.5 * 6);
  const rand = Math.floor(Math.random() * 4) + 1;
  switch (rand) {
    case 1: //top
      x = Math.floor(Math.random() * (W - w) + w / 2);
      y = h / 2;
      rotation += 90 + 22.5;
      break;
    case 2: //right
      y = Math.floor(Math.random() * (H - h) + h / 2);
      x = W - w / 2;
      rotation += 180 + 22.5;
      break;
    case 3: //left
      y = Math.floor(Math.random() * (H - h) + h / 2);
      x = w / 2;
      rotation += 0 + 22.5;
      break;
    default:
      //bottom
      x = Math.floor(Math.random() * (W - w) + w / 2);
      y = H - h / 2;
      rotation += 270 + 22.5;
      break;
  }
  const randTank = Math.floor(Math.random() * 3);
  return {
    tank: tanks[randTank],
    x: x,
    y: y,
    rotation: rotation,
    speed: Math.floor(Math.random() * 5 + 5),
    state: tankStates.Alive,
    expId: 0,
  };
}

function bulletHitTests() {
  for (let i = 0; i < enemyTanks.length; i++) {
    bulletHitTest(i);
  }
}

function bulletHitTest(index) {
  const hit = bullets.find((b) => {
    return (
      b.x > enemyTanks[index].x - w / 2 &&
      b.x < enemyTanks[index].x + w / 2 &&
      b.y > enemyTanks[index].y - h / 2 &&
      b.y < enemyTanks[index].y + h / 2
    );
  });
  if (hit && enemyTanks[index].state == tankStates.Alive) {
    enemyTanks[index].state = tankStates.Hit;
    explode(enemyTanks[index]);
    score += 100;
  }
}

const enemyTanks = [getNewTank(), getNewTank(), getNewTank()];

function tankHitTests() {
  for (let i = 0; i < enemyTanks.length; i++) {
    tankHitTest(i);
  }
}

function tankHitTest(index) {
  const hit =
    playerOne.x > enemyTanks[index].x - w / 2 &&
    playerOne.x < enemyTanks[index].x + w / 2 &&
    playerOne.y > enemyTanks[index].y - h / 2 &&
    playerOne.y < enemyTanks[index].y + h / 2;

  if (hit && enemyTanks[index].state == tankStates.Alive) {
    enemyTanks[index].state = tankStates.Hit;
    explode(enemyTanks[index]);
    playerOne.state = tankStates.Hit;
    explode(playerOne);
  }
}

function fire() {
  const rads = (playerOne.rotation * Math.PI) / 180;

  const bullet = {
    rotation: playerOne.rotation,
    x: playerOne.x + (Math.sin(rads) * h) / 2,
    y: playerOne.y - (Math.cos(rads) * h) / 2,
  };
  bullets.push(bullet);
}

function drawBullet() {
  for (var i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    drawAndRotate(bullet, 6, 14, greenBulletPx);
    const rads = (bullet.rotation * Math.PI) / 180;
    bullet.x += Math.sin(rads) * bulletsSpeed;
    bullet.y -= Math.cos(rads) * bulletsSpeed;
  }
  for (var i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    if (bullet.x < 0 || bullet.y < 0 || bullet.x > W || bullet.y > H) {
      bullets.splice(i, 1);
    }
  }
}

//Controls
window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp":
      speed(1);
      break;
    case "ArrowLeft":
      rotate(-22.5);
      break;
    case "ArrowDown":
      speed(-1);
      break;
    case "ArrowRight":
      rotate(22.5);
      break;
    case "Space":
      fire();
      break;
  }
});

function rotate(angle) {
  playerOne.rotation += angle;
}

function speed(sp) {
  playerOne.speed += sp;

  if (playerOne.speed < 0) {
    playerOne.speed = 0;
  }

  if (playerOne.speed > 10) {
    playerOne.speed = 10;
  }
}
