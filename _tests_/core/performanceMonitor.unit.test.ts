import { performanceMonitor } from '@/utils/performance/performance';

describe('PerformanceMonitor', () => {
  let monitor: any;

  beforeEach(() => {
    monitor = performanceMonitor;
    monitor.clearMetrics();
  });

  it('records a timer between startTimer and endTimer', () => {
    const id = 'test-timer';
    monitor.startTimer(id);
    monitor.endTimer(id);
    const metrics = monitor.getMetrics();
    expect(metrics.some((m: any) => m.name === id)).toBe(true);
  });

  it('clearMetrics empties recorded metrics', () => {
    monitor.startTimer('x');
    monitor.endTimer('x');
    expect(monitor.getMetrics().length).toBeGreaterThan(0);
    monitor.clearMetrics();
    expect(monitor.getMetrics().length).toBe(0);
  });
});
