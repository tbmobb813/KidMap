// devicePing.test.tsx

// Mock global objects before any imports
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    geolocation: {
      getCurrentPosition: jest.fn((success) =>
        success({
          coords: { latitude: 37.7749, longitude: -122.4194 },
        }),
      ),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    },
  },
});

Object.defineProperty(global, 'Notification', {
  writable: true,
  value: jest.fn(),
});

import { pingDevice, sendLocationUpdate } from '@/utils/pingDevice';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  getNotificationAsync: jest.fn(() =>
    Promise.resolve({
      title: 'Ping Alert',
      body: 'Your device is being pinged!',
    }),
  ),
}));

// Mock useLocation hook
jest.mock('@/hooks/useLocation', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    location: { latitude: 37.7749, longitude: -122.4194 },
  })),
}));

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('Device Ping/Locate', () => {
  it('should make the device ring with a ping alert', async () => {
    const scheduleNotificationSpy = jest.spyOn(
      require('expo-notifications'),
      'scheduleNotificationAsync',
    );

    await pingDevice();

    expect(scheduleNotificationSpy).toHaveBeenCalledWith({
      content: {
        title: 'Device Ping',
        body: 'This is a ping from the parent.',
        sound: 'default',
      },
      trigger: null,
    });
  });

  it('should send location updates with correct coordinates', async () => {
    const mockUseLocation = require('@/hooks/useLocation').default;
    const mockCoords = { latitude: 37.7749, longitude: -122.4194 };

    mockUseLocation.mockReturnValue({
      location: mockCoords,
    });

    // Spy on console.log to verify location is logged
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await sendLocationUpdate();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Sending location: ${mockCoords.latitude}, ${mockCoords.longitude}`,
    );

    consoleLogSpy.mockRestore();
  });

  it('should handle geolocation errors gracefully', async () => {
    const mockUseLocation = require('@/hooks/useLocation').default;

    // Mock useLocation to return null (no location available)
    mockUseLocation.mockReturnValue({
      location: null,
    });

    // Spy on console.error to verify error handling
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await sendLocationUpdate();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Location not available');

    consoleErrorSpy.mockRestore();
  });
});
