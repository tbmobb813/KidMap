describe('navigationStore smoke', () => {
  it('exports useNavigationStore from mocked store', () => {
    // require the module to inspect what jest.setup mocks provided
    const nav = require('@/stores/navigationStore');
    expect(nav).toBeDefined();
    expect(typeof nav.useNavigationStore === 'function').toBe(true);
  });
});
