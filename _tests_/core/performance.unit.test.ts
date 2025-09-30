import { Platform } from 'react-native';

import { performanceMonitor } from '../../utils/performance/performance';

describe('performance monitor', () => {
  afterEach(() => {
    performanceMonitor.clearMetrics();
  });

  test('start/end timer records a metric', () => {
    const name = 'testTimer';
    // use Date.now mock to make duration deterministic
    const nowSpy = jest.spyOn(Date, 'now').mockImplementationOnce(() => 1000)
      .mockImplementationOnce(() => 1100);

    performanceMonitor.startTimer(name);
    const dur = performanceMonitor.endTimer(name);
    expect(dur).toBe(100);
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.some(m => m.name === name)).toBe(true);

    nowSpy.mockRestore();
  });

  test('getMemoryUsage returns zeros for web', () => {
    const orig = Platform.OS;
  // mutate for test
  (Platform as any).OS = 'web';
    const mem = performanceMonitor.getMemoryUsage();
    expect(mem.used).toBe(0);
    expect(mem.total).toBe(0);
    // restore
  // restore
  (Platform as any).OS = orig;
  });

  test('withPerformanceTracking HOC records render timer', () => {
    jest.isolateModules(() => {
      // require inside isolateModules so both the HOC and the spy reference the same module instance
  const perf = require('../../utils/performance/performance');
  const ReactLocal = require('react');
  const rendererLocal = require('react-test-renderer');

      const Dummy = () => ReactLocal.createElement('div');
      const Tracked = perf.withPerformanceTracking(Dummy, 'Dummy');

      const spy = jest.spyOn(perf.performanceMonitor, 'recordMetric');

      let tree: any;
      rendererLocal.act(() => {
        tree = rendererLocal.create(ReactLocal.createElement(Tracked, {}));
      });

      rendererLocal.act(() => {
        if (tree) tree.unmount();
      });

      expect(spy).toHaveBeenCalled();
      const calledWithName = spy.mock.calls.some(c => typeof c[0] === 'string' && (c[0] as string).includes('Dummy'));
      expect(calledWithName).toBe(true);

      spy.mockRestore();
    });
  });
});
