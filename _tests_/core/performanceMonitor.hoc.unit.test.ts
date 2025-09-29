import React from 'react';
import { Platform } from 'react-native';

import { performanceMonitor, withPerformanceTracking } from '@/utils/performance/performance';

describe('performance monitor HOC and memory', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
  });

  it('withPerformanceTracking starts and ends timer on mount/unmount', () => {
    const Comp = () => React.createElement('div', {});
    const Wrapped = withPerformanceTracking(Comp as any, 'MyComp');
    // mount/unmount via React lifecycle simulation using a simple render/unmount from react-test-renderer
    const renderer = require('react-test-renderer');
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(Wrapped, {}));
    });
    // Ensure effects have run and cleanup is invoked on unmount inside act
    renderer.act(() => {
      tree.unmount();
    });
  const metrics = performanceMonitor.getMetrics();
  // ensure at least one metric was recorded for the HOC
  expect(metrics.length).toBeGreaterThan(0);
  });

  it('getMemoryUsage returns web branch when Platform.OS === web', () => {
    // temporarily override Platform.OS
    const original = Platform.OS;
    // set web branch
    Platform.OS = 'web';
    // mock performance.memory
    // attach fake performance.memory for test
    global.performance = (global.performance || {}) as any;
    (global.performance as any).memory = { usedJSHeapSize: 400, jsHeapSizeLimit: 1000 };
    const mem = performanceMonitor.getMemoryUsage();
    expect(mem).toHaveProperty('used');
    // restore
    Platform.OS = original;
  });
});
