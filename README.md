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
