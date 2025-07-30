// __tests__/utils/safeZoneAlerts.test.ts - Comprehensive SafeZoneAlertManager tests
import { safeZoneAlertManager } from '@/utils/safeZoneAlerts';
import { SafeZone } from '@/components/SafeZoneManager';
import { 
  setupMockAsyncStorage, 
  mockAsyncStorageInstance,
} from '../helpers/mockAsyncStorage';
import { createMockSafeZone } from '../helpers/mockTripData';
import { TEST_CONFIG } from '../config/testSetup';

// Centralized mocks
jest.mock('@react-native-async-storage/async-storage', () => 
  require('../helpers/mockAsyncStorage').createAsyncStorageMock()
);

jest.mock('@/utils/speechEngine', () => ({
  speechEngine: {
    speak: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/stores/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      addPoints: jest.fn(),
      updateStats: jest.fn(),
      userStats: { safeTrips: 0 },
    }),
  },
}));

// Test data factory
const createTestSafeZone = (id: string, overrides: Partial<SafeZone> = {}): SafeZone => 
  createMockSafeZone({
    id,
    name: `Test Zone ${id}`,
    center: TEST_CONFIG.DEFAULT_COORDINATES,
    radius: 100,
    isActive: true,
    type: 'custom',
    ...overrides,
  });

const createTestLocation = (lat?: number, lng?: number) => ({
  latitude: lat ?? TEST_CONFIG.DEFAULT_COORDINATES.latitude,
  longitude: lng ?? TEST_CONFIG.DEFAULT_COORDINATES.longitude,
});

