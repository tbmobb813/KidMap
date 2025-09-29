import { waitFor } from '@testing-library/react-native';
import React from 'react';

// Note: do not mock the theme provider module here. Tests rely on the
// real `ThemeProvider` export imported by `_tests_/testUtils.tsx` and
// mocking the theme module by a different module id can cause the
// provider to become undefined in the test wrapper.

// Do NOT mock the theme module here. Tests use the real ThemeProvider from
// `_tests_/testUtils.tsx` and mocking it (even with requireActual) can lead
// to the provider becoming undefined when the wrapper renders.

// Make the network hook export a jest.fn so tests can spy or override it
// at runtime reliably without breaking other named exports from the
// module. We still spread the real module so any other exports remain.
jest.mock('@/hooks/useNetworkStatus', () => {
  const real = jest.requireActual('@/hooks/useNetworkStatus');
  return {
    __esModule: true,
    ...real,
    useNetworkStatus: jest.fn(() => ({ isConnected: true, isInternetReachable: true, connectionType: 'unknown' })),
  };
});

// Note: tests will require('@/hooks/useNetworkStatus') and spy on the
// exported hook before rendering the component to simulate different
// network states. Keeping the mock factory at module-level above ensures
// the module shape is preserved.

// Ensure AsyncStorage and expo-location are available during tests unless overridden
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

import { render } from '../testUtils';

// Do not require the component at module scope. Each test will require the
// component after any per-test spies or globals are set so the component
// picks up the mocked hook implementations correctly.

describe('SystemHealthMonitor', () => {
  afterEach(() => {
    // Avoid resetAllMocks(): it clears implementations created by module-level
    // jest.fn mocks (used by this file). Use restore/clear to clean spies and
    // call history while preserving module mock factories.
    jest.restoreAllMocks();
    jest.clearAllMocks();
    // reset any changed globals
    if (global.localStorage) delete (global as any).localStorage;
  });

  it('shows action section and error summary when network is disconnected', async () => {
    // Spy on the network hook to simulate offline state for this test
    const networkModule = require('@/hooks/useNetworkStatus');
    // Sanity check the exported shape
    // eslint-disable-next-line no-console
    console.log('networkModule keys:', Object.keys(networkModule));
    // ensure it's a function we can spy on
    if (typeof networkModule.useNetworkStatus !== 'function') {
      // eslint-disable-next-line no-console
      console.error('useNetworkStatus is not a function', networkModule.useNetworkStatus);
    }
  const spy = jest.spyOn(networkModule, 'useNetworkStatus').mockReturnValue({ isConnected: false });
  // ensure spy variable is referenced so linters don't complain
  expect(typeof spy).toBe('function');

  // Require component after spying so the hook mock is in place for initial render
  const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;

    const { getByText } = render(React.createElement(SystemHealthMonitor, { testId: 'shm' }));

    // Wait for health checks to run and for the action section to appear
    await waitFor(() => expect(getByText(/Recommended Actions/)).toBeTruthy());
    expect(getByText(/1 error/)).toBeTruthy();

    // Sanity: component rendered and shows system header
    expect(getByText(/System/)).toBeTruthy();

  // rely on afterEach() to restore spies
  });

  it('shows platform warning when running on web', async () => {
    // Temporarily set Platform.OS to 'web' for this test
    const RN = require('react-native');
    const originalOS = RN.Platform.OS;
  RN.Platform.OS = 'web';

    // Provide a simple global localStorage for the web path
    // add a simple localStorage for web path in tests
    global.localStorage = {
      setItem: jest.fn(),
      removeItem: jest.fn(),
      getItem: jest.fn(() => null),
      length: 0,
      key: jest.fn(() => null),
      clear: jest.fn(),
    } as any;

  // Diagnostic: ensure network hook is available before requiring component
  const networkModule = require('@/hooks/useNetworkStatus');
  // eslint-disable-next-line no-console
  console.log('web test - useNetworkStatus type:', typeof networkModule.useNetworkStatus);
  if (typeof networkModule.useNetworkStatus !== 'function') {
    throw new Error('useNetworkStatus is not a function in web test');
  }
  // Call it to see what it returns
  const ret = networkModule.useNetworkStatus();
  // eslint-disable-next-line no-console
  console.log('web test - useNetworkStatus returned:', ret);

  // Require component after adjusting Platform and globals
  const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;

  const { getByText } = render(React.createElement(SystemHealthMonitor));

    // Platform check should produce a warning summary
    await waitFor(() => expect(getByText(/warning/)).toBeTruthy());

    // restore
    RN.Platform.OS = originalOS;
  });
});
