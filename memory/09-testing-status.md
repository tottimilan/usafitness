# Testing Status — USAFitness Landing Pages

> **Corrección 2026-08-24:** este fichero era una copia byte-idéntica del homónimo de la plantilla MASTERMIND — se titulaba "Testing Status — MASTERMIND TEMPLATE 2.0" y describía los tests de la plantilla (Pester, skill-quality-evaluator), no los de este proyecto. Se coló en el onboarding de junio. Reescrito con el estado real.

**Last updated:** 2026-08-24

## Estado real: no hay tests automatizados

- **Tests unitarios:** ninguno. No existe ningún fichero `*.test.*` ni `*.spec.*` en el repositorio.
- **Tests E2E:** ninguno. No hay Playwright, Cypress ni equivalente.
- **CI:** ninguna. No existe `.github/workflows/`.
- **Framework de test instalado:** ninguno. `package.json` solo tiene `astro`, `@astrojs/node` y `@astrojs/sitemap`.

## Lo que sí verifica hoy

| Verificación | Cómo | Cubre |
|---|---|---|
| Compilación | `npm run build` | Que el proyecto compila y que `stores.json` no rompe el render |
| Humo manual por dominio | Levantar `node dist/server/entry.mjs` y pedir cada dominio con la cabecera `Host` | HTTP 200, `<title>`, canonical, meta robots, `og:image`, secciones renderizadas |
| Integridad de imágenes | Comprobar que cada ruta declarada en `stores.json` existe en `public/` | Rutas rotas antes de desplegar |
| Deriva de plantilla | `scripts/template-audit.ps1`, `sync-from-template -Check`, `sync-skills -Check` | Salud de la instalación MASTERMIND, no del producto |

Esa rutina se ha ejecutado a mano en esta sesión y detectó cosas reales (imágenes que no decodificaban, `og:image` roto en Alcobendas). **No está automatizada**: depende de que alguien la ejecute.

## Riesgo asociado

Registrado como riesgo técnico nº1 en `memory/08-known-risks.md`: un cambio en la plantilla compartida o en `stores.json` puede romper una o todas las tiendas en producción sin que nada lo detecte. El impacto crece con cada tienda añadida — hoy 7.

## Qué haría falta (no decidido, no priorizado)

1. **Check de build en CI** al hacer push. Es lo más barato y ataca el riesgo mayor.
2. **Validación de esquema de `stores.json`** en tiempo de build: campos obligatorios presentes y rutas de imagen existentes. Hoy un JSON malformado o una ruta inexistente solo se detecta mirando.
3. **Humo por tienda**: pedir cada dominio y afirmar 200 + canonical correcto + `og:image` que resuelve.
4. **Guardia de imágenes**: rechazar ficheros de imagen cuyos magic bytes no correspondan a su extensión. Habría evitado los placeholders SVG con extensión `.jpg` que estuvieron meses en el repo.

_Pendiente de decisión del usuario (pregunta Q9 en `memory/12`): cuánto invertir en red de seguridad frente a seguir enviando rápido._
