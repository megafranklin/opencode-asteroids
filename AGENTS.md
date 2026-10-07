# AGENTS.md

Asteroids clone: pure HTML5 Canvas + vanilla ES6+ JavaScript. No dependencies, no bundler, no package.json, no build/lint/test tooling. Do not look for or invent npm scripts.

## Run / verify

No automated verification exists; testing is manual in a browser:

- Open `index.html` directly, or `npx serve .` → http://localhost:3000
- Controls: arrows rotate/thrust, Space shoots (and restarts after game over).

## Architecture

All game logic lives in the single `game.js`, loaded via a plain `<script>` tag in `index.html` (no ES modules, no imports). Structure: classes `Bullet`, `Asteroid`, `Ship`, `Particle`; module-level game state (`ship`, `bullets`, `asteroids`, `particles`, `score`, `lives`, `level`); a `state` machine of `'playing' | 'dead' | 'gameover'`; then `update(dt)` / `draw()` driven by a `requestAnimationFrame` loop with `dt` capped at 0.05s.

## Gotchas

- **Canvas size is defined twice**: `W`/`H` constants in `game.js` must match the `width`/`height` attributes of `#canvas` in `index.html`. The toroidal wrap logic depends on them; change both or neither.
- **Input is consume-on-read**: `pressed(code)` implements edge detection via the `justPressed` map and clears the flag when read. Calling it more than once per frame silently drops the event — use `keys[code]` for held state.
- **Language is Spanish**: code comments, README, and in-game UI strings (`NIVEL`, `PUNTAJE`, `ESPACIO PARA REINICIAR`) are all Spanish. Keep new UI text in Spanish.
- **README overclaims**: it mentions power-ups and a "estrella fugaz" asteroid type, but neither exists in `game.js`. The code is the source of truth.
- Tuning values (speeds, radii, points per size) live in the `RADII` / `SPEEDS` / `POINTS` arrays near the top of `game.js`.
