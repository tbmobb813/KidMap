import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { render } from '../testUtils';

// Baseline module mocks
jest.mock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: jest.fn(() => ({ isConnected: true })) }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { setItem: jest.fn(async () => {}), removeItem: jest.fn(async () => {}) },
}));
jest.mock('expo-location', () => ({ __esModule: true, getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })) }));

describe('SystemHealthMonitor (clean file)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    if ((global as any).localStorage) delete (global as any).localStorage;
  });

  it('shows actions and error summary when offline', async () => {
    const networkModule = require('@/hooks/useNetworkStatus');
    jest.spyOn(networkModule, 'useNetworkStatus').mockReturnValue({ isConnected: false } as any);

    const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;
    const { getByText } = render(React.createElement(SystemHealthMonitor, { testId: 'shm' }));

    await waitFor(() => expect(getByText(/Recommended Actions/)).toBeTruthy());
    expect(getByText(/1 error/)).toBeTruthy();
  });

  it('shows platform warning when running on web', async () => {
    const RN = require('react-native');
    const originalOS = RN.Platform.OS;
    RN.Platform.OS = 'web';

    (global as any).localStorage = { setItem: jest.fn(), removeItem: jest.fn(), getItem: jest.fn(() => null) } as any;

    const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;
    const { getByText } = render(React.createElement(SystemHealthMonitor));

    await waitFor(() => expect(getByText(/warning/i)).toBeTruthy());

    RN.Platform.OS = originalOS;
    delete (global as any).localStorage;
  });
});
