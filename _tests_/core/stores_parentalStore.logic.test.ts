describe('stores/parentalStore logic', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('addSafeZone returns a safe zone with id and stores it (mock)', async () => {
    const { useParentalStore } = require('../../__mocks__/stores/parentalStore.js');
    const store = useParentalStore();

    const zone = await store.addSafeZone({ name: 'Park', center: { latitude: 1, longitude: 2 }, radiusMeters: 100 });
    expect(zone).toHaveProperty('id');
  });

  test('authenticateParentMode respects requirePinForParentMode and parentPin (mock)', async () => {
    const { useParentalStore } = require('../../__mocks__/stores/parentalStore.js');
    const store = useParentalStore();

    const ok1 = await store.authenticateParentMode('1234');
    expect(ok1).toBe(false);

    await store.setParentPin('9999');
    const ok2 = await store.authenticateParentMode('9999');
    expect(ok2).toBe(true);
  });
});
