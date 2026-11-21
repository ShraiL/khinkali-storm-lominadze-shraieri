# Verification — 2026-11-21

Executed locally with Docker Desktop and Chromium/Playwright.

- Standalone main: Docker image built; Nginx served the game on port 8080.
- Unit checks: plate clamps to edges; normal/gold/pepper selection; gold faster;
  swept plate collision and misses; effects +10/+50/−1.
- Browser game loop: deterministic random inputs and manually advanced animation
  frames reached 240 points / level 2, then 480 after gold spawns; three pepper
  catches led to Game Over; replay restored three lives. These hooks existed only
  in the test browser, not in the shipped application.
- Real-time keyboard: ArrowLeft moved plate x=350 → 230.676; D moved it back to
  345.63. P/Esc pause/resume checked. Mobile arrow-pointer input also moved plate.
- Personal best persisted across page reload.
- Desktop and mobile screenshots inspected (1280, 390 and 320px widths). Corrected
  narrow-screen title clipping and life wrapping. No horizontal page overflow.
- Healthy browser session: no uncaught JavaScript errors.
- API automated test: 200 health, 201 writes, 400 blank/string/negative/fractional
  scores and invalid JSON, descending top10, concurrent writes retained, restart
  persistence. Passed locally and inside the Node 20 container.
- Actual Compose proxy: GET health, POST valid/invalid, descending top10 passed.
- Container-to-container wget returned {"status":"ok"}.
- Game Over sent exactly one POST and refreshed the high-score list.
- Stopped backend: browser switched offline; game still scored and ended normally;
  failed upload was reported. Expected HTTP 502 errors during this deliberate
  outage were handled; there was no uncaught application error.
- Restarted backend: browser returned online with ten rows, without reloading.
- `docker compose down` then `up -d --wait`: scores exactly matched the previous
  snapshot; both services healthy. No volume deletion.

These checks cover the assignment's local demo. No production deployment or
anti-cheat guarantee is claimed.
