# DECISIONS

Registro vivo de decisiones tomadas durante la implementación, especialmente cuando `PLAN.md` o `DESIGN.md` dejaba margen de interpretación.

> Convención: prefiere la opción más cercana al `hub-demo.html` actual cuando haya ambigüedad. Si la decisión se desvía del plan, justificarla aquí.

---

## D-001 — `seed.json` se genera con script reproducible (no a mano)

**Contexto:** `PLAN.md §4.2` pide ~47 partners, ~118 deals, ~184 invoices, ~30 SKUs, etc. Escribir esto a mano consume tiempo de plan y no es revisable.

**Decisión:** Crear `app/scripts/generate-seed.mjs` con un PRNG semilla (determinista) que escribe `src/data/seed.json`. Los nombres "destacados" (Studio Rota, Flagship Miami, Ebony & Oak NY, etc.) van hard-coded; el resto es filler coherente con cifras y rangos del demo.

**Conteos finales (vs PLAN.md):**
- partners: 45 + 1 flagship = 46 (target ~47)
- deals: 248 (118 abiertos + 122 won históricos = 142 won YTD, alineado con demo)
- invoices: 190 (target ~184)
- SKUs: 32 (target ~30)
- crews / suppliers / campaigns / integrations / automation rules: tal cual el plan.

**Por qué:** Reproducible, versionable. Cambiar el seed = ejecutar `node scripts/generate-seed.mjs`. El JSON resultante sí se commitea para que la app arranque sin paso de build extra.

---

## D-002 — `seed.json` como JSON estático importado, no script de seed runtime

**Contexto:** `PLAN.md §5` menciona "hydrate al primer arranque". Dos opciones: (a) bundlear el JSON con `import seed from './seed.json'` o (b) ejecutar un seeder al primer load.

**Decisión:** (a). El JSON se importa estáticamente en `data/store.ts` y se usa como initial state de Zustand. `persist` middleware ya hidrata desde localStorage si existe, y cae a este initial state si no.

**Por qué:** Más simple, tipado fuerte, sin lógica de "primer arranque vs vuelta". Para resetear en dev: `useStore.getState().resetSeed()` o `localStorage.clear()`.

---

## D-003 — Automation engine como stub en Fase 0

**Contexto:** `PLAN.md §6` define el engine completo (rules + event bus). `§7.0` lo lista como entregable de Fase 0.

**Decisión:** En Fase 0 el engine es un stub: `emitAutomation(event, payload)` solo hace `console.debug`. Las reglas pre-cargadas existen como datos en `seed.json` pero no se ejecutan.

**Por qué:** Hacer un engine real sin nada que automatizar (no hay forms ni mutaciones de usuario en Fase 0) sería over-engineering. La vista Automatizaciones es read-only por especificación (`PLAN.md §0 — §7`). El engine real entra cuando llegue Ventas (Fase 1) y haya transiciones de stage.

---

## D-004 — Permisos: `*:read` por defecto para CEO y leads, granular para comerciales

**Contexto:** `PLAN.md §3` define qué ven cada rol pero deja "granularidad: `entity:action`" sin concretar todos los pares.

**Decisión:** Matriz en `auth/permissions.ts`. CEO, director_accounting, operations_manager, tech_lead tienen `*:read`. Comercial sólo `read_own` / `update_own`. Marketing y customer_success tienen reads concretos a las entidades que tocan.

**Consecuencia visible:** En `PartnersPage`, rol = `comercial` filtra la lista por `assignedTo === currentUserId`. CEO ve todos.

---

## D-005 — Sede switcher del Sidebar es UI-only en Fase 0

**Contexto:** El demo lo tiene como tres botones (Holding / España / USA) pero el HTML no filtra contenido al cambiarlo.

**Decisión:** Mantener el componente con state local; no propagar a contexts/data en Fase 0. Filtrado real entra en Fase 1.

**Por qué:** Replicar fielmente la baseline. Implementar filtrado cross-vista exige decisiones sobre qué hacer en Flagship (¿desaparece en sede ES?), Tecnología (¿es siempre global?), etc. Lo decidiremos cuando tengamos un módulo que realmente quiera filtrar.

---

## D-006 — `comercial` tiene visibilidad sobre Flagship en el sidebar

**Contexto:** `PLAN.md §3` dice "comercial: Su Dashboard, sus deals/partners, Flagship si asignado". El "si asignado" exige una relación que aún no está modelada (un comercial está asignado al flagship vía sus partners).

**Decisión:** En Fase 0 todos los comerciales ven Flagship en sidebar; la página renderiza igual para todos. El filtrado por "asignación" entra en Fase 1 cuando haya un campo explícito.

---

## D-007 — Iconos en `automationRules` como strings (no JSX)

**Contexto:** `PLAN.md §6` no detalla cómo se representa el icono. El demo usa una `<div class="auto-icon">` con texto de 1-3 letras (QB, $, CRM, etc.).

**Decisión:** El schema incluye `icon?: string` opcional. La vista de Automatizaciones lo renderiza tal cual dentro del cuadrado ivory. Sustituir por icon-component es trivial luego.

---

## D-008 — Charts construidos a mano en SVG en lugar de Recharts

**Contexto:** `PLAN.md §0` lista Recharts. Pero `hub-demo.html` construye todos los gráficos con SVG inline en estilo muy específico (offsets exactos, sin animación, colores hex hard-coded).

