const express = require('express');
const path = require('path');
const data = require('./data/data.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

function computeStats(initiative) {
  const actions = initiative.actions;
  const total = actions.length;
  const counts = { done: 0, progress: 0, early: 0, none: 0 };
  let pctSum = 0;
  for (const a of actions) {
    counts[a.status]++;
    pctSum += a.pct;
  }
  const avgPct = Math.round(pctSum / total);
  const breakdown = [
    { status: 'done',     label: 'הושלם',            count: counts.done,     pct: Math.round(counts.done     / total * 100) },
    { status: 'progress', label: 'בביצוע',            count: counts.progress, pct: Math.round(counts.progress / total * 100) },
    { status: 'early',    label: 'בשלבים ראשונים',   count: counts.early,    pct: Math.round(counts.early    / total * 100) },
    { status: 'none',     label: 'טרם החל',           count: counts.none,     pct: Math.round(counts.none     / total * 100) },
  ];
  return { counts, avgPct, breakdown };
}

// Sidebar items computed once at startup (data is static)
const sidebarItems = data.initiatives.map(i => {
  const { counts, avgPct } = computeStats(i);
  return {
    id:        i.id,
    title:     i.title,
    icon:      i.icon,
    iconBg:    i.iconBg,
    iconColor: i.iconColor,
    color:     i.color,
    avgPct,
    done:      counts.done,
    total:     i.actions.length,
  };
});

// ── Pages ─────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  const initiatives = data.initiatives.map(i => ({ ...i, ...computeStats(i) }));
  res.render('dashboard', {
    kpis: data.dashboard.kpis,
    capacityTracks: data.dashboard.capacityTracks,
    initiatives,
    charts: data.charts,
    sidebarItems,
    activePage: 'dashboard',
  });
});

app.get('/initiative/:slug', (req, res) => {
  const base = data.initiatives.find(i => i.id === req.params.slug);
  if (!base) return res.status(404).render('404', { sidebarItems, activePage: '' });
  res.render('initiative', {
    initiative: { ...base, ...computeStats(base) },
    sidebarItems,
    activePage: req.params.slug,
  });
});

// ── REST API ──────────────────────────────────────────────────────────────

app.get('/api/dashboard', (req, res) => {
  res.json(data.dashboard);
});

app.get('/api/initiatives', (req, res) => {
  res.json(data.initiatives.map(i => ({ ...i, ...computeStats(i) })));
});

app.get('/api/initiatives/:slug', (req, res) => {
  const base = data.initiatives.find(i => i.id === req.params.slug);
  if (!base) return res.status(404).json({ error: 'Not found' });
  res.json({ ...base, ...computeStats(base) });
});

// ── Start ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = { app, computeStats };
