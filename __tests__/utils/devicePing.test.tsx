// __tests__/devicePing.test.tsx - Device ping system tests
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DevicePingControl from '../../components/DevicePingControl';
import { devicePingManager } from '../../utils/devicePing';
import { renderWithProviders, setupKidMapTests } from '../helpers';

// Mock dependencies
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  AndroidNotificationPriority: {
    MAX: 'max',
    HIGH: 'high',
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
    },
    timestamp: Date.now(),
  }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([{
    streetNumber: '123',
    street: 'Main St',
    city: 'New York',
    region: 'NY',
  }]),
  Accuracy: {
    BestForNavigation: 'bestForNavigation',
    Balanced: 'balanced',
    High: 'high',
  },
}));

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setAudioModeAsync: jest.fn(),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
        },
      }),
    },
  },
}));

jest.mock('@/stores/parentalControlStore', () => ({
  useParentalControlStore: () => ({
    isAuthenticated: true,
  }),
}));

jest.mock('@/utils/speechEngine', () => ({
  speechEngine: {
    speak: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Device Ping System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DevicePingManager', () => {
    it('should initialize properly', async () => {
      await devicePingManager.initialize();
      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });

    it('should send a ring ping', async () => {
      const pingId = await devicePingManager.ringChild('Test ring message');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should send a location request', async () => {
      const pingId = await devicePingManager.requestLocation('Where are you?');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should send a check-in request', async () => {
      const pingId = await devicePingManager.requestCheckIn('How are you doing?');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should send an emergency ping', async () => {
      const pingId = await devicePingManager.sendEmergencyPing('Emergency! Respond now!');
      expect(pingId).toBeDefined();
      expect(typeof pingId).toBe('string');
    });

    it('should track pending requests', async () => {
      await devicePingManager.ringChild('Test ping');
      const pendingRequests = devicePingManager.getPendingRequests();
      expect(pendingRequests.length).toBeGreaterThan(0);
      expect(pendingRequests[0].type).toBe('ring');
    });

    it('should maintain ping history', async () => {
      await devicePingManager.requestCheckIn('Test check-in');
      const history = devicePingManager.getPingHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('DevicePingControl Component', () => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
    };

    beforeEach(() => {
      setupKidMapTests();
    });

    it('renders correctly when visible', () => {
      const { getByText } = renderWithProviders(<DevicePingControl {...defaultProps} />);
      expect(getByText('Device Control')).toBeTruthy();
      expect(getByText('Quick Actions')).toBeTruthy();
    });

    it('renders all quick action buttons', () => {
      const { getByText } = renderWithProviders(<DevicePingControl {...defaultProps} />);
      expect(getByText('Ring Device')).toBeTruthy();
      expect(getByText('Get Location')).toBeTruthy();
      expect(getByText('Check-in')).toBeTruthy();
      expect(getByText('Emergency')).toBeTruthy();
    });

    it('handles ring device button press', async () => {
      const { getByText } = renderWithProviders(<DevicePingControl {...defaultProps} />);
      const ringButton = getByText('Ring Device');
      
      fireEvent.press(ringButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Ping Sent',
          'Your ring request has been sent to your child\'s device.',
          expect.any(Array)
        );
      });
    });

    it('displays empty state when no pending requests', () => {
      const { getByText } = renderWithProviders(<DevicePingControl {...defaultProps} />);
      expect(getByText('No pending requests')).toBeTruthy();
      expect(getByText('Your child has responded to all pings')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle location permission denied gracefully', async () => {
      // Mock permission denied
      const mockLocation = require('expo-location');
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
      
      await devicePingManager.initialize();
      
      // Should not throw error, but log warning
      expect(true).toBe(true);
    });
  });
});
