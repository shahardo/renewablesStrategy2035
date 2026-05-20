#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');
const ejs  = require('ejs');

const { computeStats } = require('./server');
const rawData = require('./data/data.json');

const VIEWS = path.join(__dirname, 'views');
const OUT   = path.join(__dirname, 'staticsite');

// ── URL rewriting ─────────────────────────────────────────────────────────────

function staticify(html) {
  return html
    .replace(/href="\/dashboard-styles\.css"/g, 'href="dashboard-styles.css"')
    .replace(/href="\/initiative\/([^"]+)"/g,   (_, id) => `href="${id}.html"`)
    .replace(/href="\/"/g,                       'href="index.html"');
}

async function render(template, locals) {
  const html = await ejs.renderFile(
    path.join(VIEWS, `${template}.ejs`),
    locals,
    { views: [VIEWS] }
  );
  return staticify(html);
}

// ── Shared sidebar data ───────────────────────────────────────────────────────

const sidebarItems = rawData.initiatives.map(i => {
  const { counts, avgPct } = computeStats(i);
  return {
    id: i.id, title: i.title, icon: i.icon,
    iconBg: i.iconBg, iconColor: i.iconColor, color: i.color,
    avgPct, done: counts.done, total: i.actions.length,
  };
});

// ── Build ─────────────────────────────────────────────────────────────────────

async function build() {
  fs.mkdirSync(OUT, { recursive: true });

  // Keep CSS in sync
  fs.copyFileSync(
    path.join(__dirname, 'public', 'dashboard-styles.css'),
    path.join(OUT, 'dashboard-styles.css')
  );
  console.log('✓ dashboard-styles.css');

  // Dashboard → index.html
  const initiatives = rawData.initiatives.map(i => ({ ...i, ...computeStats(i) }));
  const dash = await render('dashboard', {
    kpis:           rawData.dashboard.kpis,
    capacityTracks: rawData.dashboard.capacityTracks,
    initiatives,
    charts:         rawData.charts,
    sidebarItems,
    activePage:     'dashboard',
  });
  fs.writeFileSync(path.join(OUT, 'index.html'), dash, 'utf8');
  console.log('✓ index.html');

  // One page per initiative
  for (const base of rawData.initiatives) {
    const initiative = { ...base, ...computeStats(base) };
    const html = await render('initiative', { initiative, sidebarItems, activePage: base.id });
    fs.writeFileSync(path.join(OUT, `${base.id}.html`), html, 'utf8');
    console.log(`✓ ${base.id}.html`);
  }

  console.log('\nstaticsite/ is ready for GitHub Pages.');
}

build().catch(err => { console.error(err); process.exit(1); });