describe('SafeZoneAlertManager', () => {
  // Test data
  const mockZone = createTestSafeZone('test-zone-1');
  const mockLocation = createTestLocation();

  beforeEach(() => {
    setupMockAsyncStorage();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with default settings', async () => {
      await expect(safeZoneAlertManager.initialize()).resolves.not.toThrow();
      
      const settings = safeZoneAlertManager.getSettings();
      expect(settings).toBeDefined();
      expect(typeof settings.enableVoiceAlerts).toBe('boolean');
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should load saved settings from AsyncStorage', async () => {
      const savedSettings = {
        enableVoiceAlerts: false,
        alertCooldownMinutes: 10,
      };
      
      mockAsyncStorageInstance.getItem.mockResolvedValueOnce(
        JSON.stringify(savedSettings)
      );

      await safeZoneAlertManager.initialize();
      const settings = safeZoneAlertManager.getSettings();
      
      expect(settings.enableVoiceAlerts).toBe(false);
      expect(settings.alertCooldownMinutes).toBe(10);
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should handle initialization errors gracefully', async () => {
      mockAsyncStorageInstance.getItem.mockRejectedValueOnce(
        new Error('Storage initialization failed')
      );

      await expect(safeZoneAlertManager.initialize()).resolves.not.toThrow();
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should handle malformed AsyncStorage data', async () => {
      mockAsyncStorageInstance.getItem.mockResolvedValueOnce('invalid-json');
      
      await expect(safeZoneAlertManager.initialize()).resolves.not.toThrow();
      
      const settings = safeZoneAlertManager.getSettings();
      expect(settings).toBeDefined();
      expect(typeof settings.enableVoiceAlerts).toBe('boolean');
    }, TEST_CONFIG.ASYNC_TIMEOUT);
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await safeZoneAlertManager.initialize();
    });

    it('should handle valid safe zone events', async () => {
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      
      const history = safeZoneAlertManager.getEventHistory();
      expect(history).toHaveLength(1);
      expect(history[0].zoneId).toBe(mockZone.id);
      expect(history[0].eventType).toBe('enter');
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should validate input parameters', async () => {
      await expect(
        safeZoneAlertManager.handleSafeZoneEvent('', 'enter', mockZone, mockLocation)
      ).rejects.toThrow('Invalid parameters provided to handleSafeZoneEvent');
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should respect cooldown periods', async () => {
      const { speechEngine } = require('@/utils/speechEngine');
      
      // First event should trigger speech
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      
      // Second event should be blocked by cooldown
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      
      expect(speechEngine.speak).toHaveBeenCalledTimes(1);
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should update gamification system', async () => {
      const gamificationStore = require('@/stores/gamificationStore')
        .useGamificationStore.getState();
      
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      
      expect(gamificationStore.addPoints).toHaveBeenCalledWith(10);
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should handle concurrent event processing', async () => {
      const eventPromises = Array.from({ length: 5 }, (_, i) =>
        safeZoneAlertManager.handleSafeZoneEvent(
          `zone-${i}`, 
          'enter', 
          createTestSafeZone(`zone-${i}`), 
          mockLocation
        )
      );
      
      await Promise.all(eventPromises);
      
      const history = safeZoneAlertManager.getEventHistory();
      expect(history).toHaveLength(5);
    }, TEST_CONFIG.ASYNC_TIMEOUT);
  });

  describe('Settings Management', () => {
    beforeEach(async () => {
      await safeZoneAlertManager.initialize();
    });

    it('should update valid settings', async () => {
      const newSettings = { 
        alertCooldownMinutes: 15, 
        enableVoiceAlerts: false 
      };
      
      await safeZoneAlertManager.updateSettings(newSettings);
      
      const settings = safeZoneAlertManager.getSettings();
      expect(settings.alertCooldownMinutes).toBe(15);
      expect(settings.enableVoiceAlerts).toBe(false);
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should reject invalid cooldown values', async () => {
      await expect(
        safeZoneAlertManager.updateSettings({ alertCooldownMinutes: -1 })
      ).rejects.toThrow('Alert cooldown must be between 0 and 60 minutes');
      
      await expect(
        safeZoneAlertManager.updateSettings({ alertCooldownMinutes: 61 })
      ).rejects.toThrow('Alert cooldown must be between 0 and 60 minutes');
    }, TEST_CONFIG.ASYNC_TIMEOUT);
  });

  describe('Event History Management', () => {
    beforeEach(async () => {
      await safeZoneAlertManager.initialize();
    });

    it('should limit event history to maximum items', async () => {
      // Add more than the maximum allowed events
      for (let i = 0; i < 101; i++) {
        await safeZoneAlertManager.handleSafeZoneEvent(
          `zone-${i}`, 
          'enter', 
          createTestSafeZone(`zone-${i}`), 
          mockLocation
        );
      }
      
      const history = safeZoneAlertManager.getEventHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should clear event history', async () => {
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      
      expect(safeZoneAlertManager.getEventHistory()).toHaveLength(1);
      
      await safeZoneAlertManager.clearEventHistory();
      expect(safeZoneAlertManager.getEventHistory()).toHaveLength(0);
    }, TEST_CONFIG.ASYNC_TIMEOUT);
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await safeZoneAlertManager.initialize();
    });

    it('should compute accurate statistics', async () => {
      // Add some test events
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'exit', 
        mockZone, 
        mockLocation
      );
      
      const stats = safeZoneAlertManager.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.todayEvents).toBeGreaterThan(0);
      expect(typeof stats.totalEvents).toBe('number');
    }, TEST_CONFIG.ASYNC_TIMEOUT);
  });

  describe('Quiet Hours', () => {
    beforeEach(async () => {
      await safeZoneAlertManager.initialize();
    });

    it('should not send alerts during quiet hours', async () => {
      const { speechEngine } = require('@/utils/speechEngine');
      
      await safeZoneAlertManager.updateSettings({
        quietHours: { 
          start: '00:00', 
          end: '23:59', 
          enabled: true 
        },
      });
      
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      
      expect(speechEngine.speak).not.toHaveBeenCalled();
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should send alerts outside quiet hours', async () => {
      const { speechEngine } = require('@/utils/speechEngine');
      
      // Set quiet hours that don't include current time
      await safeZoneAlertManager.updateSettings({
        quietHours: { 
          start: '01:00', 
          end: '02:00', 
          enabled: true 
        },
      });
      
      await safeZoneAlertManager.handleSafeZoneEvent(
        mockZone.id, 
        'enter', 
        mockZone, 
        mockLocation
      );
      
      // Should call speech since we're outside quiet hours
      expect(speechEngine.speak).toHaveBeenCalled();
    }, TEST_CONFIG.ASYNC_TIMEOUT);
  });

  describe('Error Recovery', () => {
    beforeEach(async () => {
      await safeZoneAlertManager.initialize();
    });

    it('should retry AsyncStorage operations on failure', async () => {
      // Mock first two calls to fail, third to succeed
      mockAsyncStorageInstance.setItem
        .mockRejectedValueOnce(new Error('Storage error 1'))
        .mockRejectedValueOnce(new Error('Storage error 2'))
        .mockResolvedValueOnce(undefined);
      
      await expect(
        safeZoneAlertManager.handleSafeZoneEvent(
          mockZone.id, 
          'enter', 
          mockZone, 
          mockLocation
        )
      ).resolves.not.toThrow();
      
      expect(mockAsyncStorageInstance.setItem).toHaveBeenCalledTimes(3);
    }, TEST_CONFIG.ASYNC_TIMEOUT);

    it('should handle persistent storage failures gracefully', async () => {
      // Mock all storage calls to fail
      mockAsyncStorageInstance.setItem.mockRejectedValue(
        new Error('Persistent storage failure')
      );
      
      await expect(
        safeZoneAlertManager.handleSafeZoneEvent(
          mockZone.id, 
          'enter', 
          mockZone, 
          mockLocation
        )
      ).resolves.not.toThrow();
    }, TEST_CONFIG.ASYNC_TIMEOUT);
  });
});
