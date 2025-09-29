// no React renderer required for this low-risk smoke test

describe('navigationStore smoke tests', () => {
  beforeEach(() => jest.resetModules());

  it('exports a usable navigation store API (smoke)', () => {
    jest.resetModules();
    // Keep the test low-risk: ensure the module exports the hook and getState accessor
    const nav = require('@/stores/navigationStore');
    expect(nav).toBeDefined();
    expect(typeof nav.useNavigationStore).toBe('function');
    // getState may be attached to the hook as a property
    expect(typeof (nav.useNavigationStore as any).getState === 'function' || typeof nav.useNavigationStore().setOrigin === 'function').toBe(true);
  });
});
