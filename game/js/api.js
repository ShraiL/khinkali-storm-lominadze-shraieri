const status = document.getElementById('connection');
const list = document.getElementById('leaders');
const empty = document.getElementById('leaderboard-message');
let refreshing = null;

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, signal: AbortSignal.timeout(3500) });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function unavailable() {
  status.textContent = '● Leaderboard offline';
  status.className = 'connection offline';
  list.replaceChildren();
  empty.hidden = false;
  empty.textContent = 'Leaderboard temporarily unavailable. You can still play.';
}

export function refreshLeaderboard() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      await request('/api/health');
      const scores = await request('/api/scores');
      list.replaceChildren();
      for (const entry of scores) {
        const row = document.createElement('li');
        const name = document.createElement('span');
        const score = document.createElement('b');
        // Never interpret a player's name as HTML.
        name.textContent = entry.name;
        score.textContent = entry.score;
        row.append(name, score);
        list.append(row);
      }
      status.textContent = '● Leaderboard online';
      status.className = 'connection online';
      empty.hidden = scores.length > 0;
      empty.textContent = 'Be the first to put a score on the board.';
    } catch { unavailable(); }
  })().finally(() => { refreshing = null; });
  return refreshing;
}

export async function submitScore(name, score) {
  // Exactly one attempt per game. No automatic retry that could duplicate a score.
  try {
    await request('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score }),
    });
    return true;
  } catch { return false; }
  finally {
    // Finish any previous poll, then fetch the new table and health state.
    if (refreshing) await refreshing;
    await refreshLeaderboard();
  }
}

export function startLeaderboard() {
  refreshLeaderboard();
  setInterval(refreshLeaderboard, 5000);
}
