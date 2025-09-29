// Use the explicit JS mock to avoid module-mapping and jest.setup timing differences.
// This mirrors the existing smoke test pattern in this repo.
describe('parentalStore smoke tests', () => {
  it('mock provides ParentalProvider and useParentalStore (smoke)', () => {
  const mod = require('../../__mocks__/stores/parentalStore.js');
    expect(mod).toBeDefined();
    const provider = mod.ParentalProvider ?? (mod.default && mod.default.ParentalProvider);
    const hook = mod.useParentalStore ?? (mod.default && mod.default.useParentalStore);
    expect(provider).toBeDefined();
    expect(typeof provider === 'function' || typeof provider === 'object').toBe(true);
    expect(typeof hook === 'function').toBe(true);
  });
});
