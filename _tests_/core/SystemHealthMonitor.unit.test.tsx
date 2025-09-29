import { waitFor } from '@testing-library/react-native';
import React from 'react';

import { render } from '../testUtils';

// Provide module-level mocks used by the component. Tests will override
// specific hook return values using jest.spyOn when needed.
jest.mock('@/hooks/useNetworkStatus', () => ({ useNetworkStatus: jest.fn(() => ({ isConnected: true })) }));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(async () => {}),
    removeItem: jest.fn(async () => {}),
  },
}));

jest.mock('expo-location', () => ({
  __esModule: true,
  getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
}));



describe('SystemHealthMonitor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    if ((global as any).localStorage) delete (global as any).localStorage;
  });

  it('shows action section and error summary when network is disconnected', async () => {
    const networkModule = require('@/hooks/useNetworkStatus');
    if (typeof networkModule.useNetworkStatus !== 'function') throw new Error('useNetworkStatus is not a function');
    jest.spyOn(networkModule, 'useNetworkStatus').mockReturnValue({ isConnected: false } as any);

    // Require after spy so the hook is mocked for initial render
    const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;
    const { getByText } = render(React.createElement(SystemHealthMonitor, { testId: 'shm' }));

    await waitFor(() => expect(getByText(/Recommended Actions/)).toBeTruthy());
    expect(getByText(/1 error/)).toBeTruthy();
    expect(getByText(/System/)).toBeTruthy();
  });

  it('shows platform warning when running on web', async () => {
    const RN = require('react-native');
    const originalOS = RN.Platform.OS;
    RN.Platform.OS = 'web';

    (global as any).localStorage = {
      setItem: jest.fn(),
      removeItem: jest.fn(),
      getItem: jest.fn(() => null),
      length: 0,
      key: jest.fn(() => null),
      clear: jest.fn(),
    } as any;

    // Ensure the hook exists
    const networkModule = require('@/hooks/useNetworkStatus');
    if (typeof networkModule.useNetworkStatus !== 'function') throw new Error('useNetworkStatus missing');

    const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;
    const { getByText } = render(React.createElement(SystemHealthMonitor));

    await waitFor(() => expect(getByText(/warning/i)).toBeTruthy());

    RN.Platform.OS = originalOS;
    delete (global as any).localStorage;
  });
});
