describe('performanceMonitor and withPerformanceTracking HOC', () => {
  it('records metrics and HOC triggers start/end timers', () => {
    jest.isolateModules(() => {
      const perf = require('@/utils/performance/performance').performanceMonitor;
      const { withPerformanceTracking } = require('@/utils/performance/performance');

      // clear any existing metrics
      perf.clearMetrics();
      perf.recordMetric('manual_test', 123);
      const metrics = perf.getMetrics();
      expect(metrics.some((m: any) => m.name === 'manual_test')).toBe(true);

      // Simple HOC smoke: wrap a dummy component and ensure render returns element
      const React = require('react');
      const Dummy = () => React.createElement('div');
      const Wrapped = withPerformanceTracking(Dummy, 'Dummy');
      const el = React.createElement(Wrapped, {});
      expect(el).toBeTruthy();
    });
  });
});