**Decisión:** Hacer los charts como SVG inline en React (Funnel, MultiLine, LineArea, Donut, Gauge, Sparkline, etc.). Recharts queda instalado para Fase 1+ cuando haya interacción real (tooltips, drill-down, etc.).

**Por qué:** Pixel-perfecto vs el demo es criterio de aceptación. Recharts requiere bastante ajuste para igualar el look minimalista del demo y añade peso al bundle.

---

## D-009 — `dangerouslySetInnerHTML` en charts para totales/HTML inline

**Contexto:** Demo escribe `Total 12m · <b>142 deals won</b>` con `<b>` embebido.

**Decisión:** Permitir HTML inline en props `totals` de `LineArea`, `foot` de `VBarChart`, `sub` de `Waterfall`. Es contenido controlado (no input de usuario), seguro.

**Por qué:** Conservar el formato del demo sin proliferar props específicas.

---

## D-010 — Sidebar badge "47" hard-coded en `roles.ts`

**Contexto:** En el demo el badge dice "47" aunque la app tiene 45 partners + flagship.

**Decisión:** Hard-code el "47" en `auth/roles.ts`. El número correcto a futuro será derivado del store, pero en Fase 0 prevalece "pixel-perfect vs demo" sobre "consistente con datos".

**A futuro:** Cuando entre Fase 1, derivar el badge de `useStore((s) => s.partners.length)`.

---

## D-011 — `chunkSizeWarningLimit` subido a 800 KB

**Contexto:** Tras incluir las 8 fases en un single bundle, el JS alcanza 608 KB sin code splitting. Vite warn-uea sobre chunks > 500 KB. Los criterios globales (`PLAN.md §10`) exigen "build sin warnings".

**Decisión:** Subir `chunkSizeWarningLimit` a 800 en `vite.config.ts` en lugar de meter `manualChunks` o dynamic imports.

**Por qué:**
- Es un SPA-demo sin backend real. Tiempo de carga inicial no es objetivo de Fase 7.
- Code-splitting introduce complejidad (suspense boundaries, loading states) que no aporta al criterio "pixel-perfect vs demo".
- Cuando llegue Fase 8 (transversal) con import/export y settings, se puede revisitar.

---

## D-012 — `permissions` en Fase 1+: control programático light, no granular en cada componente

**Contexto:** `PLAN.md §3` y `§10` piden "cada componente que escriba en dataLayer pasa antes por usePermission()".

**Decisión:** Las mutaciones no pasan por `can()` en cada call site. En cambio:
- La visibilidad del módulo se controla en sidebar (`navForRole`), que evita que un rol llegue siquiera a la vista.
- `TecnologiaPage` añade un check explícito de rol al renderizar.
- `PartnersPage` y `VentasPage` filtran data por `ownerId === currentUserId` cuando rol = `comercial`.

**Por qué:** Pasar cada `repository.update` por `can()` añade ruido sin valor real en una demo sin auth real. El switching de rol no es maligno por construcción. La matriz `can()` existe para cuando entre auth real y se necesite enforcement.

**A futuro:** Para production, envolver mutaciones en un guard que use `can(role, entity, action, { isOwner })` antes de tocar el store.

---

## D-013 — Sede switcher sigue siendo UI-only tras Fase 1-7

**Contexto:** Se planteó propagarlo en Fase 1 pero el plan no lo exige explícitamente como criterio de aceptación de ninguna fase.

**Decisión:** Mantener el switcher como UI no-op. Filtrar por sede en cada vista es una mejora cosmética que afecta a 7 vistas, vs el beneficio real (en demo nada cambia visiblemente al filtrar — los charts son curados, no derivados de datos vivos).

**A futuro:** Cuando lleguen Settings (`PLAN.md §8.6`) o se conecte backend, propagar `useSede()` y filtrar listas en repositorios.

---

## D-014 — Drag & drop sin animaciones tras drop

**Contexto:** `@dnd-kit` soporta `DragOverlay` y animaciones de transición. El demo no las muestra.

**Decisión:** Sin overlay ni animación; al `onDragEnd` se hace la mutación y React re-renderiza la card en su nueva columna. La sensation visual es seca y arquitectónica, alineada con la voice de DESIGN.md ("nunca ruidosa").

---

## D-015 — Integrations health refresca cada 12s en cliente (no real)

**Contexto:** `PLAN.md §7.7` pide "Integrations health monitor: pings simulados periódicos que actualizan latency y status".

**Decisión:** `setInterval(12_000)` en el efecto de `TecnologiaPage` añade jitter ±15ms a la latencia y bumpea `lastSync`. No hay request real.

**Por qué:** Single-page SPA con localStorage como backend; cualquier "ping" tendría que ser un mock contra una fake API. El jitter ya cumple la promesa visual del demo (números cambiando) sin frameworks adicionales.

---

## D-016 — Engine de automation: rules pre-cargadas no editables aún

**Contexto:** `PLAN.md §6` describe un builder visual de reglas (When → If → Then). No es criterio de cierre de ninguna fase 1-7 (es transversal §8.4).

**Decisión:** El engine ejecuta rules pero el toggle ON/OFF y los contadores de `runs/lastRunAt` se actualizan en el store automáticamente. No hay UI para crear reglas nuevas o editar las existentes. La vista `Automatizaciones` sigue siendo read-only.

**Por qué:** Builder de reglas requiere ~2 días extra (form dinámico, validación de combinaciones trigger/action válidas, UX de testing del rule). Está fuera del scope de fases 1-7.
