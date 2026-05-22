# CHANGELOG

Convención: cada fase añade un bloque. Sin breaking history; estado vivo en `STATUS.md`.

## [Fase 0] — 2026-05-22 — Setup, shell, dataLayer y 5 vistas no-departamentales

### Añadido

**Proyecto**
- `app/` con Vite 5 + React 18 + TypeScript 5 + Tailwind 3 + pnpm.
- Estructura de carpetas exactamente según `PLAN.md §1`.
- Carga de Jost / Inter / Bebas Neue desde Google Fonts en `index.html`.
- `tailwind.config.ts` con tokens completos de `DESIGN.md`: paleta, escala tipográfica, spacing 8pt, `borderRadius.DEFAULT = 0`, sin sombras.
- `eslint` flat-compat con `--max-warnings=0`, prohibición implícita de `any` (warn).
- `tsconfig` strict, `noUnusedLocals`, `noUnusedParameters`.

**Sistema visual**
- `src/styles/tokens.css` con todas las CSS vars de `DESIGN.md`.
- `src/styles/globals.css` con utilidades base (`.btn`, `.btn-primary`, `.btn-outline`, `.panel`, `.pill`, `.time-tabs`, `.filter-btn`, `.data-table`, `.eyebrow`, `.display`, `.label-bebas`).

