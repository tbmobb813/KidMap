import { act } from '@testing-library/react-native';

describe('navigationStore focused coverage tests', () => {
  beforeEach(() => {
    // Reset module registry so the store is recreated fresh per test
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('findRoutesAsync returns early when origin or destination missing', async () => {
    // Mock persistence to avoid side-effects
    jest.doMock('@/utils/persistence/persistence', () => ({
      loadPersistedState: jest.fn().mockResolvedValue(null),
      savePersistedState: jest.fn(),
    }));

    // Ensure fetchRoutes exists but won't be called in this scenario
    jest.doMock('@/services/routeService', () => ({
      fetchRoutes: jest.fn(),
    }));

    const nav = jest.requireActual('@/stores/navigationStore');
    const useNavigationStore = nav.useNavigationStore;

    // Ensure initial state has no origin/destination
    expect(useNavigationStore.getState().origin).toBeNull();
    expect(useNavigationStore.getState().destination).toBeNull();

    await act(async () => {
      await useNavigationStore.getState().findRoutesAsync();
    });

    // Should not set a selected route and routesLoading should be false
    expect(useNavigationStore.getState().selectedRoute).toBeNull();
    expect(useNavigationStore.getState().routesLoading).toBe(false);
  });

  it('findRoutesAsync handles fetchRoutes throwing and clears loading', async () => {
    jest.doMock('@/utils/persistence/persistence', () => ({
      loadPersistedState: jest.fn().mockResolvedValue(null),
      savePersistedState: jest.fn(),
    }));

    // Make fetchRoutes throw to exercise the catch branch
    jest.doMock('@/services/routeService', () => ({
      fetchRoutes: jest.fn(async () => {
        throw new Error('network error');
      }),
    }));

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const nav = jest.requireActual('@/stores/navigationStore');
    const useNavigationStore = nav.useNavigationStore;

    // Set valid origin/destination so the function attempts to fetch
    const placeA = { id: 'a', name: 'A', latitude: 0, longitude: 0 } as any;
    const placeB = { id: 'b', name: 'B', latitude: 0, longitude: 0 } as any;

    act(() => {
      useNavigationStore.getState().setOrigin(placeA);
      useNavigationStore.getState().setDestination(placeB);
    });

    await act(async () => {
      await useNavigationStore.getState().findRoutesAsync();
    });

    expect(useNavigationStore.getState().selectedRoute).toBeNull();
    expect(useNavigationStore.getState().routesLoading).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('addLocationVerifiedPhotoCheckIn appends a verified check-in and returns verification', () => {
    jest.doMock('@/utils/persistence/persistence', () => ({
      loadPersistedState: jest.fn().mockResolvedValue(null),
      savePersistedState: jest.fn(),
    }));

    const nav = jest.requireActual('@/stores/navigationStore');
    const useNavigationStore = nav.useNavigationStore;

    const beforeCount = useNavigationStore.getState().photoCheckIns.length;

    // Use identical coordinates so verifyLocationProximity reports within radius
    const currentLocation = { latitude: 10.0, longitude: 10.0 };
    const placeLocation = { latitude: 10.0, longitude: 10.0 };

    const result = useNavigationStore.getState().addLocationVerifiedPhotoCheckIn(
      { photoUri: 'u', placeId: 'p' } as any,
      currentLocation,
      placeLocation
    );

    expect(result).toBeDefined();
    expect(result.isWithinRadius).toBe(true);
    const after = useNavigationStore.getState().photoCheckIns;
    expect(after.length).toBe(beforeCount + 1);
    const last = after[after.length - 1];
    expect(last.isLocationVerified).toBe(true);
  });

  it('addPhotoCheckIn warns and does not add when schema is invalid', () => {
    jest.doMock('@/utils/persistence/persistence', () => ({
      loadPersistedState: jest.fn().mockResolvedValue(null),
      savePersistedState: jest.fn(),
    }));

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const nav = jest.requireActual('@/stores/navigationStore');
    const useNavigationStore = nav.useNavigationStore;

    const beforeCount = useNavigationStore.getState().photoCheckIns.length;

    // Pass an invalid object to trigger schema validation failure
    useNavigationStore.getState().addPhotoCheckIn({} as any);

    const afterCount = useNavigationStore.getState().photoCheckIns.length;
    expect(afterCount).toBe(beforeCount);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
