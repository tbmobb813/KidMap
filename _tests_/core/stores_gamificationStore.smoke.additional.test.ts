describe('gamificationStore smoke tests', () => {
  beforeEach(() => jest.resetModules());

  it('unlock achievement and addPoints update userStats', () => {
    jest.isolateModules(() => {
      // Mock AsyncStorage used by zustand persist
      jest.doMock('@react-native-async-storage/async-storage', () => ({
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      }));

      const { useGamificationStore } = require('@/stores/gamificationStore');

      // ensure fresh store
      const store = useGamificationStore.getState();
      const initialPoints = store.userStats.totalPoints;

      store.addPoints(250);
      const after = useGamificationStore.getState().userStats;
      expect(after.totalPoints).toBeGreaterThanOrEqual(initialPoints + 250);

      // unlock an achievement
  const pre = useGamificationStore.getState().achievements.find((a: any) => a.id === 'first-trip');
      expect(pre).toBeDefined();
      expect(pre?.unlocked).toBeFalsy();

      useGamificationStore.getState().unlockAchievement('first-trip');
  const post = useGamificationStore.getState().achievements.find((a: any) => a.id === 'first-trip');
      expect(post?.unlocked).toBeTruthy();
    });
  });
});
