# RIVA Hub — Plan de implementación

> Documento de trabajo para Claude Code. Léelo entero antes de empezar.
> Referencias: `DESIGN.md` (sistema visual), `hub-demo.html` (UI actual, baseline pixel-perfecto).
> Objetivo: pasar del demo HTML a una SPA modular donde cada departamento puede operar de verdad — solo UI funcional, sin backend real todavía.

---

## 0. Resumen ejecutivo

- **Stack:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui (selectivo).
- **Estado:** Zustand (1 store por feature, no global monolítico).
- **Persistencia demo:** `localStorage` con seed JSON. Capa `dataLayer` que mañana se swappea por API real.
- **Routing:** `react-router-dom` v6.
- **Roles:** mock con switcher en topbar. 8 roles definidos.
- **Charts:** Recharts (compatible con paleta de `DESIGN.md`).
- **Forms:** `react-hook-form` + `zod`.
- **Drag & drop:** `@dnd-kit/core` (kanban, roadmap, OC).
- **Iconos:** `lucide-react`.
- **Fases:** 8 sprints. Fase 0 = setup. Fases 1-7 = un departamento cada una.

---

## 1. Estructura del proyecto

```
hub-riva/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── tokens.css            # tokens de DESIGN.md como CSS vars
│   ├── lib/
│   │   ├── cn.ts                  # clsx + tailwind-merge
│   │   ├── format.ts              # money, dates, percent
│   │   └── id.ts                  # nanoid wrapper
│   ├── data/
│   │   ├── seed.json              # datos iniciales (ver §4)
│   │   ├── schema.ts              # zod schemas + tipos TS inferidos
│   │   ├── store.ts               # Zustand root + slices
│   │   ├── persistence.ts         # adapter localStorage (hydrate/dehydrate)
│   │   └── repositories/
│   │       ├── partners.ts
│   │       ├── deals.ts
│   │       ├── activities.ts
│   │       ├── invoices.ts
│   │       ├── payments.ts
│   │       ├── installations.ts
│   │       ├── crews.ts
│   │       ├── tickets.ts
│   │       ├── reviews.ts
│   │       ├── inventory.ts
│   │       ├── purchaseOrders.ts
│   │       ├── suppliers.ts
│   │       ├── campaigns.ts
│   │       ├── leads.ts
│   │       ├── notifications.ts
│   │       ├── auditLog.ts
│   │       ├── integrations.ts
│   │       └── automationRules.ts
│   ├── automations/
│   │   ├── engine.ts              # event bus + rule runner
│   │   ├── triggers.ts            # tipos de eventos
│   │   ├── actions.ts             # tipos de acciones
│   │   └── builtinRules.ts        # rules pre-cargadas
│   ├── auth/
│   │   ├── RoleContext.tsx
│   │   ├── roles.ts               # ver §3
│   │   ├── permissions.ts         # can(role, action, resource)
│   │   └── RoleSwitcher.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── PageHead.tsx
│   │   ├── ui/                    # primitivas: Button, Modal, Drawer, Table, Tabs, Input, Select, Toast
│   │   ├── charts/                # 1:1 con los del demo actual
│   │   │   ├── Funnel.tsx
│   │   │   ├── ConversionBar.tsx
│   │   │   ├── MultiLine.tsx
│   │   │   ├── Donut.tsx
│   │   │   ├── Gauge.tsx
│   │   │   ├── Heatmap.tsx
│   │   │   ├── Waterfall.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── VBarChart.tsx
│   │   │   ├── Kanban.tsx
│   │   │   └── Sparkline.tsx
│   │   ├── kpi/
│   │   │   ├── KpiCard.tsx
│   │   │   └── KpiGrid.tsx
│   │   └── data-table/
│   │       ├── DataTable.tsx      # sortable, filterable, ranking column
│   │       └── Leaderboard.tsx
│   ├── features/
│   │   ├── dashboard/             # holding view
│   │   ├── partners/
│   │   ├── flagship/
│   │   ├── automations/           # vista de rules + builder
│   │   ├── integrations/
│   │   ├── notifications/
│   │   ├── search/                # ⌘K global
│   │   └── departments/
│   │       ├── ventas/
│   │       ├── accounting/
│   │       ├── operations/
│   │       ├── supply-chain/
│   │       ├── marketing/
│   │       ├── postventa/
│   │       └── tecnologia/
│   └── hooks/
│       ├── useEntity.ts           # generic CRUD hook
│       ├── usePermission.ts
│       └── useAutomations.ts
└── public/
```

