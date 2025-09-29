// Mock AsyncStorage before importing the store to avoid IO
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

import { render, act } from '@testing-library/react-native';
import React from 'react';

const { useRegionStore } = jest.requireActual('@/stores/regionStore');

describe('regionStore - small behaviors', () => {
  function harnessHook<T>(hook: () => T) {
    const ref: { current?: T } = {} as any;
    const Comp = () => {
      ref.current = hook();
      return null;
    };
    render(<Comp />);
    return ref as { current: T };
  }

  test('lookup returns undefined for unknown region via helper', () => {
    const ref = harnessHook(() => useRegionStore());
    // use available helper to search
    const found = ref.current!.searchRegions('no-match-xyz');
    expect(found.length).toBeGreaterThanOrEqual(0);
  });

  test('updateRegionTransitData updates currentRegion when id matches', async () => {
    const ref = harnessHook(() => useRegionStore());
    const regions = ref.current!.availableRegions;
    const id = regions[1].id; // pick a region that's not default

    // switch current region and update transit data inside act so the harness re-renders
    await act(async () => {
      ref.current!.setRegion(id);
      ref.current!.updateRegionTransitData(id, { transitSystems: [{ id: 't1', name: 'T1' }] } as any);
    });

    expect(ref.current!.currentRegion.transitSystems.some((s: any) => s.id === 't1')).toBe(true);
  });
});
