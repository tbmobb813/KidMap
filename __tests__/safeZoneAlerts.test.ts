// __tests__/safeZoneAlerts.test.ts - Tests for Safe Zone Alert System
import { safeZoneAlertManager, SafeZoneEvent } from '@/utils/safeZoneAlerts';
import { SafeZone } from '@/components/SafeZoneManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock speechEngine
jest.mock('@/utils/speechEngine', () => ({
  speechEngine: {
    speak: jest.fn(),
  },
}));

// Mock gamification store
jest.mock('@/stores/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      addExperience: jest.fn(),
      completeQuest: jest.fn(),
    }),
  },
}));

describe('SafeZoneAlertManager', () => {
  const mockZone: SafeZone = {
    id: 'zone-1',
    name: 'Home',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 100,
  };

  const mockLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('handleSafeZoneEvent', () => {
    it('should create and store a safe zone event', async () => {
      await safeZoneAlertManager.handleSafeZoneEvent(
        'zone-1',
        'enter',
        mockZone,
        mockLocation
      );

      const history = safeZoneAlertManager.getEventHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        zoneId: 'zone-1',
        zoneName: 'Home',
        eventType: 'enter',
        location: mockLocation,
      });
    });

    it('should trigger voice alert for enter event', async () => {
      const { speechEngine } = require('@/utils/speechEngine');
      
      await safeZoneAlertManager.handleSafeZoneEvent(
        'zone-1',
        'enter',
        mockZone,
        mockLocation
      );

      expect(speechEngine.speak).toHaveBeenCalledWith(
        expect.stringContaining('entered')
      );
    });

    it('should trigger voice alert for exit event', async () => {
      const { speechEngine } = require('@/utils/speechEngine');
      
      await safeZoneAlertManager.handleSafeZoneEvent(
        'zone-1',
        'exit',
        mockZone,
        mockLocation
      );

      expect(speechEngine.speak).toHaveBeenCalledWith(
        expect.stringContaining('left')
      );
    });

    it('should respect cooldown period', async () => {
      const { speechEngine } = require('@/utils/speechEngine');
      
      // First event should trigger alert
      await safeZoneAlertManager.handleSafeZoneEvent(
        'zone-1',
        'enter',
        mockZone,
        mockLocation
      );
      
      // Second event within cooldown should not trigger alert
      await safeZoneAlertManager.handleSafeZoneEvent(
        'zone-1',
        'enter',
        mockZone,
        mockLocation
      );

      // Should only be called once due to cooldown
      expect(speechEngine.speak).toHaveBeenCalledTimes(1);
    });

    it('should update gamification system', async () => {
      const gamificationStore = require('@/stores/gamificationStore').useGamificationStore.getState();
      
      await safeZoneAlertManager.handleSafeZoneEvent(
        'zone-1',
        'enter',
        mockZone,
        mockLocation
      );

      expect(gamificationStore.addExperience).toHaveBeenCalledWith(10, 'Entered safe zone');
    });
  });

  describe('updateSettings', () => {
    it('should update alert settings', async () => {
      const newSettings = {
        enableVoiceAlerts: false,
        alertCooldownMinutes: 10,
      };

      await safeZoneAlertManager.updateSettings(newSettings);
      const settings = safeZoneAlertManager.getSettings();

      expect(settings.enableVoiceAlerts).toBe(false);
      expect(settings.alertCooldownMinutes).toBe(10);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'safe-zone-alert-settings',
        expect.any(String)
      );
    });
  });

  describe('getStatistics', () => {
    it('should calculate correct statistics', async () => {
      // Add some test events
      await safeZoneAlertManager.handleSafeZoneEvent('zone-1', 'enter', mockZone, mockLocation);
      await safeZoneAlertManager.handleSafeZoneEvent('zone-1', 'exit', mockZone, mockLocation);
      
      const stats = safeZoneAlertManager.getStatistics();
      
      expect(stats.todayEnters).toBe(1);
      expect(stats.todayExits).toBe(1);
      expect(stats.mostVisitedZone).toBe('Home');
      expect(stats.safetyScore).toBeGreaterThan(0);
    });
  });

  describe('quiet hours', () => {
    it('should not send alerts during quiet hours', async () => {
      const { speechEngine } = require('@/utils/speechEngine');
      
      // Enable quiet hours
      await safeZoneAlertManager.updateSettings({
        quietHours: {
          start: '00:00',
          end: '23:59',
          enabled: true,
        },
      });

      await safeZoneAlertManager.handleSafeZoneEvent(
        'zone-1',
        'enter',
        mockZone,
        mockLocation
      );

      expect(speechEngine.speak).not.toHaveBeenCalled();
    });
  });

  describe('event history management', () => {
    it('should limit event history to 100 items', async () => {
      // Add 101 events
      for (let i = 0; i < 101; i++) {
        await safeZoneAlertManager.handleSafeZoneEvent(
          `zone-${i}`,
          'enter',
          { ...mockZone, id: `zone-${i}`, name: `Zone ${i}` },
          mockLocation
        );
      }

      const history = safeZoneAlertManager.getEventHistory();
      expect(history).toHaveLength(100);
    });

    it('should clear event history', async () => {
      await safeZoneAlertManager.handleSafeZoneEvent('zone-1', 'enter', mockZone, mockLocation);
      expect(safeZoneAlertManager.getEventHistory()).toHaveLength(1);

      await safeZoneAlertManager.clearEventHistory();
      expect(safeZoneAlertManager.getEventHistory()).toHaveLength(0);
    });

    it('should filter recent events correctly', async () => {
      await safeZoneAlertManager.handleSafeZoneEvent('zone-1', 'enter', mockZone, mockLocation);
      
      const recentEvents = safeZoneAlertManager.getRecentEvents(1);
      expect(recentEvents).toHaveLength(1);
      
      const veryRecentEvents = safeZoneAlertManager.getRecentEvents(0.001); // 3.6 seconds
      expect(veryRecentEvents).toHaveLength(0);
    });
  });
});
