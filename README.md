# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Al destruir asteroides pueden soltar el power-up de **velocidad**, que duplica la propulsión de la nave durante 5 segundos, o el de **escudo**, que durante 6 segundos la protege destruyendo al contacto asteroides y estrellas fugaces. De vez en cuando, una **estrella fugaz** dorada cruza el campo: es mucho más rápida que los asteroides y solo dura unos segundos, pero vale 500 puntos si logras destruirla.

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

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

## Puntuación

| Objetivo       | Puntos |
| -------------- | ------ |
| Grande         | 20     |
| Mediano        | 50     |
| Pequeño        | 100    |
| Estrella fugaz | 500    |

## Power-ups

Al destruir un asteroide hay una probabilidad (12%) de que suelte un ítem; cuando hay drop, es un 50% de velocidad y un 50% de escudo. Los ítems flotan y giran, y si no los recoges en 8 segundos, desaparecen.

### Velocidad

Doble chevron cian. Recógelo tocándolo con la nave: la propulsión se duplica durante 5 segundos (llama cian y contador en el HUD).

### Escudo

Anillo verde con punto interior. Al recogerlo, una burbuja verde rodea la nave durante 6 segundos: cualquier asteroide o estrella fugaz que toque la burbuja se destruye al contacto (con explosión, pero sin puntos ni fragmentos). La burbuja pulsa suavemente, parpadea durante sus últimos 2 segundos y el HUD muestra un contador.

## Estrella fugaz

Cada 8–15 segundos una estrella fugaz dorada entra cruzando desde un borde de la pantalla, mucho más rápida que cualquier asteroide. Permanece 6 segundos antes de desvanecerse (con estela de chispas). Destruirla con una bala otorga 500 puntos; si toca tu nave, la destruye igual que un asteroide (con el escudo activo, en cambio, la burbuja la destruye a ella).

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de velocidad: propulsión duplicada durante 5 segundos (llama cian y contador en el HUD)
- Power-up de escudo: burbuja verde de 6 segundos que destruye asteroides y estrellas fugaces al contacto
- Estrella fugaz: rápida (300 px/s) y fugaz (6 s), 500 puntos al destruirla