Convención: **cada feature** tiene como mínimo `index.tsx` (page), `components/`, `hooks.ts`, `automations.ts` (rules específicas), `README.md` (qué hace, cómo extender).

---

## 2. Stack & dependencias clave

```json
{
  "react": "^18",
  "react-dom": "^18",
  "react-router-dom": "^6",
  "zustand": "^4",
  "zod": "^3",
  "react-hook-form": "^7",
  "@hookform/resolvers": "^3",
  "tailwindcss": "^3",
  "lucide-react": "*",
  "recharts": "^2",
  "@dnd-kit/core": "*",
  "@dnd-kit/sortable": "*",
  "date-fns": "^3",
  "nanoid": "^5",
  "clsx": "*",
  "tailwind-merge": "*"
}
```

Tipografías Jost / Inter / Bebas Neue cargadas desde Google Fonts en `index.html`. Tokens de color, spacing, type scale en `tailwind.config.ts` espejando `DESIGN.md`. Nada de pure white, nada de bordes redondeados >4px, nada de sombras.

---

## 3. Roles & permisos

8 roles fijos. El switcher de la topbar cambia el rol activo y `permissions.can(role, action, resource)` decide qué se ve / qué se puede tocar.

| Rol | Sidebar visible | Acciones clave |
|---|---|---|
| `ceo` | Todo | Read global. No edita pipelines diarios. |
| `director_comercial` | Dashboard, Ventas, Partners, Flagship, Automatizaciones | CRUD deals y partners, gestión de equipo |
| `comercial` | Su Dashboard, sus deals/partners, Flagship si asignado | Solo sus deals/partners |
| `director_accounting` | Accounting, Automatizaciones, Integraciones | Facturas, P&L, conciliación, rules de cobro |
| `operations_manager` | Operations, Supply Chain | Instalaciones, equipos, OC |
| `marketing_lead` | Marketing, Partners (lectura) | Campañas, leads, contenido |
| `customer_success` | Postventa, Partners (lectura) | Tickets, NPS, reseñas |
| `tech_lead` | Todo + Tecnología | Roadmap, integraciones, audit log |

Permisos definidos como matriz en `auth/permissions.ts`. Granularidad: `entity:action` (ej. `invoice:create`, `deal:update_stage`, `partner:read_all`). Cada componente que escriba en `dataLayer` pasa antes por `usePermission()`.

---

## 4. Modelo de datos (seed.json + schemas)

Todas las entidades se definen en `data/schema.ts` con zod y los tipos se infieren con `z.infer`. Seed inicial coherente con el demo actual (10+ partners, ~118 deals, ~184 facturas, etc.).

### 4.1 Entidades core

