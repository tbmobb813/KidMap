// Ensure persistence helpers are mocked before requiring the store
jest.mock('@/utils/persistence/persistence', () => ({
  loadPersistedState: jest.fn(() => Promise.resolve(null)),
  savePersistedState: jest.fn(),
}));

// Require actual implementation after mocks are set up
const realNav = jest.requireActual<any>('@/stores/navigationStore');
const useNavigationStore = realNav.useNavigationStore;

describe('navigationStore persistence', () => {
  jest.setTimeout(15000);

  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
    // reset store state if the store exposes a reset (best-effort)
    if (typeof useNavigationStore.getState === 'function' && useNavigationStore.getState().reset) {
      useNavigationStore.getState().reset();
    }
  });

  test('schedules and calls savePersistedState when mutating favorites', () => {
    // Use fake timers only inside this test to avoid interfering with global
    jest.useFakeTimers();
    try {
      // call the store directly via getState to avoid rendering hooks
      useNavigationStore.getState().addToFavorites({ id: 'persist_test', name: 'P' } as any);

      // not yet called immediately due to debounce
      const mocked = jest.requireMock('@/utils/persistence/persistence');
      expect(mocked.savePersistedState).not.toHaveBeenCalled();

      // advance timers to trigger debounce
      jest.advanceTimersByTime(350);

      expect(mocked.savePersistedState).toHaveBeenCalled();
      const savedArg = mocked.savePersistedState.mock.calls[0][0];
      expect(Array.isArray(savedArg.favorites)).toBe(true);
      expect(savedArg.favorites.some((p: any) => p.id === 'persist_test')).toBe(true);
    } finally {
      // restore real timers so testing-library's global hooks and other tests run normally
      jest.useRealTimers();
    }
  });
});
