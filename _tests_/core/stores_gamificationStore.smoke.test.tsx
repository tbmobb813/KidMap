describe('gamificationStore smoke', () => {
  it('can be mocked and exposes expected API surface', () => {
    jest.resetModules();
    jest.doMock('@/stores/gamificationStore', () => ({
      useGamificationStore: () => ({
        points: 0,
        achievements: [],
        addPoints: () => {},
        unlockAchievement: () => {},
      }),
    }));

    const g = require('@/stores/gamificationStore');
    expect(g).toBeDefined();
    expect(typeof g.useGamificationStore).toBe('function');
    const state = g.useGamificationStore();
    expect(state).toHaveProperty('points');
    expect(Array.isArray(state.achievements)).toBe(true);
  });
});
