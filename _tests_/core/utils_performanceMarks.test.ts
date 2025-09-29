import { mark, measure, getMarks, clearMarks } from '@/utils/performance/performanceMarks';

describe('performanceMarks utilities', () => {
  beforeEach(() => {
    clearMarks();
    jest.resetModules();
    // ensure test env is active
  (process as any).env.NODE_ENV = 'test';
  });

  it('records marks and measures correctly', () => {
    // mark two points
    mark('start');
    // synthetic wait using a manual mark time injection is not available, but marks use performance.now()
    // create a second mark
    mark('end');

    // measure between marks
    measure('duration', 'start', 'end');

    const { marks: m, measures } = getMarks();
    expect(Array.isArray(m)).toBe(true);
    expect(m.find(x => x.name === 'start')).toBeDefined();
    expect(m.find(x => x.name === 'end')).toBeDefined();
    // measure may be recorded if times are monotonic
    expect(measures.some(ms => ms.name === 'duration')).toBe(true);
  });

  it('clearMarks resets stored data', () => {
    mark('a');
    mark('b');
    measure('d', 'a', 'b');
    expect(getMarks().marks.length).toBeGreaterThan(0);
    clearMarks();
    expect(getMarks().marks.length).toBe(0);
    expect(getMarks().measures.length).toBe(0);
  });
});
