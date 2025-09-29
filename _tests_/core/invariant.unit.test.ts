describe('invariant helper', () => {
  it('warns in dev when condition is false', () => {
    jest.isolateModules(() => {
      // Ensure __DEV__ true for this module
      (global as any).__DEV__ = true;
      const inv = require('@/utils/error/invariant');
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      inv.invariant(false, 'test message');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      (global as any).__DEV__ = undefined;
    });
  });
});
