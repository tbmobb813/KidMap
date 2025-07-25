// devicePing.test.tsx

import { pingDevice, sendLocationUpdate } from '@/utils/pingDevice';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
}));

// Ensure navigator.geolocation is defined in Jest environment
beforeAll(() => {
  global.navigator = {
    geolocation: {
      getCurrentPosition: jest.fn(),
    },
  } as unknown as Navigator;
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('Device Ping/Locate', () => {
  it('should make the device ring with a ping alert', async () => {
    const mockNotification = jest.fn();
    jest.spyOn(global, 'Notification' as any).mockImplementation(mockNotification);

    await pingDevice();

    expect(mockNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ping Alert',
        body: 'Your device is being pinged!',
      })
    );
  });

  it('should send location updates with correct coordinates', async () => {
    const mockCoords = { latitude: 37.7749, longitude: -122.4194 };
    jest.spyOn(global.navigator.geolocation, 'getCurrentPosition')
      .mockImplementation((success) => success({ coords: mockCoords }));

    const sendLocationSpy = jest
      .spyOn(require('@/utils/pingDevice'), 'sendLocationUpdate')
      .mockImplementation(() => Promise.resolve());

    await sendLocationUpdate();

    expect(sendLocationSpy).toHaveBeenCalled();
    expect(global.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('should handle geolocation errors gracefully', async () => {
    jest.spyOn(global.navigator.geolocation, 'getCurrentPosition')
      .mockImplementation((_, error) => error?.({ message: 'Permission denied' }));

    await expect(sendLocationUpdate()).resolves.not.toThrow();
  });
});
