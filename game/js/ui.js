const $ = (id) => document.getElementById(id);
let best = 0;

export function initializeUI() {
  try {
    const saved = Number(localStorage.getItem('khinkali-best'));
    best = Number.isSafeInteger(saved) && saved >= 0 ? saved : 0;
    $('name').value = localStorage.getItem('khinkali-name') || '';
  } catch { /* Play still works if browser storage is blocked. */ }
  renderBest();
}

function renderBest() {
  document.querySelectorAll('.best').forEach((element) => { element.textContent = best; });
}

export function playerName() {
  const name = $('name').value.trim();
  $('name').setCustomValidity(name ? '' : 'Please enter your name.');
  if (!name) { $('name').reportValidity(); return null; }
  try { localStorage.setItem('khinkali-name', name); } catch { /* Optional storage. */ }
  return name;
}
$('name').addEventListener('input', () => $('name').setCustomValidity(''));

export function showScreen(screen) {
  for (const id of ['menu', 'gameover', 'paused']) $(id).hidden = id !== screen;
  $('pause').disabled = screen !== 'playing' && screen !== 'paused';
  $('pause').textContent = screen === 'paused' ? 'Resume ▶' : 'Pause II';
}

export function updateHUD(score, lives, level) {
  $('score').textContent = String(score).padStart(4, '0');
  $('level').textContent = String(level).padStart(2, '0');
  $('lives').textContent = '♥ '.repeat(lives) + '♡ '.repeat(3 - lives);
  $('lives').setAttribute('aria-label', `${lives} lives`);
}

export function finishGame(score) {
  best = Math.max(best, score);
  try { localStorage.setItem('khinkali-best', best); } catch { /* Optional storage. */ }
  renderBest();
  $('final-score').textContent = score;
  showScreen('gameover');
  $('replay').focus();
}
