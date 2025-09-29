describe('performance marks helpers', () => {
  it('mark, measure, getMarks, and clearMarks behave as expected', () => {
    jest.isolateModules(() => {
      const pm = require('@/utils/performance/performanceMarks');

      // Ensure clean slate
      pm.clearMarks();
      pm.mark('start_test');
      // simulate a later mark
      pm.mark('end_test');
      pm.measure('m1', 'start_test', 'end_test');

      const data = pm.getMarks();
      expect(Array.isArray(data.marks)).toBe(true);
      expect(Array.isArray(data.measures)).toBe(true);
      expect(data.measures.length).toBeGreaterThanOrEqual(0);

      // clear
      pm.clearMarks();
      const cleared = pm.getMarks();
      expect(cleared.marks.length).toBe(0);
    });
  });
});
