import React from 'react';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn().mockResolvedValue(null), setItem: jest.fn().mockResolvedValue(undefined) },
}));

describe('parentalStore small extras', () => {
  it('adds emergency contact and pings', async () => {
    let storeRef: any = null;
    // isolate modules so mocks are applied before the store is required
    jest.isolateModules(() => {
      const React = require('react');
      const renderer = require('react-test-renderer');
      const { ParentalProvider, useParentalStore } = require('@/stores/parentalStore');

      const Consumer: React.FC<{ onReady: (s: any) => void }> = ({ onReady }) => {
        const store = useParentalStore();
        React.useEffect(() => { if (onReady) onReady(store); }, [store, onReady]);
        return null;
      };

      renderer.create(React.createElement(ParentalProvider, null, React.createElement(Consumer, { onReady: (s: any) => (storeRef = s) })));
    });

  // small wait for the effect to run
  await new Promise((r) => setTimeout(r, 50));

  // guard: storeRef should be set by the Consumer
  expect(storeRef).toBeTruthy();

  // call addEmergencyContact
  const contact = await storeRef.addEmergencyContact({ name: 'A', phone: '123', relationship: 'Friend', isPrimary: false, canReceiveAlerts: false });
    expect(contact).toHaveProperty('id');

    const ping = await storeRef.sendDevicePing('location');
    expect(ping).toHaveProperty('id');
    await storeRef.acknowledgePing(ping.id, { latitude: 1, longitude: 1 });
  });
});
