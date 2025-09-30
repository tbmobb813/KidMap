// Mock AsyncStorage before importing the store to avoid IO
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

import { render, act } from '@testing-library/react-native';
import React from 'react';
// Use the real store module here to avoid the simplified global mock.
const { ParentalProvider, useParentalStore } = jest.requireActual('@/stores/parentalStore');

describe('parentalStore unit tests', () => {
  function harnessWithProvider<T>(hook: () => T) {
    const ref: { current?: T } = {} as any;
    const Comp = () => {
       
      ref.current = hook();
      return null;
    };
    const Wrapper = ({ children }: any) => <ParentalProvider>{children}</ParentalProvider>;
    render(<Wrapper><Comp /></Wrapper>);
    return ref as { current: T };
  }

  test('authenticateParentMode allows when no pin required', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    // disable pin requirement
    await act(async () => {
      await ref.current!.saveSettings({ ...ref.current!.settings, requirePinForParentMode: false });
    });

    let ok: boolean = false;
    await act(async () => {
      ok = await ref.current!.authenticateParentMode('whatever');
    });

    expect(ref.current!.isParentMode).toBe(true);
    expect(ok).toBeTruthy();
  });

  test('addSafeZone returns a safe zone with id and createdAt', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    let newZone: any;
    await act(async () => {
      newZone = await ref.current!.addSafeZone({ name: 'Park', latitude: 1, longitude: 2, radius: 100 });
    });

    expect(newZone).toHaveProperty('id');
    expect(newZone).toHaveProperty('createdAt');
    expect(ref.current!.safeZones).toEqual(expect.arrayContaining([expect.objectContaining({ id: newZone.id })]));
  });

  test('requestCheckIn adds a pending check-in with message', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    let req: any;
    await act(async () => {
      req = await ref.current!.requestCheckIn('Please come', true);
    });

    expect(req).toHaveProperty('id');
    expect(req.status).toBe('pending');
    expect(ref.current!.checkInRequests).toEqual(expect.arrayContaining([expect.objectContaining({ id: req.id })]));
  });
});
