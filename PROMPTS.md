# AI assistance

Tool: OpenAI Codex in the desktop app.

The user supplied `DevOps_Midterm_Khinkali_Storm.pdf` and requested:
“Hier dass ist miene midterm in devoops, KI ist erlaubt, also lassuns anfangne und es machen”.

The implementation was split into the following three main task prompts derived
from that assignment. These are summaries of the working instructions, not
claims that the user sent three separate messages.

1. **Build the standalone game.** Use only HTML, CSS and vanilla JavaScript ES
   modules. Keep HTML/CSS, player/items, game loop and UI in separate stages.
   Implement normal khinkali +10, rare faster gold +50, pepper −1 life, three
   lives, level increases every 200 points, name input, game-over/replay and
   localStorage best. Support arrows/A/D, with pause and touch controls.
2. **Containerize and connect the services.** Keep the Nginx game alone on main.
   On feature/leaderboard-service add an Express API on 0.0.0.0:3000, JSON
   persistence in /data, Compose networking and the supplied Nginx API proxy.
3. **Verify the complete workflow.** Check gameplay, API validation and top10,
   backend-offline play and recovery, and scores surviving container recreation.
   Document reproduction steps and create the required open, unmerged PR.

Codex generated and checked code, ran commands and helped with Git history and
documentation. The project deliberately uses a small architecture that can be
read module by module.
