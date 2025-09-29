// Import the test mock directly (JS file) to avoid type-resolution issues
const { useParentalStore } = require('../../../__mocks__/stores/parentalStore.js');

describe('parentalStore smoke', () => {
  it('provides the expected default shape (mock)', () => {
    const store = useParentalStore();
    expect(store).toBeDefined();
    expect(store.settings).toBeDefined();
    expect(Array.isArray(store.settings.emergencyContacts)).toBe(true);
  });
});
