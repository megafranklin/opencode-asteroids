'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

// Power-ups
const DROP_CHANCE     = 0.12;  // probabilidad de drop por asteroide destruido
const PU_TTL          = 8;     // segundos del ítem flotando sin recoger
const PU_DURATION     = 5;     // segundos del efecto de velocidad
const TRIPLE_DURATION = 5;     // segundos del efecto de triple disparo
const TRIPLE_SPREAD   = 0.12;  // rad de apertura del abanico (~7°)
const PU_TYPES        = ['speed', 'triple', 'shield'];  // el drop elige uno al azar

// Power-up de escudo
const SHIELD_DURATION   = 6;          // segundos del efecto de escudo
const SHIELD_RADIUS     = 26;         // radio del escudo alrededor de la nave
const SHIELD_COLOR      = '#39ff8e';  // verde, para distinguirlo del cian de velocidad

// Estrella fugaz
const STAR_SPEED  = 300;   // px/s
const STAR_TTL    = 6;     // segundos antes de desvanecerse
const STAR_POINTS = 500;   // puntos por destruirla
const STAR_MIN_T  = 8;     // intervalo mínimo entre apariciones (s)
const STAR_MAX_T  = 15;    // intervalo máximo entre apariciones (s)

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Skins de la nave ──────────────────────────────────────────────────────────
// Solo cambian la silueta y el color del casco (nariz hacia +x); la llama,
// las balas y la jugabilidad son idénticas para todas.
const SKINS = [
  { name: 'CLÁSICA', stroke: '#fff',    fill: null,                      verts: [[20, 0], [-12, -9], [-7, 0], [-12, 9]] },
  { name: 'CAZA',    stroke: '#39ff14', fill: null,                      verts: [[24, 0], [-8, -4], [-14, -11], [-7, 0], [-14, 11], [-8, 4]] },
  { name: 'NEÓN',    stroke: '#00d4ff', fill: 'rgba(0, 212, 255, 0.15)',  verts: [[18, 0], [-12, -10], [-3, 0], [-12, 10]] },
  { name: 'RETRO',   stroke: '#ff9f1c', fill: null,                      verts: [[16, 0], [-10, -12], [-10, 12]] },
  { name: 'CORSAIR', stroke: '#ff4d6d', fill: null,                      verts: [[22, 0], [-15, -12], [-6, 0], [-15, 12]] },
];

const SKIN_KEY     = 'asteroids-skin';  // clave de persistencia en localStorage
const SKIN_TOAST_T = 2;                 // segundos que se muestra el nombre en el HUD

let skinIndex = 0;
let skinToast = 0;