```ts
User { id, name, email, role, sede: 'es'|'us'|'global', avatarColor, active }
Partner { id, name, sede, type: 'corner'|'espacio'|'flagship', m2, salesYtd, lastActivity, status, assignedTo: userId, commissionPct, address }
Deal { id, clientName, partnerId, ownerId, stage: 'lead'|'qualified'|'proposal'|'negotiation'|'won'|'lost', amount, currency, createdAt, expectedCloseDate, probability, brand: 'riva_spain'|'tierra'|'flagship', notes }
Activity { id, dealId?, partnerId?, type: 'call'|'email'|'visit'|'note', userId, at, content }
Invoice { id, number, partnerId, dealId, amount, currency, issuedAt, dueAt, status: 'draft'|'sent'|'partial'|'paid'|'overdue', paymentLink?, qbExternalId? }
Payment { id, invoiceId, amount, at, method: 'stripe'|'square'|'bank', externalId? }
Installation { id, dealId, project, startAt, endAt, crewId, sede, status: 'scheduled'|'in_progress'|'done'|'incident', m2, damageReportId? }
Crew { id, name, sede, members: number, specialty, capacity }
Ticket { id, type, partnerId?, dealId?, clientName, assigneeId?, priority: 'low'|'med'|'high', status: 'open'|'in_progress'|'closed', description, slaHours, createdAt, closedAt? }
Review { id, partnerId?, clientName, score: 1|2|3|4|5, text, source, at }
Sku { id, name, collection, finish, warehouse: 'es'|'us', stockM2, thresholdM2, supplierId, leadTimeDays, demandLast90 }
PurchaseOrder { id, skuId, quantity, supplierId, status: 'factory'|'transit'|'customs'|'warehouse'|'available', etaAt, totalCost, currency }
Supplier { id, name, country, leadTimeAvg }
Campaign { id, name, channel, periodStart, periodEnd, spend, leadsCount, conversionRate, status, currency }
Lead { id, name, email, sede, channel, score, stage, ownerId?, createdAt }
AutomationRule { id, name, trigger, conditions, actions, active, runs, lastRunAt }
Integration { id, name, type, status, latencyMs, lastSync, config }
Notification { id, userId|role, type, message, relatedEntity?, read, createdAt }
AuditLog { id, userId, action, entity, entityId, diff, at }
```

### 4.2 Reglas de seed

- Los 47 partners + flagship Miami que ya aparecen en el demo.
- ~6 comerciales con la asignación de partners coherente con el leaderboard actual.
- Pipeline con ~118 deals distribuidos en las 5 etapas según las cifras del demo (42/34/22/20/8 perdidos).
- ~184 facturas: ~85% paid, ~10% sent/pending, ~5% overdue (aging buckets respetan §accounting demo).
- ~12 instalaciones próximas (las del timeline de Operations).
- ~30 SKUs (Cove, Laguna, Velino, Glaze, Vedetta + algunos más por colección).
- 12 reglas de automation pre-cargadas (las que aparecen en la vista Automatizaciones actual).
- 9 integraciones con sus estados.

---

## 5. Capa `dataLayer`

Cada repository expone una API uniforme:

```ts
type Repo<T> = {
  list(filters?: Partial<T> & { _q?: string; _sort?: string; _page?: number }): T[]
  get(id: string): T | undefined
  create(input: Omit<T, 'id' | 'createdAt'>): T
  update(id: string, patch: Partial<T>): T
  remove(id: string): void
  subscribe(fn: (state: T[]) => void): () => void
}
```

Implementación en localStorage usa Zustand slice + persistence middleware (`zustand/middleware/persist`). Cada `create`/`update`/`remove` dispara un evento al `automationEngine` y registra en `auditLog`.

**Por qué este patrón:** mañana, cuando llegue el backend, sustituimos el cuerpo de cada repository por `fetch('/api/...')` sin tocar los componentes.

---

## 6. Automation engine

`automations/engine.ts` es un event bus simple. Eventos disparados desde repositories: `deal.created`, `deal.stageChanged`, `invoice.overdue`, `review.created`, `installation.completed`, `sku.belowThreshold`, etc.

Reglas son objetos JSON:

```ts
type Rule = {
  id: string
  name: string
  trigger: { event: string }
  conditions: Array<{ field: string; op: 'eq'|'lt'|'gt'|'contains'; value: any }>
  actions: Array<{
    type: 'create_notification'|'create_invoice'|'create_ticket'|'assign_user'|'send_email_mock'|'create_purchase_order'|'log'
    params: Record<string, any>
  }>
  active: boolean
}
```

La vista **Automatizaciones** muestra la tabla de reglas con toggle ON/OFF, contador de ejecuciones y un botón "+ Crear regla" que abre un builder visual (when → conditions → then). Reglas built-in editables.