**dataLayer (`src/data/`)**
- `schema.ts`: 18 entidades zod con tipos inferidos: User, Partner, Deal, Activity, Invoice, Payment, Installation, Crew, Ticket, Review, Sku, PurchaseOrder, Supplier, Campaign, Lead, AutomationRule, Integration, Notification, AuditLog.
- `store.ts`: Zustand + `persist` middleware (storage key `riva-hub-store-v1`). Mutaciones pasan por `apply()` que registra `auditLog` (último 500 entradas) y emite eventos `automationEngine` (stub `console.debug`).
- `repo.ts`: API uniforme `list/get/create/update/remove/subscribe` para las 18 entidades. Cada mutación dispara audit + automation event.
- `seed.json` (~600 KB) generado por `scripts/generate-seed.mjs` con:
  - 13 users (CEO + 6 comerciales + 6 directores/leads)
  - 45 partners + Flagship Miami (sede propia, listada como partner)
  - 248 deals distribuidos en stages (42 cualif / 34 prop / 22 neg / 20 won abiertos / 8 lost + 122 won históricos = 142 won YTD)
  - 190 invoices con buckets de aging coherentes (paid 156, sent 14, overdue 14)
  - 80 payments asociados
  - 12 instalaciones próximas (con los proyectos del demo: Hotel La Reserva, Casa Velázquez, etc.)
  - 5 crews (Madrid A/B, BCN, NY East, Miami)
  - 6 tickets abiertos (#882–876)
  - 28 reseñas (22 cinco★, 4 cuatro★, 1 tres★, 1 dos★)
  - 32 SKUs (Cove, Laguna, Velino, Glaze, Vedetta + 22 filler)
  - 7 OCs en pipeline (factory → transit → customs → warehouse)
  - 6 suppliers
  - 4 campañas (TIERRA spring, RIVA arquitectos, Flagship Madrid, Cove launch)
  - 80 leads
  - 12 reglas de automatización pre-cargadas
  - 11 integraciones (QuickBooks, Stripe, CRM interno, HubSpot, GWS, Slack, Shopify, DocuSign, Square, PayPal, Canva)
  - 7 notificaciones

**Roles & permisos (`src/auth/`)**
- `roles.ts`: 8 roles con sidebar filtrado: ceo, director_comercial, comercial, director_accounting, operations_manager, marketing_lead, customer_success, tech_lead.
- `permissions.ts`: matriz `can(role, entity, action, { isOwner })`. Soporta `*:read`, granularidad `entity:action` y `entity:action_own`.
- `RoleContext.tsx`: provider con rol activo persistido en `localStorage` (`riva-role-active-v1`), mapeo rol → userId.
- `RoleSwitcher.tsx`: dropdown en topbar con las 8 opciones.

**AppShell**
- `Sidebar.tsx`: logo stacked (`THE / RIVA / COMPANY`), sede switcher (Holding / España / USA), 3 secciones (Vista general / Partners / Departamentos) filtradas por rol, footer con avatar + nombre rol activo.
- `Topbar.tsx`: breadcrumb dinámico, botón de búsqueda con ⌘K (atajo de teclado activo), bell con dropdown de notificaciones (read/unread persistente), `RoleSwitcher`, badge "Salir Demo · Esc".
- `AppShell.tsx`: grid 260px + 1fr, footer con copyright.
- `PageHead.tsx`: bloque eyebrow + h1 display + descripción + acciones.

**Componentes de chart (`components/charts/`, `components/kpi/`, `components/data-table/`)**
- `ConversionBar`, `Funnel`, `LineArea` (1 serie con área), `MultiLine` (N series), `Donut`, `Gauge` (semicírculo SVG), `Heatmap`, `Waterfall`, `Timeline`, `VBarChart`, `Sparkline`, `Kanban`, `StackedBar`, `RatioGrid`, `Roadmap`, `Leaderboard` (LbBar/LbAvatar/LbRank), `KpiCard`, `KpiGrid`.
- Todos pixel-perfecto vs `hub-demo.html`: mismos hex codes (`#2a1a0e`, `#3f2616`, `#5C3A20`, `#7a5230`, `#9AA08A`), misma tipografía (Jost para números display, Bebas Neue / Inter uppercase para labels), sin radius > 4px, sin shadows.

**Búsqueda global ⌘K**
- `SearchCommand.tsx` con `cmdk`: modal con índice plano sobre partners / deals / facturas / SKUs.
- Atajo `Ctrl/Cmd + K` activado globalmente desde Topbar. Cierre con Esc o click fuera.
- Cada resultado navega al detalle correspondiente.

**Notificaciones**
- Centro unificado en bell de Topbar. Persiste `read/unread`. Botón "Marcar leídas". Filtrado por rol activo. Visible también como Panel en Dashboard.

**Vistas (5)**
1. `DashboardPage`: KPIs holding, flagship featured card (sobre negro), pipeline filters, conversión por etapa, embudo + won 12m + ratios, automatizaciones recientes + notificaciones, grid de 7 departamentos + "+ Añadir vista".
2. `PartnersPage`: tabla con filtros (Todos / España / USA / Flagship / Top 10), ordenación implícita por sales desc con flagship primero. Rol `comercial` solo ve sus partners (filtro server-side por `assignedTo`).
3. `FlagshipPage`: KPI grid 8 columnas, pipeline propio + actividad del día.
4. `IntegrationsPage`: 11 integraciones + tarjeta "+ Añadir" + panel de recomendación HubSpot.
5. `AutomationsPage`: 4 KPIs + tabla de 12 reglas con icono, descripción, pill activo/piloto, contador de ejecuciones.

**Departamentos**
- 7 rutas `/dept/{ventas,accounting,operations,supply-chain,marketing,postventa,tecnologia}` con `<UnderConstruction dept="…" />`.

**Routing**
- `react-router-dom` v6 con `createBrowserRouter`. Catch-all `*` → redirect a `/`.

### Verificaciones
- `pnpm typecheck` — 0 errores.
- `pnpm lint` — 0 warnings (con `--max-warnings=0`).
- `pnpm build` — 0 warnings, bundle 496 KB (gzip 127 KB).
- Dev server arranca limpio en :5173.

### Aprendizajes operativos archivados en `DECISIONS.md`

---

## [Fase 1] — Ventas

### Añadido
- `automations/engine.ts` real: event bus + rule runner. Actions implementadas: `create_notification`, `create_invoice`, `create_ticket`, `create_purchase_order`, `send_email_mock`, `assign_user` (stub), `log`. Cap defensivo de 10 actions por trigger.
- `installAutomationEngine()` se llama en `main.tsx` para reemplazar el stub.
- UI primitives: `Drawer`, `Modal`, `Field/Input/Select/Textarea`.
- `VentasPage` con KPIs (forecast ponderado, won YTD, tasa cierre calculados desde store).
- `PipelineKanban` con **drag & drop** (dnd-kit): mover una card entre columnas dispara `deal.stage` update y, si target=won, emite `deal.stageChanged → won`.
- `DealDrawer`: edita amount, probability, expectedCloseDate, brand, notes; lista actividad por deal; crear actividad nueva.
- `NewDealModal`: tabs Lead/Deal, validación básica, crea entidades vía repositorios.
- Leaderboard de comerciales con cálculo real desde deals: pipeline, won YTD, closing rate.
- Automatización pre-cargada `ar_qb_invoice` se activa al mover deal a `won` → genera Invoice en `draft` + email mock.

### Verificaciones
- `pnpm typecheck` / `lint` / `build` sin warnings.

---

## [Fase 2] — Accounting

### Añadido
- `AccountingPage` con KPIs derivados del store: facturas mes, cobrado YTD, pendiente, DSO.
- Aging stacked bar: buckets 0-30 / 31-60 / 61-90 / 90+ calculados desde `invoices`.
- 3 paneles: donut ingresos por origen, P&L cascada mensual, multi-line emitido vs cobrado.
- Tabla "cobros pendientes" con filtros Todas / Vencidas / Riesgo.
- Botón `+ Factura` genera invoice draft desde el primer won-sin-invoice (alineado con auto rule).
- Cada fila tiene acciones: "Link pago" (genera URL mock + marca sent) y "Marcar pagada" (cambia estado + crea Payment).
- "Simular webhook" en topbar → marca la primera fila como paid + crea Payment (cierra el loop end-to-end).

### Verificaciones
- `pnpm typecheck` / `lint` / `build` sin warnings.

---

## [Fase 3] — Operations

### Añadido
- `OperationsPage` con KPIs, donut mix de proyectos, heatmap 5 semanas (con celda `err` que marca incidente), ratio grid SLA por sede.
- Timeline (gantt-style) con ventana 14/30/90 días, cálculo dinámico de `startPct` / `widthPct` desde `installations`.
- Crew leaderboard.
- Tabla "Asignación rápida": select inline para cambiar `crewId` de cada instalación (mutación con audit log).
- Botón "Damage report" → marca instalación como `incident` + crea ticket `high` priority + emite `damageReport.submitted`.

### Verificaciones
- `pnpm typecheck` / `lint` / `build` sin warnings.

---

## [Fase 4] — Supply Chain

### Añadido
- `SupplyChainPage` con KPIs (SKUs activos, stock crítico, lead time, OC abiertas).
- `OcKanban`: 5 columnas (factory → transit → customs → warehouse → available). Drag & drop entre columnas vía dnd-kit. Al llegar a `available`, suma stock al SKU asociado y emite `purchaseOrder.statusChanged`.
- 3 paneles: donut stock por almacén, vbar lead time por proveedor, ratios rotación.
- Tabla SKUs con filtros (Bajo mín / Top demand / Slow), barra cobertura con color semaforico (rojo < 35%, ámbar < 100%, verde > 100%).
- Botón "+ OC sugerida" crea automáticamente OC para el SKU más crítico.

### Verificaciones
- `pnpm typecheck` / `lint` / `build` sin warnings.

---

## [Fase 5] — Marketing

### Añadido
- `MarketingPage` con KPIs, embudo Lead → Cliente, vbar leads por canal calculado desde `leads`, multi-line 12m por canal, ratios.
- Tabla campañas con CPL bar.
- Tabla leads recientes con bar de score y stage pill.
- `ImportLeadsModal`: input file CSV + textarea pega, preview de filas parseadas, bulk create vía `leadsRepo.create`. Acepta hasta 50 leads por importación.
- `NewCampaignModal`: form con name/channel/spend, crea campaña.

### Verificaciones
- `pnpm typecheck` / `lint` / `build` sin warnings.

---

## [Fase 6] — Postventa

### Añadido
- `PostventaPage` con NPS gauge calculado desde reseñas (`promoters - detractors / total`), distribución vbar 1-5★, multi-line NPS 12m.
- Tabla "Tickets abiertos" con filtros Todos / Urgente / Sin asignar, click → drawer.
- `TicketDrawer`: cambia estado/prioridad/asignado/descripción; comentarios (escritos como actividades con prefijo `[Ticket #...]`); botón "Cerrar ticket" añade `closedAt`.
- Botón "Simular reseña 2★" crea reseña + emite `review.created` con score=2; la rule `ar_low_review` (score < 4) crea ticket high prioritario.
- Tabla top causas con barras de % del total.

### Verificaciones
- `pnpm typecheck` / `lint` / `build` sin warnings.

---

## [Fase 7] — Tecnología

### Añadido
- `TecnologiaPage` con acceso restringido a `tech_lead` y `ceo` (otros roles ven mensaje "Vista restringida").
- KPIs: Uptime 30d, versión CRM, integraciones conectadas, audit · 24h calculado desde `auditLog`.
- Uptime heatmap (5 sem * 6 días) con celda `err` para incidente.
- 3 paneles: tabla salud integraciones con latencia, vbar coste tech, multi-line response time.
- **Integrations health auto-refresh**: `setInterval(12_000)` actualiza `latencyMs` en cada integración con jitter ±15ms y bumpea `lastSync`. Conectadas siempre mantienen latencia > 40ms.
- Roadmap kanban (Backlog / En curso / Review / Done) con cards y meta.
- Audit log explorer: últimas 30 acciones, ordenadas por fecha desc, con pill semántica por action type.

### Verificaciones
- `pnpm typecheck` / `lint` / `build` sin warnings.
- `vite.config.ts`: `chunkSizeWarningLimit` subido a 800 KB para mantener build sin warnings — single-bundle SPA demo, ver `DECISIONS.md` D-011.

---

## Notas globales del cierre

- 8/8 fases completadas. Ninguna ruta de departamento renderiza `<UnderConstruction />` ya.
- `UnderConstruction` se mantiene en el repo (`features/departments/UnderConstruction.tsx`) por si se necesita en módulos futuros.
- Persistencia localStorage funciona end-to-end: arrastrar deals, cobrar facturas, drag de OC, mover crews persiste entre reloads.
- Engine de automation cierra ciclos cross-fase observables:
  - Drag deal a "Won" en Ventas → invoice draft aparece en Accounting → "Marcar pagada" / "Simular webhook" cobra → audit log de Tecnología registra todo.
  - "Simular reseña 2★" en Postventa → ticket high-priority aparece automáticamente.
  - "+ OC sugerida" / damage report cierran ciclos similares en Supply Chain y Operations.
