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

describe('navigationStore - focused behaviors', () => {
  function harnessHook<T>(hook: () => T) {
    const ref: { current?: T } = {} as any;
    const Comp = () => {
      ref.current = hook();
      return null;
    };
    render(<Comp />);
    return ref as { current: T };
  }

  test('pushes and pops route entries using favorites/recent APIs', () => {
    const ref = harnessHook(() => useNavigationStore());

    const place = { id: 'p-test', name: 'Home' } as any;
    act(() => {
      ref.current!.addToFavorites(place);
    });

  expect(ref.current!.favorites.some((p: any) => p.id === 'p-test')).toBe(true);

    act(() => {
      ref.current!.removeFromFavorites('p-test');
    });

  expect(ref.current!.favorites.some((p: any) => p.id === 'p-test')).toBe(false);
  });
});
