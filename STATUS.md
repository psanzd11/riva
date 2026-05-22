# STATUS — RIVA Hub

> Snapshot del proyecto al cierre de cada fase. Sustituye este documento al avanzar.

## Fase actual
**Todas las fases del plan (0–7) completas**. Ningún departamento queda en placeholder.

## Avance global
| Fase | Estado | Notas |
|---|---|---|
| 0 · Setup + shell + dataLayer + 5 vistas | ✅ Completada | Commit `d7b7fe9` |
| 1 · Ventas | ✅ Completada | Pipeline kanban con drag&drop, deal drawer, lead/deal modal, leaderboard, automatización deal→won genera invoice |
| 2 · Accounting | ✅ Completada | Lista facturas con filtros, generar invoice desde deal won, payment link, marcar pagada, aging clicable, P&L cascada, simulador webhook |
| 3 · Operations | ✅ Completada | Heatmap, donut mix proyectos, timeline 14/30/90d, asignación crew vía select, damage report → ticket automático |
| 4 · Supply Chain | ✅ Completada | OC pipeline kanban drag&drop, donut warehouses, lead time bars, crítico/top/slow filter, "+OC sugerida" desde stock crítico |
| 5 · Marketing | ✅ Completada | Embudo lead→cliente, leads por canal, ratios, tabla campañas, importar leads CSV, nueva campaña |
| 6 · Postventa | ✅ Completada | NPS gauge, distribución reseñas, ticket drawer con comentarios, simulación reseña 2★ → ticket automático |
| 7 · Tecnología | ✅ Completada | Uptime heatmap, integrations health con auto-refresh (setInterval), roadmap kanban, audit log explorer. Acceso restringido a `tech_lead` y `ceo` |

**Avance del plan global: 100%** (8 de 8 fases).

## Engine de automation

Replaced the Phase 0 stub: `automations/engine.ts` ahora es un event bus real con rule runner.

- `emit(event, payload)` evalúa rules activas con `trigger.event === event` y `conditions.every(...)`.
- Actions implementadas: `create_notification`, `create_invoice`, `create_ticket`, `create_purchase_order`, `assign_user` (stub), `send_email_mock` (genera notif mock), `log`.
- Cada disparo incrementa `runs` y guarda `lastRunAt`.
- Cap defensivo: max 10 actions por rule por trigger.
- Conectado al store en `main.tsx` vía `installAutomationEngine()`.

Triggers cableados por departamento:
- `deal.stageChanged → won` (Ventas drag-drop) → `ar_qb_invoice` crea invoice draft + email mock
- `review.created` con `score < 4` (botón Postventa) → `ar_low_review` crea ticket high
- `damageReport.submitted` (botón Operations) → ya crea ticket high-priority directamente
- `purchaseOrder.statusChanged → available` (Supply drag) → suma stock al SKU

## Vistas implementadas

Todas las del demo, con interacción real donde tiene sentido:

| Ruta | Componente | Estado |
|---|---|---|
| `/` | DashboardPage | Holding view completo |
| `/automations` | AutomationsPage | Tabla read-only de 12+ rules |
| `/integrations` | IntegrationsPage | 11 integraciones + recomendación HubSpot |
| `/partners` | PartnersPage | Tabla filtrable (Todos/ES/USA/Flagship/Top 10), rol comercial filtra por assignedTo |
| `/flagship` | FlagshipPage | KPIs 8-col + pipeline propio + actividad del día |
| `/dept/ventas` | VentasPage | Pipeline kanban con drag&drop, deal drawer, lead/deal modal, leaderboard sortable |
| `/dept/accounting` | AccountingPage | Lista pendientes, generar invoice, payment link, marcar pagada, webhook simulator |
| `/dept/operations` | OperationsPage | Timeline 14/30/90d, asignación crew, damage report → ticket |
| `/dept/supply-chain` | SupplyChainPage | OC kanban drag&drop, +OC sugerida, filtros SKU |
| `/dept/marketing` | MarketingPage | Embudo, ratios, campañas, importar CSV, nueva campaña |
| `/dept/postventa` | PostventaPage | NPS gauge, reseñas, ticket drawer, simulación 2★ |
| `/dept/tecnologia` | TecnologiaPage | Uptime heatmap, integraciones con auto-refresh 12s, roadmap, audit log explorer |

## Verificaciones de cierre

- ✅ `pnpm typecheck` sin errores
- ✅ `pnpm lint --max-warnings=0` limpio
- ✅ `pnpm build` sin warnings (bundle 608 KB / gzip 160 KB; threshold subido a 800 KB porque es un SPA-demo no fragmentado)
- ✅ Dev server arranca limpio en :5173 (o :5174 si ocupado)

## Persistencia + audit

- localStorage key `riva-hub-store-v1` versionada
- Cualquier mutación → `apply()` registra en `auditLog` (poda a últimas 500)
- Audit log visible en `/dept/tecnologia` (últimas 30 acciones)

## Roles

- 8 roles activos, switcher en topbar
- Sidebar filtra por rol (`navForRole`)
- `tech_lead` y `ceo` ven Tecnología; otros roles ven mensaje de acceso restringido
- `comercial` filtra deals/partners por `ownerId === currentUserId`

## Pendiente conocido (no en el plan de fases)

- Settings view (`PLAN.md §8.6`): tokens visuales, stage probabilities, SLA thresholds editables — no entregado. Los valores actuales son constantes inline en `permissions.ts` / `VentasPage` (STAGE_PROBS).
- Export CSV / JSON (`PLAN.md §8.5`): no entregado. Los buttons "Exportar" del demo son no-op.
- Builder visual de reglas de automation (`PLAN.md §8.4`): no entregado. La vista Automatizaciones sigue siendo lectura.
- Nurture sequences editor (`PLAN.md §7.5`): no entregado.
- Lead scoring rules editables (`PLAN.md §7.5`): scores actuales son hard-coded en seed.

Estos están fuera del scope explícito de las fases 0–7 (entran en transversales/§8 del plan).

## Blockers

Ninguno.
