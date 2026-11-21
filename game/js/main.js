import { Player } from './player.js';
import { TYPES, spawnItem, moveItem, hitsPlate, drawItem } from './items.js';
import { initializeUI, playerName, showScreen, updateHUD, finishGame } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const keys = new Set();
let player = new Player(canvas.width, canvas.height);
let items = [];
let score = 0;
let lives = 3;
let level = 1;
let state = 'menu';
let spawnTimer = 0;
let previousTime = 0;
let name = '';

function startGame() {
  name = playerName();
  if (!name) return;
  document.activeElement?.blur();
  player = new Player(canvas.width, canvas.height);
  items = [];
  score = 0;
  lives = 3;
  level = 1;
  spawnTimer = 0;
  keys.clear();
  state = 'playing';
  showScreen(state);
  updateHUD(score, lives, level);
}

function togglePause() {
  if (state !== 'playing' && state !== 'paused') return;
  state = state === 'playing' ? 'paused' : 'playing';
  keys.clear();
  showScreen(state);
}

function update(seconds) {
  const direction = Number(keys.has('arrowright') || keys.has('d')) -
    Number(keys.has('arrowleft') || keys.has('a'));
  player.update(seconds, direction, canvas.width);
  spawnTimer -= seconds;
  if (spawnTimer <= 0) {
    items.push(spawnItem(canvas.width));
    spawnTimer = Math.max(0.3, 0.8 - (level - 1) * 0.04);
  }
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    moveItem(item, seconds, level);
    if (hitsPlate(item, player)) {
      score += TYPES[item.type].points;
      lives -= TYPES[item.type].damage;
      level = Math.floor(score / 200) + 1;
      items.splice(i, 1);
      updateHUD(score, lives, level);
      if (lives === 0) {
        state = 'gameover';
        keys.clear();
        finishGame(score);
        return;
      }
    } else if (item.y > canvas.height + item.radius) {
      items.splice(i, 1);
    }
  }
}

function draw() {
  ctx.fillStyle = '#e8e2d3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d8cfbd';
  ctx.lineWidth = 1;
  for (let x = 20; x < canvas.width; x += 40) {
    for (let y = 20; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x + 2, y); ctx.stroke();
    }
  }
  ctx.fillStyle = '#d2c5ae';
  ctx.fillRect(0, canvas.height - 32, canvas.width, 32);
  for (const item of items) drawItem(ctx, item);
  player.draw(ctx);
}

function frame(time) {
  // Limit large frame gaps; tab switching must not teleport items.
  const seconds = Math.min((time - previousTime) / 1000, 0.04);
  previousTime = time;
  if (state === 'playing') update(seconds);
  draw();
  requestAnimationFrame(frame);
}

document.getElementById('start-form').addEventListener('submit', (event) => {
  event.preventDefault(); startGame();
});
document.getElementById('replay').addEventListener('click', startGame);
document.getElementById('home').addEventListener('click', () => {
  state = 'menu'; showScreen(state); document.getElementById('name').focus();
});
for (const id of ['pause', 'resume']) document.getElementById(id).addEventListener('click', togglePause);
window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  const key = event.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'a', 'd', 'p', 'escape'].includes(key)) {
    event.preventDefault();
    if ((key === 'p' || key === 'escape') && !event.repeat) togglePause();
    else keys.add(key);
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => {
  keys.clear(); if (state === 'playing') togglePause();
});
for (const [id, key] of [['left', 'arrowleft'], ['right', 'arrowright']]) {
  const button = document.getElementById(id);
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault(); button.setPointerCapture(event.pointerId); keys.add(key);
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    button.addEventListener(event, () => keys.delete(key));
  }
}
initializeUI();
showScreen('menu');
requestAnimationFrame(frame);
