# CLAUDE.md — AI Assistant Guide

## What this project is

Hebrew-language (RTL) fullstack dashboard tracking Israel's Renewables Strategy 2035.
Node.js + Express backend, EJS templates, all content data-driven from `data/data.json`.

## Architecture at a glance

```
server.js          Routes + computeStats() helper
data/data.json     Single source of truth — edit data here, pages update automatically
views/             EJS templates (no logic beyond loops and conditionals)
public/            Static assets served by Express
staticsite/        Original static HTML (reference only — not served by Express)
```

## Data model

`data/data.json` has two top-level keys: `dashboard` and `initiatives`.

### Initiative shape

```jsonc
{
  "id": "dualuse",          // URL slug → /initiative/dualuse
  "title": "...",           // Hebrew display name
  "subtitle": "...",
  "icon": "ti-building",    // Tabler icon class (no "ti " prefix — added in template)
  "iconBg": "#E6F1FB",      // icon wrapper background
  "iconColor": "#185FA5",   // icon foreground color
  "color": "#378ADD",       // primary accent (timeline dots, icard progress bar)
  "type": "gw",             // "gw" shows GW values; "infra" shows "תשתית מאפשרת"
  "gwCurrent": 4.5,         // (gw only) installed GW
  "gwTarget": 9.5,          // (gw only) 2035 target GW
  "detailKpis": [...],      // 4 KPI cards for the detail page
  "actions": [...],         // policy steps — see below
  "milestones": [...]       // timeline events
}
```

### Action shape

```jsonc
{ "status": "done|progress|early|none", "title": "Hebrew text", "pct": 0-100 }
```

Status colors: `done` → green #639922 · `progress` → blue #378ADD · `early` → amber #BA7517 · `none` → gray #888780

### Milestone shape

```jsonc
{ "year": 2026, "state": "done|future", "label": "Hebrew text" }
```

Done milestones render with the initiative's `color`; future ones render as hollow gray dots.

## Computed fields (server.js — computeStats)

`computeStats(initiative)` is called per request and returns:
- `counts` — `{ done, progress, early, none }` — action counts by status
- `avgPct` — `Math.round(sum of action pcts / total)` — shown in overview icard progress bar
- `breakdown` — array of `{ status, label, count, pct }` — policy breakdown chart

These are merged into the initiative object before passing to EJS. Templates access them as `initiative.counts`, `initiative.avgPct`, `initiative.breakdown`.

## Adding a new initiative

1. Add an entry to `data/data.json` → `initiatives` array following the shape above.
2. Done — the server auto-routes `/initiative/:id` and `/api/initiatives/:id`.

No template changes needed unless you want a new layout variant.

## RTL / Hebrew conventions

- All pages are `lang="he" dir="rtl"` — do not remove.
- The "back" link uses `ti-arrow-right` which is visually correct in RTL (points left).
- CSS `direction: rtl` is set on `html, body` — progress bars inside `.apbar`, `.kpbar`, etc. override with `direction: ltr` so they fill left-to-right.
- Use `<%- %>` (unescaped) in EJS for Hebrew text — it contains middot `·` and quote marks `"`.

## CSS notes

- `public/dashboard-styles.css` is the single stylesheet — no build step.
- Dark mode is handled via `@media (prefers-color-scheme: dark)` CSS variable overrides.
- Status colors are applied via compound classes: `.aitem.done`, `.atag.progress`, etc.
- Per-initiative colors (icon backgrounds, timeline dots, progress fills) remain as inline styles since they vary per item.

## Running locally

```bash
npm install && npm start    # http://localhost:3000
npm run dev                 # nodemon auto-reload
PORT=8080 npm start         # custom port
```
