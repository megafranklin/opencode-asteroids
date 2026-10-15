---
description: Crea un git worktree en .worktrees/ con nombre derivado del argumento.
agent: build
---

Crea un worktree de git. Argumento del usuario: $ARGUMENTS

1. Analiza el argumento (puede o no contener espacios) y deriva un nombre
   corto, en minúsculas y kebab-case, basado en el contexto del argumento.
   Ej: "arreglar bug de colisiones" → arreglar-bug-colisiones
   Ej: "feature-x" → feature-x
2. Ejecuta EXACTAMENTE este comando, sustituyendo <nombre> por el derivado:
   git worktree add .worktrees/<nombre>
3. Si el argumento es muy largo, Simplifícalo a un nombre significativo

Reglas estrictas:
- NO hagas nada más: no cambies de directorio, no edites archivos, no hagas
  commits, no toques .gitignore, no verifiques nada después.
- Si el argumento está vacío, pregunta al usuario el nombre del worktree
  antes de ejecutar nada.
