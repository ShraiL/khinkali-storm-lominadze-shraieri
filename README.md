# Khinkali Storm

A small browser arcade game for the DevOps microservices midterm.
Built by Lascha Schreier with OpenAI Codex assistance.

Catch khinkali with a plate and avoid peppers:

| Item | Effect |
| --- | --- |
| Khinkali | +10 points |
| Golden khinkali | +50 points; 8% spawn chance and 1.5× speed |
| Hot pepper | Lose one life |

Start with three lives. Each 200 points raises the level and falling speed.
Missing food does not remove a life. Your best score is saved in this browser's
localStorage (not tied to an account).

## Play with Docker

Requirements: Docker Desktop running, Git.

```sh
docker build -t khinkali-game ./game
docker run -d --name khinkali-game -p 8080:80 khinkali-game
```

Open http://localhost:8080. Enter your name and press **Let's play**.
Move with **← / →** or **A / D**. **P / Esc** pauses and resumes.
On a phone, hold the arrow buttons below the game. Losing window focus pauses play.

Stop and remove this project's standalone container:

```sh
docker stop khinkali-game
docker rm khinkali-game
```

For a quick preview without Docker:

```sh
cd game
python3 -m http.server 5500
```

Open http://localhost:5500. ES modules require HTTP; do not double-click index.html.

## Files

- `game/index.html`: menu, game, game-over screen and controls.
- `game/style.css`: responsive arcade layout; system fonts, no external assets.
- `game/js/main.js`: game loop, input, score, lives, levels and pause.
- `game/js/player.js`: plate movement and drawing.
- `game/js/items.js`: item selection, falling, drawing and collision.
- `game/js/ui.js`: screens, HUD and browser-local personal best.
- `game/Dockerfile`: Nginx serving the static game on port 80.

The `main` branch is intentionally the standalone game. The midterm's separate
`feature/leaderboard-service` branch adds the leaderboard; its PR must stay open.

## Full microservice version (this feature branch)

```sh
git switch feature/leaderboard-service
docker compose up -d --build
```

Open http://localhost:8080. If the standalone container from `main` still exists,
stop/remove **that project's** `khinkali-game` container first using the commands above.

```text
Browser → localhost:8080 → game (Nginx)
                               │ /api/* over khinkali-net
                               ▼
                          leaderboard:3000 (Express)
                               │
                               ▼
                          /data/scores.json
                          named volume: leaderboard-data
```

Only Nginx publishes a host port. The browser calls `/api/scores`, not
`localhost:3000`. Nginx resolves the `leaderboard` service through Docker DNS.
The supplied variable-based proxy configuration allows the game to start even
when the leaderboard is unavailable. No startup dependency is required.

Compose prefixes the declared network and volume names with the project name:
`khinkali-storm-lominadze-shraieri_khinkali-net` and
`khinkali-storm-lominadze-shraieri_leaderboard-data` by default.

### Leaderboard behavior

- Health is checked on page load, after Game Over, and every five seconds.
- Top ten runs appear beside the menu and Game Over (below the game on mobile).
- Each finished game makes one POST attempt. Repeated runs by the same name are
  separate entries; this is a top-ten-runs board, not a user-account ranking.
- An offline service shows a red status and unavailable message; play continues.
- The table recovers automatically when the service returns. Failed uploads are
  not queued or retried, to avoid accidentally duplicating a run.
- Name input is trimmed, required and limited to 24 characters. Score must be a
  nonnegative safe integer. Player names are rendered as text, never HTML.
- The server writes a temporary JSON file and renames it over the previous file.
  Synchronous writes are intentional for this tiny single-process classroom API.

This is a local teaching demo. Scores are client-submitted, with no account
system or anti-cheat verification. It is not a production competitive service.

### API

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/health` | 200, `{"status":"ok"}` |
| GET | `/api/scores` | 200, up to 10 `{name, score}` entries, highest first |
| POST | `/api/scores` | 201 for valid JSON `{name, score}`; 400 for invalid input |

```sh
curl http://localhost:8080/api/health
curl -i -X POST http://localhost:8080/api/scores \
  -H 'Content-Type: application/json' \
  -d '{"name":"Nino","score":1240}'
curl http://localhost:8080/api/scores
# Expected: 400
curl -i -X POST http://localhost:8080/api/scores \
  -H 'Content-Type: application/json' \
  -d '{"name":"","score":"wrong"}'
```

### Verify the midterm requirements

```sh
docker compose ps
docker compose exec game wget -qO- http://leaderboard:3000/api/health
docker compose exec leaderboard npm test
# Watch the page: offline within about 9 seconds; game remains playable.
docker compose stop leaderboard
# Watch the page: green status and table return automatically.
docker compose start leaderboard
# Save a score first. This preserves the named volume.
docker compose down
docker compose up -d --wait
curl http://localhost:8080/api/scores
```

Do not use `docker compose down -v` if you want to keep scores: `-v` deletes the
volume. Both services include healthchecks. `npm test` uses a temporary directory,
so the API test does not alter the actual leaderboard volume.

Additional feature files: `game/js/api.js` handles HTTP/status/table rendering;
`leaderboard/server.js` provides the API; `leaderboard/server.test.js` tests it;
`game/nginx.conf` routes API traffic; `docker-compose.yml` connects the containers.

## Submission

Repository: https://github.com/ShraiL/khinkali-storm-lominadze-shraieri

Submit the repository URL and the open PR URL. **Do not merge the PR.** Main must
remain the standalone game without `leaderboard/` or `docker-compose.yml`.
See `VERIFICATION.md` for the implementation check record.
