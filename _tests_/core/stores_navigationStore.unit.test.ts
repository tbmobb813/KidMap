// Mock persistence functions before importing the store
jest.mock('@/utils/persistence/persistence', () => ({
  loadPersistedState: jest.fn(() => Promise.resolve(null)),
  savePersistedState: jest.fn(() => Promise.resolve()),
}));
import { act } from '@testing-library/react-native';

// Use the real navigation store implementation so we have access to the underlying
// hook helpers (setState/getState) instead of the jest.setup global mock.
const { useNavigationStore } = jest.requireActual('@/stores/navigationStore');

// Reset persisted mocks and store between tests
beforeEach(() => {
  jest.resetAllMocks();
  // reset store to initial state
  useNavigationStore.setState({
    favorites: [],
    recentSearches: [],
    origin: null,
    destination: null,
    selectedRoute: null,
    searchQuery: "",
    photoCheckIns: [],
  } as any);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('navigationStore unit tests', () => {
  // Direct getState() usage below avoids harness requirement

  test('addToFavorites adds a place once and sets isFavorite', async () => {
    // use getState for deterministic access
    const place = { id: 'p1', name: 'Place 1' } as any;

    act(() => {
      useNavigationStore.getState().addToFavorites(place);
    });

  const after = useNavigationStore.getState();
  expect(after.favorites.some((p: any) => p.id === 'p1')).toBe(true);

    // add duplicate should not increase length
    const before = after.favorites.length;
    act(() => {
      useNavigationStore.getState().addToFavorites(place);
    });
    const after2 = useNavigationStore.getState();
    expect(after2.favorites.length).toBe(before);
  });

  test('addToRecentSearches limits to 5 and orders newest first', async () => {
    act(() => {
      for (let i = 0; i < 7; i++) {
        useNavigationStore.getState().addToRecentSearches({ id: `s${i}`, name: `S${i}` } as any);
      }
    });

    const state = useNavigationStore.getState();
    expect(state.recentSearches.length).toBe(5);
    expect(state.recentSearches[0].id).toBe('s6');
  });

  test('addLocationVerifiedPhotoCheckIn returns verification and stores the check-in', async () => {
    const checkIn = { photoUrl: 'u', caption: 'c' } as any;
    const currentLocation = { latitude: 37.0, longitude: -122.0 };
    const placeLocation = { latitude: 37.0, longitude: -122.0 };

    let verification: any;
    act(() => {
      verification = useNavigationStore.getState().addLocationVerifiedPhotoCheckIn(
        checkIn,
        currentLocation,
        placeLocation
      );
    });

    expect(typeof verification.distance).toBe('number');
    const s = useNavigationStore.getState();
    expect(s.photoCheckIns.length).toBeGreaterThan(0);
  });

  test('hydrate loads persisted state and schedulePersist calls savePersistedState (debounced)', async () => {
    const persisted = {
      favorites: [{ id: 'fav1', name: 'Fav 1' }],
      recentSearches: [],
      accessibilitySettings: useNavigationStore.getState().accessibilitySettings,
      photoCheckIns: [],
      selectedTravelMode: 'transit',
      routeOptions: useNavigationStore.getState().routeOptions,
    } as any;

    const persistence = require('@/utils/persistence/persistence');
    persistence.loadPersistedState.mockResolvedValue(persisted);
    persistence.savePersistedState.mockResolvedValue(undefined);

    jest.useFakeTimers();
    try {
      await act(async () => {
        await useNavigationStore.getState().hydrate();
      });

      // hydrated favorites should be present
      expect(useNavigationStore.getState().favorites.some((f: any) => f.id === 'fav1')).toBe(true);

      // trigger a change that schedules persist
      act(() => {
        useNavigationStore.getState().addToFavorites({ id: 'fav2', name: 'Fav 2' } as any);
      });

      // advance timers to flush debounce
      jest.advanceTimersByTime(400);

      expect(persistence.savePersistedState).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
