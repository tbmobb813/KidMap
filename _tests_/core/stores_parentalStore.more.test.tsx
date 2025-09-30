// Mock AsyncStorage before importing the store to avoid IO
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

import { render, act } from '@testing-library/react-native';
import React from 'react';
// Use the real store module
const { ParentalProvider, useParentalStore } = jest.requireActual('@/stores/parentalStore');

describe('parentalStore additional unit tests (high-ROI)', () => {
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

  test('addEmergencyContact appends a contact and persists settings', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    // initial contacts length
    const initial = ref.current!.settings.emergencyContacts.length;

    let added: any = null;
    await act(async () => {
      added = await ref.current!.addEmergencyContact({ name: 'Alice', phone: '555-1234', relationship: 'Friend', canReceiveAlerts: true });
    });

    expect(added).not.toBeNull();
    expect(added).toHaveProperty('id');
    expect(ref.current!.settings.emergencyContacts.length).toBeGreaterThan(initial);

    // Verify AsyncStorage.setItem was called for settings
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  test('sendDevicePing and acknowledgePing update devicePings', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    let ping: any = null;
    await act(async () => {
      ping = await ref.current!.sendDevicePing('locate', 'Please ping');
    });

    expect(ping).toHaveProperty('id');
    expect(ref.current!.devicePings.find((p: any) => p.id === ping.id)).toBeDefined();

    // Acknowledge
    await act(async () => {
      await ref.current!.acknowledgePing(ping.id, { latitude: 1, longitude: 2 });
    });

    const ack = ref.current!.devicePings.find((p: any) => p.id === ping.id);
    expect(ack).toBeDefined();
    expect(ack.status).toBe('acknowledged');
    expect(ack.response).toBeDefined();
  });

  test('updateLastKnownLocation updates dashboardData and persists', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    const loc = { latitude: 9.9, longitude: 8.8, placeName: 'Somewhere' };
    await act(async () => {
      await ref.current!.updateLastKnownLocation(loc as any);
    });

    expect(ref.current!.dashboardData.lastKnownLocation).toBeDefined();
    expect(ref.current!.dashboardData.lastKnownLocation).toMatchObject({ latitude: 9.9, longitude: 8.8 });

    const AsyncStorage = require('@react-native-async-storage/async-storage');
    // Should have persisted dashboard data
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});
