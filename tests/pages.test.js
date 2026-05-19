const request = require('supertest');
const { app } = require('../server');

describe('GET /', () => {
  let res;
  beforeAll(async () => { res = await request(app).get('/'); });

  test('returns 200 HTML', () => {
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  test('contains all 6 initiative links', () => {
    const slugs = ['dualuse', 'agrovoltaics', 'landsystems', 'gridnstorage', 'govleadership', 'technologies'];
    for (const slug of slugs) {
      expect(res.text).toContain(`/initiative/${slug}`);
    }
  });

  test('dashboard sidebar item is marked active', () => {
    expect(res.text).toMatch(/class="sidebar-item active"[^>]*>\s*[\s\S]*?מבט כולל/);
  });

  test('no initiative sidebar item is active', () => {
    const slugs = ['dualuse', 'agrovoltaics', 'landsystems', 'gridnstorage', 'govleadership', 'technologies'];
    for (const slug of slugs) {
      expect(res.text).not.toContain(`href="/initiative/${slug}" class="sidebar-item active"`);
    }
  });

  test('renders KPI grid', () => {
    expect(res.text).toContain('kgrid');
    expect(res.text).toContain('kcard');
  });
});

describe('GET /initiative/:slug', () => {
  test('renders dualuse page with correct title', async () => {
    const res = await request(app).get('/initiative/dualuse');
    expect(res.status).toBe(200);
    expect(res.text).toContain('מיצוי דו-שימוש');
  });

  test('marks the correct sidebar item as active', async () => {
    const res = await request(app).get('/initiative/agrovoltaics');
    expect(res.text).toContain('href="/initiative/agrovoltaics" class="sidebar-item active"');
  });

  test('dashboard sidebar item is not active on initiative page', async () => {
    const res = await request(app).get('/initiative/dualuse');
    // The back link points to / but the dashboard nav item should not be active
    expect(res.text).not.toMatch(/href="\/" class="sidebar-item active"/);
  });

  test('renders back link', async () => {
    const res = await request(app).get('/initiative/dualuse');
    expect(res.text).toContain('חזרה למבט כולל');
  });

  test('renders milestone timeline', async () => {
    const res = await request(app).get('/initiative/dualuse');
    expect(res.text).toContain('ציר אבני דרך');
    expect(res.text).toContain('tldot done');
    expect(res.text).toContain('tldot future');
  });

  test('renders policy breakdown section', async () => {
    const res = await request(app).get('/initiative/dualuse');
    expect(res.text).toContain('פילוח צעדי מדיניות');
    expect(res.text).toContain('sbfill done');
  });

  test('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/initiative/doesnotexist');
    expect(res.status).toBe(404);
    expect(res.text).toContain('404');
  });
});