Reglas pre-cargadas (§7, una por departamento).

---

## 7. Plan por fases

> **Convención de aceptación por fase:** (1) cobertura visual ≥ demo actual, (2) CRUD del entity principal, (3) al menos 2 automatizaciones working, (4) persistencia localStorage verificada, (5) role switcher esconde lo correcto, (6) sin warnings en consola, (7) README del feature.

### Fase 0 — Setup & shell (1 sprint)

Trabajo:

1. Inicializar Vite + React + TS + Tailwind. Configurar `tailwind.config.ts` con tokens de `DESIGN.md`.
2. `index.html` con preconnect a Google Fonts y carga de Jost/Inter/Bebas Neue.
3. AppShell: `<Sidebar />` + `<Topbar />` + `<Outlet />`. Router con rutas para las 12 vistas del demo.
4. RoleContext + RoleSwitcher en topbar. Persiste rol activo en localStorage.
5. `dataLayer` completo según §5, repositories vacíos pero funcionales.
6. `seed.json` con datos del demo. Hydrate al primer arranque.
7. Migrar todos los componentes visuales del HTML actual a React + Tailwind: KPI, Panel, ConvBar, Funnel, MultiLine, Donut, Gauge, Heatmap, Waterfall, Timeline, Kanban, Leaderboard, Sparkline, VBar.
8. Vistas: **Dashboard holding**, **Partners list**, **Flagship detail**, **Integrations**, **Automatizaciones** (read-only por ahora) — todas pixel-perfecto vs el demo.

**Acceptance:** SPA navegable, role switcher cambia sidebar, refresh mantiene estado, todas las vistas no-departamentales del demo replicadas.

---

### Fase 1 — Ventas

Submódulos:

- **Pipeline kanban** con drag & drop entre etapas (dnd-kit). Al mover, `deal.stage` se actualiza y dispara evento.
- **Deal detail drawer** (desliza desde la derecha): edita amount, expectedCloseDate, probability, brand, owner, notas; tab Activities con timeline.
- **+ Nuevo Lead/Deal**: form modal con react-hook-form + zod.
- **Equipo comercial leaderboard**: tabla sortable por cualquier columna, switch Año/Trimestre/Mes funcional.
- **Activity log**: por deal, por partner, por comercial. Crear actividad → bump `partner.lastActivity`.
- **Forecast ponderado**: cálculo `sum(amount × probabilityByStage)`. Stage probabilities configurables en settings.
- **Comisiones (vista simple)**: % por comercial sobre won YTD.

Automatizaciones pre-cargadas:

| Trigger | Acción |
|---|---|
| `lead.created` | Asigna al comercial con menos pipeline abierto en su sede |
| `deal.stageChanged → won` | Crea borrador de factura en Accounting + crea installation propuesta |
| `deal.noActivity14d` (cron diario) | Notificación al owner |
| `activity.created (type=visit)` | +1 partner score, +1 commercial score del mes |

**Acceptance criterios extra:** un comercial puede crear un lead, arrastrarlo por las etapas, ver su closing rate calculado, y al pasar a "won" aparece factura draft en Accounting automáticamente.

---

### Fase 2 — Accounting

Submódulos:

- **Lista facturas** con filtros: estado, sede, partner, rango de fechas; búsqueda; export CSV.
- **Generar factura desde deal**: el botón aparece cuando hay un deal won sin factura; pre-rellena partner, amount, currency.
- **Generar payment link** (mock Stripe): genera URL ficticia, copia al portapapeles, marca invoice como `sent`.
- **Marcar pagado**: manual + simulador "webhook recibido" que crea Payment automáticamente.
- **Aging buckets clicables** (0-30 / 31-60 / 61-90 / 90+): clicar filtra la tabla.
- **Recordatorios automáticos** D+7/D+14/D+21 (rules del engine).
- **P&L cascada mensual**: cálculo automático desde invoices + costes mock por línea.
- **Reconciliación**: vista de matches entre Invoice y Payment, mismatches en rojo.
- **Cierre de mes**: workflow paso a paso (checklist persistente).

