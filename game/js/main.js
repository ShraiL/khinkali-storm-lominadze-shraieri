import { difficulties, Duel, drawDuel } from './duel.js';
import { mountainScene } from './scenery.js';
import { Player } from './player.js';
import { TYPES, spawnItem, moveItem, hitsPlate, drawItem } from './items.js';
import { initializeUI, playerName, showScreen, updateHUD, finishGame } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const backdrop = mountainScene(canvas.width, canvas.height);
let slowTime = 0;
let catchLabel = null;
const keys = new Set();
let player = new Player(canvas.width, canvas.height);
let items = [];
let score = 0;
let lives = 3;
let level = 1;
let state = 'menu';
let settings = difficulties.medium;
let gold = 0;
let duel;
let resumeState;
const swing = document.getElementById('swing');
function renderSlots() {
  const slots = document.getElementById('slots');
  slots.setAttribute('aria-label', gold + ' of 3 golden khinkali');
  [...slots.children].forEach((slot,i) => slot.classList.toggle('filled', i < gold));
}
let spawnTimer = 0;
let previousTime = 0;
let name = '';

function startGame() {
  name = playerName();
  if (!name) return;
  settings = difficulties[document.getElementById('difficulty').value];
  gold = 0;
  renderSlots();
  swing.hidden = true;
  document.activeElement?.blur();
  player = new Player(canvas.width, canvas.height);
  items = [];
  slowTime = 0;
  catchLabel = null;
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
  if (!['playing','duel','paused'].includes(state)) return;
  if (state !== 'paused') resumeState = state;
  state = state === 'paused' ? resumeState : 'paused';
  swing.hidden = state !== 'duel';
  keys.clear();
  showScreen(state);
}

function update(seconds) {
  const direction = Number(keys.has('arrowright') || keys.has('d')) -
    Number(keys.has('arrowleft') || keys.has('a'));
  player.update(seconds, direction, canvas.width);
  slowTime = Math.max(0, slowTime - seconds);
  if (catchLabel) catchLabel.time -= seconds;
  const fallSeconds = seconds * settings.speed * (slowTime > 0 ? 0.5 : 1);
  spawnTimer -= fallSeconds;
  if (spawnTimer <= 0) {
    items.push(spawnItem(canvas.width));
    spawnTimer = Math.max(0.3, 0.8 - (level - 1) * 0.04);
  }
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    moveItem(item, fallSeconds, level);
    if (hitsPlate(item, player)) {
      if (item.type === 'herb') slowTime = 5;
      const label = { normal: '+10', gold: '+50', pepper: '−1 ♥', herb: 'Slow!' };
      catchLabel = { text: label[item.type], x: player.x + player.width / 2, time: 0.8 };
      score += TYPES[item.type].points;
      lives -= TYPES[item.type].damage;
      level = Math.floor(score / 200) + 1;
      items.splice(i, 1);
      updateHUD(score, lives, level);
      if (item.type === 'gold') {
        gold++;
        renderSlots();
        if (gold === 3) {
          duel = new Duel(settings);
          state = 'duel';
          swing.hidden = false;
          keys.clear();
          return;
        }
      }
      if (lives === 0) {
        endRound();
        return;
      }
    } else if (item.y > canvas.height + item.radius) {
      items.splice(i, 1);
    }
  }
}

function endRound() {
  swing.hidden = true;
        state = 'gameover';
        keys.clear();
        finishGame(score);
}

function draw() {
  ctx.drawImage(backdrop, 0, 0);
  if (state === 'duel' || (state === 'paused' && resumeState === 'duel')) {
    drawDuel(ctx, duel);
    return;
  }
  ctx.font = 'bold 23px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff6dc';
  if (slowTime > 0) ctx.fillText('Tarragon · ' + Math.ceil(slowTime) + 's', canvas.width / 2, 36);
  if (catchLabel && catchLabel.time > 0) {
    ctx.fillText(catchLabel.text, catchLabel.x, player.y - 55 + catchLabel.time * 35);
  }
  for (const item of items) drawItem(ctx, item);
  player.draw(ctx);
}

function frame(time) {
  // Limit large frame gaps; tab switching must not teleport items.
  const seconds = Math.min((time - previousTime) / 1000, 0.04);
  previousTime = time;
  if (state === 'playing') update(seconds);
  if (state === 'duel') {
    const outcome = duel.tick(seconds, () => {
      lives--;
      updateHUD(score,lives,level);
      return lives;
    });
    swing.disabled = !duel.open || Boolean(duel.ending);
    if (outcome === 'loss') endRound();
    if (outcome === 'win') {
      gold = 0;
      renderSlots();
      items = [];
      swing.hidden = true;
      state = 'playing';
    }
  }
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
swing.addEventListener('click', () => { if (state === 'duel') duel.swing(); });
window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (state === 'duel' && event.code === 'Space') {
    event.preventDefault();
    if (!event.repeat) duel.swing();
    return;
  }
  const key = event.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'a', 'd', 'p', 'escape'].includes(key)) {
    event.preventDefault();
    if ((key === 'p' || key === 'escape') && !event.repeat) togglePause();
    else keys.add(key);
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => {
  keys.clear(); if (state === 'playing' || state === 'duel') togglePause();
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
