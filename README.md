# Israel Renewables Strategy 2035 — Dashboard

A Hebrew-language (RTL) fullstack tracking dashboard for Israel's renewable energy plan.
Tracks progress across **6 strategic initiatives** toward a **26 GW target by 2035**.

## Quick start

```bash
npm install
npm start          # production  →  http://localhost:3000
npm run dev        # dev (auto-reload via nodemon)
```

## Pages

| URL | Description |
|-----|-------------|
| `/` | Overview dashboard — KPIs, capacity tracks, 6 initiative cards |
| `/initiative/:slug` | Initiative detail — policy actions, milestone timeline, breakdown |

Valid slugs: `dualuse` · `agrovoltaics` · `landsystems` · `gridnstorage` · `govleadership` · `technologies`

## REST API

| Endpoint | Returns |
|----------|---------|
| `GET /api/dashboard` | Overview KPIs + capacity track data |
| `GET /api/initiatives` | All 6 initiatives with computed stats |
| `GET /api/initiatives/:slug` | Single initiative with computed stats |

Computed fields added at request time: `counts` (done/progress/early/none), `avgPct` (average policy completion %), `breakdown` (chart data for the policy breakdown bars).

## Project structure

```
├── server.js            Express app + routes
├── data/
│   └── data.json        Single source of truth for all dashboard data
├── views/
│   ├── dashboard.ejs    Overview page template
│   ├── initiative.ejs   Initiative detail template
│   └── 404.ejs
├── public/
│   └── dashboard-styles.css
└── staticsite/          Original static HTML files (reference only)
```

## Data model

All content lives in `data/data.json`. The top-level shape is:

```json
{
  "dashboard": { "kpis": [...], "capacityTracks": [...] },
  "initiatives": [...]
}
```

Each initiative has `id`, `title`, `subtitle`, `icon`, colors, `type` (`"gw"` or `"infra"`),
`detailKpis`, `actions` (with `status` + `pct` per step), and `milestones`.

## Tech stack

- **Runtime**: Node.js
- **Framework**: Express 4
- **Templates**: EJS
- **CSS**: Hand-crafted, RTL, dark-mode-aware CSS variables
- **Icons**: [Tabler Icons](https://tabler.io/icons) webfont via CDN
- **Fonts**: Heebo (Hebrew) + DM Sans via Google Fonts