Automatizaciones:

| Trigger | Acción |
|---|---|
| `deal.stageChanged → won` | Crea Invoice en `draft` (también suena en Ventas, mismo trigger) |
| `invoice.created` | Genera payment link mock + email draft |
| `invoice.overdue (D+7)` | Notificación + email mock recordatorio gentle |
| `invoice.overdue (D+14)` | Notificación + email mock firmer |
| `invoice.overdue (D+21)` | Crea ticket Postventa + notifica director_comercial |
| `payment.created` | Match contra invoice → marca paid + log conciliación |

**Acceptance extra:** workflow end-to-end "deal won → factura draft → link de pago → simular cobro → factura paid → entrada en P&L". 5 clicks máximo.

---

### Fase 3 — Operations

Submódulos:

- **Instalaciones list** con timeline gantt-style + filtros estado/sede/crew.
- **Asignación de crew**: drag de deal a crew con calendario.
- **Asociar materiales**: vincula instalación con SKUs (descuenta del stock al cerrar).
- **Check-in / check-out** del instalador con timestamp.
- **SLA tracking**: si `now() > startAt + slaHours` → flag rojo.
- **Damage report form**: dispara ticket Postventa.
- **CRUD de crews**: equipos, miembros, capacity, sede.
- **Heatmap calendario** clicable: muestra ocupación por día/crew.

Automatizaciones:

| Trigger | Acción |
|---|---|
| `invoice.paid` (con deal asociado) | Sugiere fecha de instalación según capacity + crea Installation en `scheduled` |
| `installation.startAt = today - 2d` (cron) | Notificación "SMS al cliente" (mock) |
| `installation.completed` | Lanza encuesta NPS (mock) + crea entrada en P&L revenue recognition |
| `damage report submitted` | Crea ticket Postventa con prioridad alta |
| `sku.belowThreshold AND linked_to_installation_next_14d` | Alerta Supply Chain |

**Acceptance extra:** un operations manager puede ver todas las instalaciones de los próximos 30 días, reasignar un crew arrastrando una instalación, ver alertas SLA.

---

### Fase 4 — Supply Chain

Submódulos:

- **Inventario SKUs** con stock vs umbral, mini-bars, búsqueda + filtros warehouse/collection.
- **OC pipeline kanban**: drag entre `factory → transit → customs → warehouse → available`.
- **Crear OC**: form, autocompleta supplier según SKU, ETA según leadTime, total cost.
- **Tracking de containers**: tabla con números de tracking mock, ETA, estado aduanas.
- **Vendor management**: tabla de proveedores con lead time histórico real (calculado de OCs cerradas).
- **Forecast demanda**: línea simple = ventas últimos 90d × seasonality factor.
- **Stock reservation**: SKUs vinculados a instalaciones próximas no cuentan como disponible.

Automatizaciones:

| Trigger | Acción |
|---|---|
| `sku.belowThreshold` | Crea OC pre-rellenada para aprobación (estado `draft`) |
| `purchaseOrder.statusChanged → available` | Suma stock al SKU correspondiente |
| `purchaseOrder.eta > scheduledDate + 5d` | Alerta Operations (impacto en instalación) |
| `installation.scheduled` | Reserva stock necesario (SKU.reservedM2) |

**Acceptance extra:** pipeline OC entero arrastrable, stock crítico genera OC sugerida con un click, lead times muestran datos calculados (no hardcoded).

---

### Fase 5 — Marketing

Submódulos:

- **Campañas CRUD** con periodo/canal/spend/objetivos.
- **Lead import** CSV (file input → parse → preview → bulk create).
- **Lead scoring** automático: reglas configurables (canal × source × score).
- **Lead nurture sequences**: editor visual de secuencias (4 emails en 21 días, etc.). Envíos mock.
- **Asset library**: imágenes/copy linkable desde campañas (sin upload real, URLs mock).
- **Content calendar**: vista mensual con posts/emails programados.
- **Attribution**: cada lead → deal → won, el deal acredita su valor a la campaña/canal de origen.

