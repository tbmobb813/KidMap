import { mark, measure, getMarks, clearMarks } from '../../utils/performance/performanceMarks';

describe('performanceMarks', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalNow = global.performance && global.performance.now;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalNow) global.performance.now = originalNow;
  });

  beforeEach(() => {
    clearMarks();
  });

  test('records marks and measures with deterministic performance.now', () => {
    let now = 1000;
    global.performance.now = () => now;

    mark('start');
    now += 50; // 50ms later
    mark('end');
    measure('duration', 'start', 'end');

    const { marks, measures } = getMarks();
    expect(marks.length).toBe(2);
    expect(measures.length).toBe(1);
    expect(Math.round(measures[0].duration)).toBe(50);
  });

  test('does not push measure if marks missing', () => {
    let now = 2000;
    global.performance.now = () => now;

    mark('single');
    // attempt measure with missing end
    measure('bad', 'single', 'missing');
    const { measures } = getMarks();
    expect(measures.length).toBe(0);
  });
});
