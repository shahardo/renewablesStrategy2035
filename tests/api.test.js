const request = require('supertest');
const { app } = require('../server');

describe('GET /api/dashboard', () => {
  test('returns 200 JSON', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  test('has 5 KPI cards', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body.kpis).toHaveLength(5);
  });

  test('has 4 capacity tracks', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.body.capacityTracks).toHaveLength(4);
  });
});

describe('GET /api/initiatives', () => {
  test('returns all 6 initiatives', async () => {
    const res = await request(app).get('/api/initiatives');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
  });

  test('each initiative has computed fields', async () => {
    const res = await request(app).get('/api/initiatives');
    for (const init of res.body) {
      expect(init).toHaveProperty('avgPct');
      expect(init).toHaveProperty('counts');
      expect(init).toHaveProperty('breakdown');
      expect(init.breakdown).toHaveLength(4);
    }
  });

  test('slugs are unique', async () => {
    const res = await request(app).get('/api/initiatives');
    const ids = res.body.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('GET /api/initiatives/:slug', () => {
  test('returns the correct initiative', async () => {
    const res = await request(app).get('/api/initiatives/dualuse');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('dualuse');
    expect(res.body.title).toBe('מיצוי דו-שימוש');
  });

  test('includes computed stats', async () => {
    const res = await request(app).get('/api/initiatives/dualuse');
    expect(res.body.avgPct).toBe(40);
    expect(res.body.counts.done).toBe(2);
    expect(res.body.counts.progress).toBe(3);
  });

  test('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/initiatives/doesnotexist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('all 6 slugs resolve', async () => {
    const slugs = ['dualuse', 'agrovoltaics', 'landsystems', 'gridnstorage', 'govleadership', 'technologies'];
    for (const slug of slugs) {
      const res = await request(app).get(`/api/initiatives/${slug}`);
      expect(res.status).toBe(200);
    }
  });
});