Automatizaciones:

| Trigger | Acción |
|---|---|
| `lead.created (channel=web)` | Inicia nurture sequence "bienvenida" |
| `lead.score > 75` | Mueve stage a SQL + asigna comercial |
| `lead.lastActivity > 30d AND stage<sql` | Re-nurture sequence |
| `campaign.budgetUsed > 80%` | Notifica marketing lead |

**Acceptance extra:** crear campaña, importar 50 leads CSV, ver attribution de ese lote en el funnel, mover uno manualmente a SQL.

---

### Fase 6 — Postventa

Submódulos:

- **Tickets list** con filtros prioridad/estado/asignado, búsqueda.
- **Ticket detail drawer**: comentarios (timeline), cambio de asignado, escalado manual, vincular a deal/partner.
- **Crear ticket**: manual + automático desde reseñas / damage reports / cobros vencidos.
- **Reviews aggregator**: lista + distribución por estrellas + textos.
- **NPS surveys**: enviar mock + recoger respuesta mock + cálculo NPS rolling 30d.
- **Top causas**: agrupación automática de tickets por categoría con tendencia.
- **Equipo soporte leaderboard**: tickets resueltos, tiempo medio, satisfacción post-resolución.

Automatizaciones:

| Trigger | Acción |
|---|---|
| `review.created (score <= 3)` | Ticket auto con prioridad alta + asigna a soporte de la región |
| `ticket.noActivity24h` | Escala +1 prioridad + notifica supervisor |
| `installation.completed` | Envía encuesta NPS al cliente (mock, 7 días después) |
| `ticket.closed` | Encuesta de satisfacción de cierre (mock) |

**Acceptance extra:** Crear reseña 2★ por consola dev tools → aparece ticket abierto automático → asignar → cerrar → ver NPS actualizado.

---

### Fase 7 — Tecnología

Submódulos:

- **Roadmap kanban** (4 columnas: Backlog/En curso/Review/Done) con drag, due dates, owner, departamento beneficiado.
- **Integrations health monitor**: pings simulados periódicos (setInterval) que actualizan latency y status.
- **Deploy log**: tabla de releases con versión, fecha, autor, changes (mock).
- **System metrics**: response time p95 + error rate (charts auto-actualizan con datos mock).
- **Audit log explorer**: tabla de todas las acciones de todos los usuarios, filtrable por user/action/entity/fecha.
- **Settings**: configurar tokens de color, stage probabilities, SLA thresholds, etc. Persistido en localStorage.

Automatizaciones:

| Trigger | Acción |
|---|---|
| `integration.latencyMs > 500` | Notificación a tech_lead |
| `integration.status = down` | Crea ticket Postventa con prioridad alta + notifica oncall |
| `auditLog.entry` (cualquier acción) | Persiste en repo + agrega a feed |

**Acceptance extra:** Audit log captura las últimas 200 acciones de cualquier rol, integrations health refresca cada 30s, roadmap drag persiste.

---

## 8. Features transversales (entran en Fase 0 o sucesivas)

### 8.1 Notificaciones

Centro unificado en topbar (badge + dropdown). Cada rol ve las suyas más las que el sistema dirige a su rol. Persiste read/unread.

### 8.2 Búsqueda global ⌘K

Modal con index plano de: partners, deals, invoices, clients, tickets, SKUs, crews. Resultados agrupados, click navega al detalle. Implementar con `cmdk` package.

### 8.3 Activity / Audit log universal

Cualquier mutación en `dataLayer` registra entrada en `auditLog`. Visible en cada entidad ("Historial") y agregada en Feed del equipo + Tecnología.

### 8.4 Builder de reglas de automation

UI 3-pasos: When (trigger) → If (conditions) → Then (actions). Dropdowns alimentados por los tipos definidos en `automations/triggers.ts` y `actions.ts`. Guardado como JSON en `automationRules`.

