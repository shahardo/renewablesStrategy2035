const { computeStats } = require('../server');

const makeInitiative = (actions) => ({ actions });

describe('computeStats — counts', () => {
  test('counts each status correctly', () => {
    const { counts } = computeStats(makeInitiative([
      { status: 'done',     pct: 100 },
      { status: 'done',     pct: 80  },
      { status: 'progress', pct: 50  },
      { status: 'early',    pct: 20  },
      { status: 'none',     pct: 0   },
    ]));
    expect(counts).toEqual({ done: 2, progress: 1, early: 1, none: 1 });
  });

  test('all-done initiative has zero others', () => {
    const { counts } = computeStats(makeInitiative([
      { status: 'done', pct: 100 },
      { status: 'done', pct: 100 },
    ]));
    expect(counts).toEqual({ done: 2, progress: 0, early: 0, none: 0 });
  });
});

describe('computeStats — avgPct', () => {
  test('computes average of action pcts', () => {
    const { avgPct } = computeStats(makeInitiative([
      { status: 'done', pct: 100 },
      { status: 'none', pct: 0   },
    ]));
    expect(avgPct).toBe(50);
  });

  test('rounds to nearest integer', () => {
    // (10 + 20 + 30) / 3 = 20.0 — exact
    const { avgPct } = computeStats(makeInitiative([
      { status: 'progress', pct: 10 },
      { status: 'progress', pct: 20 },
      { status: 'progress', pct: 30 },
    ]));
    expect(avgPct).toBe(20);
  });

  test('rounds 0.5 up', () => {
    // (0 + 1) / 2 = 0.5 → 1
    const { avgPct } = computeStats(makeInitiative([
      { status: 'none', pct: 0 },
      { status: 'none', pct: 1 },
    ]));
    expect(avgPct).toBe(1);
  });
});

describe('computeStats — breakdown', () => {
  const actions = [
    { status: 'done',     pct: 100 },
    { status: 'done',     pct: 80  },
    { status: 'progress', pct: 40  },
    { status: 'none',     pct: 0   },
    { status: 'none',     pct: 0   },
  ];

  test('has four entries in order: done, progress, early, none', () => {
    const { breakdown } = computeStats(makeInitiative(actions));
    expect(breakdown.map(b => b.status)).toEqual(['done', 'progress', 'early', 'none']);
  });

  test('breakdown counts match action counts', () => {
    const { breakdown } = computeStats(makeInitiative(actions));
    expect(breakdown.find(b => b.status === 'done').count).toBe(2);
    expect(breakdown.find(b => b.status === 'progress').count).toBe(1);
    expect(breakdown.find(b => b.status === 'early').count).toBe(0);
    expect(breakdown.find(b => b.status === 'none').count).toBe(2);
  });

  test('breakdown pcts are proportional to total', () => {
    const { breakdown } = computeStats(makeInitiative(actions)); // total = 5
    expect(breakdown.find(b => b.status === 'done').pct).toBe(40);     // 2/5
    expect(breakdown.find(b => b.status === 'progress').pct).toBe(20); // 1/5
    expect(breakdown.find(b => b.status === 'early').pct).toBe(0);     // 0/5
    expect(breakdown.find(b => b.status === 'none').pct).toBe(40);     // 2/5
  });
});

describe('computeStats — real initiative data', () => {
  const data = require('../data/data.json');

  // avgPct values were verified against the original static HTML
  const expected = {
    dualuse:       40,
    agrovoltaics:  38,
    landsystems:   27,
    gridnstorage:  19,
    govleadership: 18,
    technologies:  19,
  };

  for (const [id, pct] of Object.entries(expected)) {
    test(`${id} avgPct = ${pct}`, () => {
      const initiative = data.initiatives.find(i => i.id === id);
      expect(computeStats(initiative).avgPct).toBe(pct);
    });
  }
});
