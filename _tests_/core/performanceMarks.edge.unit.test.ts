import { mark, measure, getMarks, clearMarks } from '@/utils/performance/performanceMarks';

describe('performanceMarks edge cases', () => {
  beforeEach(() => {
    clearMarks();
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';
    // deterministic performance.now sequence for tests
    let t = 1000;
  global.performance = { now: () => (t += 1) } as any;
  });

  it('does not create measures when start or end mark is missing', () => {
    mark('only-start');
    // attempt to measure with missing end mark
    measure('m1', 'only-start', 'missing-end');
    // attempt to measure with missing start mark
    measure('m2', 'missing-start', 'only-start');
    const { measures } = getMarks();
    expect(measures.length).toBe(0);
  });

  it('does not create measure when end is before start', () => {
    // push marks in reverse order to create end < start
    mark('end');
    // artificially manipulate timing by clearing and re-adding marks
    // The actual ordering matters: measure uses reverse().find so this will still find times
    mark('start');
    measure('m', 'start', 'end');
    const { measures } = getMarks();
    // end time is earlier than start, so measure should not be added
    expect(measures.length).toBe(0);
  });
});
