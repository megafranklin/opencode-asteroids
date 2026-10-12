# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Al destruir asteroides pueden soltar el power-up de **velocidad**, que duplica la propulsión de la nave durante 5 segundos. De vez en cuando, una **estrella fugaz** dorada cruza el campo: es mucho más rápida que los asteroides y solo dura unos segundos, pero vale 500 puntos si logras destruirla.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción                  |
| --------- | ----------------------- |
| `←` `→`   | Rotar nave              |
| `↑`       | Propulsar               |
| `Espacio` | Disparar                |
| `C`       | Cambiar skin de la nave |

## Puntuación

| Objetivo       | Puntos |
| -------------- | ------ |
| Grande         | 20     |
| Mediano        | 50     |
| Pequeño        | 100    |
| Estrella fugaz | 500    |

## Power-up de velocidad

Al destruir un asteroide hay una probabilidad (12%) de que suelte un ítem de velocidad (doble chevron cian que flota y gira). Recógelo tocándolo con la nave: la propulsión se duplica durante 5 segundos (llama cian y contador en el HUD). Si no lo recoges en 8 segundos, el ítem desaparece.

## Estrella fugaz

Cada 8–15 segundos una estrella fugaz dorada entra cruzando desde un borde de la pantalla, mucho más rápida que cualquier asteroide. Permanece 6 segundos antes de desvanecerse (con estela de chispas). Destruirla con una bala otorga 500 puntos; si toca tu nave, la destruye igual que un asteroide.

## Skins

Pulsa `C` en cualquier momento (incluso tras un game over) para rotar entre las 5 skins de la nave: **CLÁSICA**, **CAZA**, **NEÓN**, **RETRO** y **CORSAIR**. Cada una cambia la silueta y el color del casco; la llama del propulsor, las balas y la jugabilidad son idénticas. Tu elección se guarda en el navegador (`localStorage`) y se restaura al recargar.

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de velocidad: propulsión duplicada durante 5 segundos (llama cian y contador en el HUD)
- Estrella fugaz: rápida (300 px/s) y fugaz (6 s), 500 puntos al destruirla
- 5 skins de nave seleccionables con la tecla `C` (persisten entre sesiones)
