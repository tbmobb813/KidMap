// Mock persistence functions before importing the store
jest.mock('@/utils/persistence/persistence', () => ({
  loadPersistedState: jest.fn(() => Promise.resolve(null)),
  savePersistedState: jest.fn(() => Promise.resolve()),
}));

import { render, act } from '@testing-library/react-native';
import React from 'react';

// Require the actual store implementation at runtime so the global jest.setup mock
// (which provides simplified store mocks for other suites) does not override it.
const { useNavigationStore } = jest.requireActual('@/stores/navigationStore');

describe('navigationStore unit tests', () => {
  function harnessHook<T>(hook: () => T) {
    const ref: { current?: T } = {} as any;
    const Comp = () => {
       
      ref.current = hook();
      return null;
    };
    render(<Comp />);
    return ref as { current: T };
  }

  test('addToFavorites adds a place once and sets isFavorite', () => {
    const ref = harnessHook(() => useNavigationStore());
    const place = { id: 'p1', name: 'Place 1' } as any;

    act(() => {
      ref.current!.addToFavorites(place);
    });

    expect(ref.current!.favorites.some((p) => p.id === 'p1')).toBe(true);

    // add duplicate should not increase length
    const before = ref.current!.favorites.length;
    act(() => {
      ref.current!.addToFavorites(place);
    });
    expect(ref.current!.favorites.length).toBe(before);
  });

  test('addToRecentSearches limits to 5 and orders newest first', () => {
    const ref = harnessHook(() => useNavigationStore());

    act(() => {
      for (let i = 0; i < 7; i++) {
        ref.current!.addToRecentSearches({ id: `s${i}`, name: `S${i}` } as any);
      }
    });

    expect(ref.current!.recentSearches.length).toBe(5);
    expect(ref.current!.recentSearches[0].id).toBe('s6');
  });

  test('addLocationVerifiedPhotoCheckIn returns verification and stores the check-in', () => {
    const ref = harnessHook(() => useNavigationStore());

    const checkIn = { photoUrl: 'u', caption: 'c' } as any;
    const currentLocation = { latitude: 37.0, longitude: -122.0 };
    const placeLocation = { latitude: 37.0, longitude: -122.0 };

    let verification: any;
    act(() => {
      verification = ref.current!.addLocationVerifiedPhotoCheckIn(checkIn, currentLocation, placeLocation);
    });

    expect(typeof verification.distance).toBe('number');
    expect(ref.current!.photoCheckIns.length).toBeGreaterThan(0);
  });
});

