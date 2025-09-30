import { render } from '@testing-library/react-native';
import React from 'react';
import { act } from 'react-test-renderer';

import { fetchRoutes } from '@/services/routeService';
import { verifyLocationProximity } from '@/utils/location/locationUtils';

jest.mock('@/services/routeService');
jest.mock('@/utils/persistence/persistence', () => ({ loadPersistedState: jest.fn(() => Promise.resolve(null)), savePersistedState: jest.fn() }));
jest.mock('@/utils/location/locationUtils');

const mockedFetch = fetchRoutes as jest.MockedFunction<typeof fetchRoutes>;
const mockedVerify = verifyLocationProximity as jest.MockedFunction<typeof verifyLocationProximity>;

// Require the real store implementation after the above mocks
const { useNavigationStore } = jest.requireActual('@/stores/navigationStore');

function harnessHook<T>(hook: () => T) {
  const ref: { current?: T } = {};
  function Comp() {
    // capture hook return inside a component
    ref.current = hook();
    return null;
  }
  render(<Comp />);
  return ref as { current: T };
}

describe('navigationStore (focused)', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedVerify.mockReset();
    // Reset store to initial defaults by re-creating it
    const s = useNavigationStore.getState ? useNavigationStore.getState() : null;
    if (s) {
      // Clear favorites and photoCheckIns to known state
      useNavigationStore.setState({ favorites: [], recentSearches: [], photoCheckIns: [] } as any);
    }
  });

  it('adds and removes favorites', () => {
    const { current } = harnessHook(() => useNavigationStore());
    const place = { id: 'p123', name: 'Place' } as any;
    act(() => current.addToFavorites(place));
    // read fresh snapshot from store to avoid stale ref
    const afterAdd = useNavigationStore.getState();
    expect(afterAdd.favorites.some((f: any) => f.id === 'p123')).toBeTruthy();
    act(() => current.removeFromFavorites('p123'));
    const afterRemove = useNavigationStore.getState();
    expect(afterRemove.favorites.some((f: any) => f.id === 'p123')).toBeFalsy();
  });

  it('adds location-verified photo checkin and returns verification', () => {
    const { current } = harnessHook(() => useNavigationStore());
    mockedVerify.mockReturnValue({ isWithinRadius: true, distance: 5 });
    act(() => current.addLocationVerifiedPhotoCheckIn({ note: 'hi' } as any, { latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }));
    // addLocationVerifiedPhotoCheckIn calls verifyLocationProximity and updates store
    expect(mockedVerify).toHaveBeenCalled();
    const after = useNavigationStore.getState();
    expect(after.photoCheckIns.length).toBeGreaterThanOrEqual(1);
  });
});
