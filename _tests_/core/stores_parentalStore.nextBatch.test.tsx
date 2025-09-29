// Mock AsyncStorage before importing the store to avoid IO
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

import { render, act } from '@testing-library/react-native';
import React from 'react';

// Use the real store module to avoid the simplified global mock.
const { ParentalProvider, useParentalStore } = jest.requireActual('@/stores/parentalStore');

describe('parentalStore - small focused behaviors', () => {
  function harnessWithProvider<T>(hook: () => T) {
    const ref: { current?: T } = {} as any;
    const Comp = () => {
      ref.current = hook();
      return null;
    };
    const Wrapper = ({ children }: any) => <ParentalProvider>{children}</ParentalProvider>;
    render(
      <Wrapper>
        <Comp />
      </Wrapper>
    );
    return ref as { current: T };
  }

  test('toggles childLock setting and persists', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    // initial expected default exists on settings
    expect(typeof ref.current!.settings.requirePinForParentMode).toBe('boolean');

    // disable pin requirement and persist
    await act(async () => {
      await ref.current!.saveSettings({ ...ref.current!.settings, requirePinForParentMode: false });
    });

    // authenticate should succeed without a pin now
    let ok = false;
    await act(async () => {
      ok = await ref.current!.authenticateParentMode('whatever');
    });

    expect(ok).toBe(true);
    expect(ref.current!.isParentMode).toBe(true);
  });

  test('can add an emergency contact', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    let contact: any;
    await act(async () => {
      contact = await ref.current!.addEmergencyContact({ name: 'Alice', phone: '555-1234', relationship: 'Relative' });
    });

    expect(contact).toHaveProperty('id');
  expect(ref.current!.settings.emergencyContacts.some((c: any) => c.id === contact.id)).toBe(true);
  });
});