try {
  const saved = parseInt(localStorage.getItem(SKIN_KEY), 10);
  if (Number.isInteger(saved) && saved >= 0 && saved < SKINS.length) skinIndex = saved;
} catch (e) { /* localStorage no disponible: skin por defecto */ }

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedTimer    = 0;
    this.tripleTimer   = 0;
    this.shieldTimer   = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedTimer    > 0) this.speedTimer    -= dt;
    if (this.tripleTimer   > 0) this.tripleTimer   -= dt;
    if (this.shieldTimer   > 0) this.shieldTimer   -= dt;

    const ROT   = 3.5;   // rad/s
    const DRAG  = 0.987;
    const THRUST = this.speedTimer > 0 ? 520 : 260;  // px/s²

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    // Abanico estrecho de 3 balas durante el triple disparo
    if (this.tripleTimer > 0) {
      return [
        new Bullet(ox, oy, this.angle - TRIPLE_SPREAD),
        new Bullet(ox, oy, this.angle),
        new Bullet(ox, oy, this.angle + TRIPLE_SPREAD),
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;

    // Escudo: burbuja verde alrededor de la nave, con pulso sutil y
    // parpadeo en sus últimos 2 segundos (se dibuja antes del parpadeo
    // de invencibilidad para que permanezca siempre visible)
    if (this.shieldTimer > 0 &&
        !(this.shieldTimer < 2 && Math.floor(this.shieldTimer * 8) % 2 === 0)) {
      ctx.save();
      ctx.strokeStyle = SHIELD_COLOR;
      ctx.lineWidth    = 2;
      ctx.globalAlpha  = 0.75;
      const r = SHIELD_RADIUS + Math.sin(performance.now() / 160) * 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Casco según la skin activa
    const skin = SKINS[skinIndex];
    ctx.strokeStyle = skin.stroke;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(skin.verts[0][0], skin.verts[0][1]);
    for (let i = 1; i < skin.verts.length; i++)
      ctx.lineTo(skin.verts[i][0], skin.verts[i][1]);
    ctx.closePath();
    if (skin.fill) {
      ctx.fillStyle = skin.fill;
      ctx.fill();
    }
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = this.speedTimer > 0
        ? 'rgba(0, 212, 255, 0.9)'
        : 'rgba(255, 130, 0, 0.85)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── PowerUps (velocidad / triple disparo / escudo) ────────────────────────────
class PowerUp {
  constructor(x, y, type = 'speed') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 10;
    this.ttl  = PU_TTL;
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 50);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.rot      = 0;
    this.rotSpeed = 1.5;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo antes de expirar
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    if (this.type === 'triple') {
      // Letra T de triple disparo
      ctx.strokeStyle = '#7cffb2';
      ctx.beginPath();
      ctx.moveTo(-5, -6); ctx.lineTo( 5, -6);   // barra horizontal
      ctx.moveTo( 0, -6); ctx.lineTo( 0,  6);   // asta vertical
      ctx.stroke();
    } else if (this.type === 'shield') {
      // Escudo: anillo verde con punto interior
      ctx.strokeStyle = SHIELD_COLOR;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = SHIELD_COLOR;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Doble chevron de velocidad
      ctx.strokeStyle = '#00d4ff';
      ctx.beginPath();
      ctx.moveTo(-6, -5); ctx.lineTo(-1, 0); ctx.lineTo(-6, 5);
      ctx.moveTo( 1, -5); ctx.lineTo( 6, 0); ctx.lineTo( 1, 5);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ── ShootingStar (estrella fugaz) ────────────────────────────────────────────
class ShootingStar {
  constructor() {
    // Entra desde un borde apuntando a un punto del borde opuesto
    const side = randInt(0, 3);
    let x, y, tx, ty;
    if (side === 0)      { x = rand(0, W); y = 0;  tx = rand(0, W); ty = H; }
    else if (side === 1) { x = rand(0, W); y = H;  tx = rand(0, W); ty = 0; }
    else if (side === 2) { x = 0;  y = rand(0, H); tx = W; ty = rand(0, H); }
    else                 { x = W;  y = rand(0, H); tx = 0; ty = rand(0, H); }
    this.x = x;
    this.y = y;
    const d = Math.hypot(tx - x, ty - y) || 1;
    this.vx = (tx - x) / d * STAR_SPEED;
    this.vy = (ty - y) / d * STAR_SPEED;

    this.radius   = 12;
    this.ttl      = STAR_TTL;
    this.rot      = rand(0, Math.PI * 2);
    this.rotSpeed = rand(-4, 4);
    this.dead     = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
    // Estela de chispas
    particles.push(new Particle(this.x, this.y));
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    // Se desvanece antes de expirar
    ctx.globalAlpha = Math.min(1, this.ttl / 1.5);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = i % 2 === 0 ? this.radius : this.radius * 0.4;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups, stars;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let starTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  stars     = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  starTimer = rand(STAR_MIN_T, STAR_MAX_T);
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  stars     = [];
  starTimer = rand(STAR_MIN_T, STAR_MAX_T);
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  // Cambio de skin (disponible en cualquier estado)
  if (pressed('KeyC')) {
    skinIndex = (skinIndex + 1) % SKINS.length;
    skinToast = SKIN_TOAST_T;
    try { localStorage.setItem(SKIN_KEY, String(skinIndex)); } catch (e) { /* sin persistencia */ }
  }
  if (skinToast > 0) skinToast -= dt;

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    stars.forEach(s => s.update(dt));
    stars = stars.filter(s => !s.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    stars.forEach(s => s.update(dt));
    stars = stars.filter(s => !s.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  // Estrella fugaz
  starTimer -= dt;
  if (starTimer <= 0) {
    stars.push(new ShootingStar());
    starTimer = rand(STAR_MIN_T, STAR_MAX_T);
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));
  stars.forEach(s => s.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);
  stars     = stars.filter(s => !s.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size];
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
        if (Math.random() < DROP_CHANCE)
          powerups.push(new PowerUp(a.x, a.y, PU_TYPES[Math.floor(Math.random() * PU_TYPES.length)]));
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Bala vs estrella fugaz
  for (const b of bullets) {
    for (const s of stars) {
      if (!s.dead && !b.dead && dist(b, s) < s.radius) {
        b.dead = true;
        s.dead = true;
        score += STAR_POINTS;
        explode(s.x, s.y, 20);
      }
    }
  }
  stars   = stars.filter(s => !s.dead);
  bullets = bullets.filter(b => !b.dead);

  // Nave vs asteroide / estrella fugaz
  if (ship.invincible <= 0) {
    if (ship.shieldTimer > 0) {
      // Escudo activo: destruye el peligro al contacto (sin puntos ni división)
      for (const a of asteroids) {
        if (dist(ship, a) < SHIELD_RADIUS + a.radius * 0.82) {
          a.dead = true;
          explode(a.x, a.y, a.size * 5);
        }
      }
      for (const s of stars) {
        if (dist(ship, s) < SHIELD_RADIUS + s.radius) {
          s.dead = true;
          explode(s.x, s.y, 20);
        }
      }
      asteroids = asteroids.filter(a => !a.dead);
      stars     = stars.filter(s => !s.dead);
    } else {
      for (const a of asteroids) {
        if (dist(ship, a) < ship.radius + a.radius * 0.82) {
          killShip();
          break;
        }
      }
      if (!ship.dead) {
        for (const s of stars) {
          if (dist(ship, s) < ship.radius + s.radius) {
            killShip();
            break;
          }
        }
      }
    }
  }

  // Nave vs power-up
  for (const pu of powerups) {
    if (!pu.dead && !ship.dead && dist(ship, pu) < ship.radius + pu.radius) {
      pu.dead = true;
      if      (pu.type === 'triple') ship.tripleTimer = TRIPLE_DURATION;
      else if (pu.type === 'shield') ship.shieldTimer = SHIELD_DURATION;
      else                           ship.speedTimer  = PU_DURATION;
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  // Mini-nave con la silueta y color de la skin activa
  const skin = SKINS[skinIndex];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = skin.stroke;
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(skin.verts[0][0] * 0.5, skin.verts[0][1] * 0.5);
  for (let i = 1; i < skin.verts.length; i++)
    ctx.lineTo(skin.verts[i][0] * 0.5, skin.verts[i][1] * 0.5);
  ctx.closePath();
  if (skin.fill) {
    ctx.fillStyle = skin.fill;
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  // Efectos activos, apilados si hay varios
  const efectos = [];
  if (!ship.dead && ship.speedTimer > 0)
    efectos.push([`VELOCIDAD ${ship.speedTimer.toFixed(1)}s`, '#00d4ff']);
  if (!ship.dead && ship.tripleTimer > 0)
    efectos.push([`TRIPLE ${ship.tripleTimer.toFixed(1)}s`, '#7cffb2']);
  if (!ship.dead && ship.shieldTimer > 0)
    efectos.push([`ESCUDO ${ship.shieldTimer.toFixed(1)}s`, SHIELD_COLOR]);
  efectos.forEach(([texto, color], i) => {
    ctx.fillStyle = color;
    ctx.fillText(texto, 14, 48 + i * 22);
  });
  ctx.fillStyle = '#fff';

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  // Aviso del nombre de la skin al cambiarla
  if (skinToast > 0) {
    ctx.globalAlpha = Math.min(1, skinToast / 0.5);  // se desvanece al final
    ctx.fillStyle   = SKINS[skinIndex].stroke;
    ctx.fillText(SKINS[skinIndex].name, W / 2, 48);
    ctx.globalAlpha = 1;
    ctx.fillStyle   = '#fff';
  }

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  stars.forEach(s => s.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
