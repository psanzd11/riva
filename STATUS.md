# STATUS — RIVA Hub

> Snapshot del proyecto al cierre de cada fase. Sustituye este documento al avanzar.

## Fase actual
**Fase 0 — Setup, shell, dataLayer y vistas no-departamentales** — **completada**.

## Avance global
| Fase | Estado | % |
|---|---|---|
| 0 · Setup + shell + dataLayer + 5 vistas | ✅ Completada | 100% |
| 1 · Ventas | ⏸ Pendiente | 0% |
| 2 · Accounting | ⏸ Pendiente | 0% |
| 3 · Operations | ⏸ Pendiente | 0% |
| 4 · Supply Chain | ⏸ Pendiente | 0% |
| 5 · Marketing | ⏸ Pendiente | 0% |
| 6 · Postventa | ⏸ Pendiente | 0% |
| 7 · Tecnología | ⏸ Pendiente | 0% |

**Avance del plan global: 12,5%** (1 de 8 fases).

## Entregado en Fase 0

### Infraestructura
- Proyecto Vite + React 18 + TS + Tailwind + pnpm en `app/`.
- Estructura de carpetas según `PLAN.md §1`.
- Tailwind config con tokens completos de `DESIGN.md` (colores, type scale, spacing 8pt, `radius=0`).
- ESLint + tsc strict sin warnings.

### Sistema de diseño
- 14+ primitivas de chart como React components: `Funnel`, `ConversionBar`, `MultiLine`, `LineArea`, `Donut`, `Gauge`, `Heatmap`, `Waterfall`, `Timeline`, `VBarChart`, `Sparkline`, `Kanban`, `StackedBar`, `RatioGrid`, `Roadmap`, `Leaderboard` (LbBar/LbAvatar/LbRank).
- KPI primitives: `KpiCard`, `KpiGrid`.
- UI primitives: `Button`, `Panel`, `Pill`, `FilterTabs`.

### dataLayer
- 18 entidades zod (`src/data/schema.ts`).
- Zustand store con persist middleware (localStorage, key `riva-hub-store-v1`).
- 18 repositorios uniformes (`list/get/create/update/remove/subscribe`).
- Audit log con poda automática (últimas 500 entradas).
- Automation engine stub (event bus en `console.debug`).
- `seed.json` coherente con cifras del demo (45 partners + flagship, 248 deals → 142 won YTD, 190 invoices, 32 SKUs, 12 automation rules, 11 integraciones).

### Auth
- 8 roles + matriz de permisos.
- RoleContext + RoleSwitcher persistidos en localStorage.
- Sidebar filtra entradas por rol.
- Partners filtra deals/partners por `assignedTo` cuando rol = `comercial`.

### Features transversales
- Notificaciones centro unificado (bell topbar + panel dashboard), filtrado por rol, read/unread persistidos.
- Búsqueda global ⌘K (cmdk) sobre partners, deals, invoices, SKUs.

### Vistas implementadas (5)
- Dashboard holding.
- Partners list (con filtros y orden).
- Flagship detail.
- Integrations + recomendación HubSpot.
- Automatizaciones (read-only).

### Departamentos (placeholders)
- 7 rutas `/dept/*` con `<UnderConstruction />`.

## Pendiente conocido (no aplicable a Fase 0)
- Drag & drop en kanban (entra en Fase 1).
- Deal/Invoice/Installation/Ticket detail drawers (entran en sus fases).
- Form builders (react-hook-form + zod) — librerías instaladas, sin formularios en Fase 0.
- Sede switcher del Sidebar es UI-only (no filtra datos todavía; entra en Fase 1).
- Engine de automation completo (Fase 1+).
- Settings view (Fase 7).
- Export CSV / JSON (Fase 2+).

## Blockers
- Ninguno.

## Verificaciones de cierre
- ✅ `pnpm typecheck` sin errores.
- ✅ `pnpm lint --max-warnings=0` limpio.
- ✅ `pnpm build` sin warnings (bundle 496 KB, gzip 127 KB).
- ✅ Dev server arranca limpio.

## Siguiente paso
Arrancar **Fase 1 — Ventas** con el prompt indicado en `PLAN.md §11`.