### 8.5 Export / Import

- CSV export por tabla (cualquier vista lista).
- JSON snapshot global ("Backup" en topbar).
- JSON import para restaurar.

### 8.6 Settings

Vista admin (solo `ceo` y `tech_lead`): tokens visuales, stage probabilities, SLA thresholds, payment reminder cadences, role permissions matrix.

---

## 9. Anti-objetivos (qué NO hacer todavía)

- No backend real. Todo localStorage.
- No auth real. Solo role switcher.
- No envíos reales de email, SMS, WhatsApp. Todo "mock email queue" visible en una vista para debug.
- No pagos reales. Solo links generados y simulación de webhook.
- No procesamiento de PDFs ni OCR.
- No i18n (todo español por ahora).
- No SSR / Next.js. Vite SPA es suficiente.
- No tests E2E todavía (unit en lógica de automation engine y permisos sí).
- No mobile-first. Optimizar desktop 1440px+, hacer "no roto" en 1024px+.

---

## 10. Criterios de aceptación globales

Cada PR de Claude Code debe pasar:

- [ ] `pnpm typecheck` sin errores.
- [ ] `pnpm lint` sin warnings.
- [ ] Build de Vite sin warnings.
- [ ] Sin uso de `any` salvo justificado en comentario.
- [ ] Cada `repository.update` o `.create` registra en auditLog.
- [ ] Cada mutación está envuelta en check de permisos.
- [ ] No hay strings de UI hardcoded en componentes — todo viene de la entidad o de `lib/copy.ts` para textos compartidos.
- [ ] Sin pure white (`#FFFFFF`) salvo en `--riva-white` para superficies de card.
- [ ] Sin radius > 4px, sin shadows, sin emojis fuera de contenido del usuario.
- [ ] Cada vista nueva añade entrada al sidebar respetando rol.
- [ ] README de la feature actualizado.

---

## 11. Prompt sugerido para arrancar Claude Code

> Carpeta de trabajo: `C:\Users\psanz\Desktop\Claudio\Viddix\RIVA\`.
> Lee `PLAN.md`, `DESIGN.md` y `hub-demo.html`. Estamos en **Fase 0**.
> Migra el `hub-demo.html` actual a una SPA React + Vite + TypeScript + Tailwind respetando estructura de `PLAN.md §1`. El diseño visual debe ser pixel-perfect vs el HTML actual.
> Implementa `dataLayer` (§5), seed.json (§4), AppShell + role switcher (§3), y las vistas no-departamentales: Dashboard holding, Partners list, Flagship detail, Integrations, Automatizaciones (read-only). Las 7 vistas de departamento entran en sus fases — por ahora pueden ser placeholders con `<UnderConstruction />`.
> Acceptance: navegar entre vistas, cambiar rol cambia sidebar, refrescar mantiene estado, sin warnings, sin pure white, todas las primitivas de chart implementadas como componentes React reusables.
> Al terminar, deja un `CHANGELOG.md` con lo hecho y lo pendiente, y un `STATUS.md` con el % de avance del plan.

Cada fase siguiente arranca con un prompt similar: "Estamos en Fase N, lee PLAN.md §7.N, implementa, criterios de aceptación en §10".

---

## 12. Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Scope creep — añadir features fuera de fase | Cada PR se valida contra la sección de su fase; nada que no esté listado |
| Truncamiento del engine de automation con muchas reglas | Limitar trigger fan-out (max 10 acciones por evento), debounce |
| localStorage limit (~5 MB) | Audit log y notificaciones se podan a últimas 500 entradas |
| Drift visual vs DESIGN.md | Tailwind config + Storybook (opcional Fase 8) para revisar primitivas |
| Trabajo duplicado entre fases | `dataLayer` y `automationEngine` listos al final de Fase 0, fases 1-7 solo consumen |

---

## 13. Siguiente paso inmediato

Arrancar Fase 0 con el prompt de §11. Al cierre de cada fase, actualizar `STATUS.md` y abrir el prompt de la siguiente.
