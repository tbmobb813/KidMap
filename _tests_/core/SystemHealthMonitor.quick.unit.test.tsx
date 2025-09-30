describe('SystemHealthMonitor (quick)', () => {
  beforeEach(() => jest.resetModules());

  test('shows healthy when network connected and location permission granted', async () => {
    jest.doMock('@/hooks/useNetworkStatus', () => ({
      useNetworkStatus: () => ({ isConnected: true }),
    }));

    jest.doMock('@/constants/theme', () => ({
      useTheme: () => ({
        colors: {
          success: '#0f0',
          warning: '#ff0',
          error: '#f00',
          text: '#000',
          textSecondary: '#666',
          primary: '#00f',
          surface: '#fff',
          surfaceAlt: '#fafafa',
        },
      }),
    }));

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      },
    }));

    jest.doMock('expo-location', () => ({
      getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    }));

    const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;
    const React = require('react');
    const { render, waitFor } = require('@testing-library/react-native');

    const { getByText } = render(React.createElement(SystemHealthMonitor, { testId: 'shm' }));

    await waitFor(() => expect(getByText(/System Healthy/)).toBeTruthy(), { timeout: 2000 });
  });

  test('shows errors when network disconnected', async () => {
    jest.doMock('@/hooks/useNetworkStatus', () => ({
      useNetworkStatus: () => ({ isConnected: false }),
    }));

    jest.doMock('@/constants/theme', () => ({
      useTheme: () => ({
        colors: {
          success: '#0f0',
          warning: '#ff0',
          error: '#f00',
          text: '#000',
          textSecondary: '#666',
          primary: '#00f',
          surface: '#fff',
          surfaceAlt: '#fafafa',
        },
      }),
    }));

    // simulate AsyncStorage failure to ensure storage check reports error
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        setItem: jest.fn().mockImplementation(() => { throw new Error('fail'); }),
        removeItem: jest.fn().mockResolvedValue(undefined),
      },
    }));

    jest.doMock('expo-location', () => ({
      getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'denied' }),
    }));

    const SystemHealthMonitor = require('@/components/SystemHealthMonitor').default;
    const React = require('react');
    const { render, waitFor } = require('@testing-library/react-native');

    const { getByText } = render(React.createElement(SystemHealthMonitor));

    await waitFor(() => expect(getByText(/Errors Found|error/i)).toBeTruthy(), { timeout: 2000 });
  });
});
