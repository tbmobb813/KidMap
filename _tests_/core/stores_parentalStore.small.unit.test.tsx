import { render, act } from '@testing-library/react-native';

import React from 'react';
const { ParentalProvider, useParentalStore } = jest.requireActual('@/stores/parentalStore');

describe('parentalStore small behaviors', () => {
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

  it('adds an emergency contact and persists settings', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    // addEmergencyContact returns a new contact
    let newContact: any;
    await act(async () => {
      newContact = await ref.current!.addEmergencyContact({ name: 'Test', phone: '123', relationship: 'Friend', isPrimary: false, canReceiveAlerts: true } as any);
    });

    expect(newContact).toHaveProperty('id');
    expect(ref.current!.settings.emergencyContacts.some((c: any) => c.id === newContact.id)).toBe(true);
  });

  it('sends and acknowledges a device ping', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    let ping: any;
    await act(async () => {
      ping = await ref.current!.sendDevicePing('locate' as any, 'please');
    });

    expect(ping).toHaveProperty('id');
    expect(ref.current!.devicePings.some((p: any) => p.id === ping.id)).toBe(true);

    await act(async () => {
      await ref.current!.acknowledgePing(ping.id, { latitude: 1, longitude: 2 });
    });

  const found = ref.current!.devicePings.find((p: any) => p.id === ping.id)!;
  expect(found.status).toBe('acknowledged');
  });

  it('updates last known location on dashboard', async () => {
    const ref = harnessWithProvider(() => useParentalStore());

    await act(async () => {
      await ref.current!.updateLastKnownLocation({ latitude: 9, longitude: 9, placeName: 'Here' } as any);
    });

    expect(ref.current!.dashboardData.lastKnownLocation).toBeDefined();
    expect(ref.current!.dashboardData.lastKnownLocation?.placeName).toBe('Here');
  });
});
