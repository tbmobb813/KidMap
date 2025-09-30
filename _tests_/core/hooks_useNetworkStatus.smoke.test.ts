describe('useNetworkStatus smoke', () => {
  it('exports a hook that can be mocked via jest', () => {
    jest.resetModules();
    jest.doMock('@/hooks/useNetworkStatus', () => ({
      useNetworkStatus: () => ({ isConnected: false, effectiveType: '4g' }),
    }));

    const mod = require('@/hooks/useNetworkStatus');
    expect(mod).toBeDefined();
    expect(typeof mod.useNetworkStatus).toBe('function');
    const val = mod.useNetworkStatus();
    expect(val).toHaveProperty('isConnected', false);
  });
});
