// __tests__/examples/helpersUsageExample.test.tsx - Example showing how to use all helper utilities
import React from 'react';
import {
  renderWithProviders,
  renderWithNavigation,
  renderWithAllProviders,
  mockTripData,
  createMockTripData,
  mockUserStatsProgression,
  setupMockAsyncStorage,
  mockAsyncStorageInstance,
  STORAGE_KEYS,
  getMockSafeZones,
  fillSafeZoneForm,
  createMockZone,
  setupKidMapTests,
  fireEvent,
  waitFor,
  act,
} from '../helpers';
import { Platform } from '../Utilities/Platform.js';

// Example component to test (you would import your actual components)
const ExampleComponent = ({ title = 'Test' }) => (
  <div>
    <h1>{title}</h1>
    <button>Click me</button>
  </div>
);

describe('Helper Usage Examples', () => {
  beforeEach(() => {
    // Easy setup for all KidMap tests
    setupKidMapTests();
  });

  describe('Render Helpers', () => {
    it('should use basic render with providers', () => {
      const { getByText } = renderWithProviders(<ExampleComponent />);
      expect(getByText('Test')).toBeTruthy();
    });

    it('should use render with navigation for navigation-dependent components', () => {
      const { getByText } = renderWithNavigation(<ExampleComponent title="Navigation Test" />);
      expect(getByText('Navigation Test')).toBeTruthy();
    });

    it('should use full render for integration tests', () => {
      const { getByText } = renderWithAllProviders(<ExampleComponent title="Integration Test" />);
      expect(getByText('Integration Test')).toBeTruthy();
    });
  });

  describe('AsyncStorage Helpers', () => {
    it('should use mock AsyncStorage with default data', async () => {
      // Access pre-populated mock data
      const safeZones = await mockAsyncStorageInstance.getItem(STORAGE_KEYS.SAFE_ZONES);
      const parsedZones = JSON.parse(safeZones || '[]');
      
      expect(parsedZones).toHaveLength(2);
      expect(parsedZones[0].name).toBe('Home');
    });

    it('should set custom storage data for testing', async () => {
      // Set custom data
      mockAsyncStorageInstance.setStorageData({
        [STORAGE_KEYS.USER_STATS]: JSON.stringify(mockUserStatsProgression.advanced),
      });

      const userStats = await mockAsyncStorageInstance.getItem(STORAGE_KEYS.USER_STATS);
      const parsedStats = JSON.parse(userStats || '{}');
      
      expect(parsedStats.level).toBe(7);
      expect(parsedStats.totalTrips).toBe(50);
    });

    it('should test AsyncStorage failures', async () => {
      // Simulate storage failure
      mockAsyncStorageInstance.setFailureMode(true, new Error('Storage unavailable'));

      await expect(
        mockAsyncStorageInstance.getItem(STORAGE_KEYS.USER_STATS)
      ).rejects.toThrow('Storage unavailable');
    });

    it('should use helper functions for mock data', () => {
      const safeZones = getMockSafeZones();
      expect(safeZones).toHaveLength(2);
      expect(safeZones[0].name).toBe('Home');
    });
  });

  describe('Trip Data Helpers', () => {
    it('should use predefined mock trip data', () => {
      const walkingTrip = mockTripData.walkingTrip;
      
      expect(walkingTrip.destination).toBe('Central Park');
      expect(walkingTrip.mode).toBe('walking');
      expect(walkingTrip.safety).toBe(5);
    });

    it('should create custom trip data', () => {
      const customTrip = createMockTripData({
        destination: 'Custom Location',
        duration: 30,
        mode: 'transit',
        safety: 4,
      });

      expect(customTrip.destination).toBe('Custom Location');
      expect(customTrip.duration).toBe(30);
      expect(customTrip.mode).toBe('transit');
    });

    it('should use different user progression levels', () => {
      const beginner = mockUserStatsProgression.beginner;
      const advanced = mockUserStatsProgression.advanced;

      expect(beginner.level).toBe(1);
      expect(beginner.totalTrips).toBe(1);
      
      expect(advanced.level).toBe(7);
      expect(advanced.totalTrips).toBe(50);
    });
  });

  describe('Safe Zone Helpers', () => {
    it('should create mock safe zones', () => {
      const customZone = createMockZone('Custom Zone'); // Assuming it expects a string

      expect(customZone.name).toBe('Custom Zone');
      expect(customZone.latitude).toBe(37.7749);
      expect(customZone.radius).toBe(200);
    });

    // Note: These helpers are designed for React Native components with TextInput
    // For web/JSX testing, you'd adapt these patterns to your components
    it('should demonstrate safe zone form helpers concept', () => {
      // This is a conceptual example - adapt to your actual components
      const mockRenderResult = {
        getByPlaceholderText: jest.fn().mockReturnValue({ value: '' }),
        getByText: jest.fn().mockReturnValue({}),
      } as any;

      // The helper would fill form fields
      fillSafeZoneForm(mockRenderResult, {
        name: 'Test Zone',
        latitude: '40.7128',
        longitude: '-74.0060',
        radius: '100',
      });

      expect(mockRenderResult.getByPlaceholderText).toHaveBeenCalledWith('Name');
    });
  });

  describe('Integration Testing Example', () => {
    it('should demonstrate full integration test setup', async () => {
      // 1. Set up custom storage state
      mockAsyncStorageInstance.setStorageData({
        [STORAGE_KEYS.USER_STATS]: JSON.stringify(mockUserStatsProgression.intermediate),
        [STORAGE_KEYS.TRIP_JOURNAL]: JSON.stringify([]),
      });

      // 2. Render component with all providers
      const { getByText } = renderWithAllProviders(<ExampleComponent title="Integration" />);

      // 3. Verify component renders
      expect(getByText('Integration')).toBeTruthy();

      // 4. Simulate user actions
      const button = getByText('Click me');
      fireEvent.press(button);

      // 5. Wait for async updates if needed
      await waitFor(() => {
        // Assert expected behavior
        expect(button).toBeTruthy();
      });

      // 6. Verify storage interactions
      const storageSnapshot = mockAsyncStorageInstance.getStorageSnapshot();
      expect(storageSnapshot[STORAGE_KEYS.USER_STATS]).toBeDefined();
    });
  });

  describe('Error Scenarios', () => {
    it('should test component behavior with empty storage', async () => {
      // Clear all storage
      mockAsyncStorageInstance.clear();

      const { getByText } = renderWithProviders(<ExampleComponent title="Empty State" />);
      
      expect(getByText('Empty State')).toBeTruthy();
      
      // Verify storage is empty
      const keys = await mockAsyncStorageInstance.getAllKeys();
      expect(keys).toHaveLength(0);
    });

    it('should test component behavior with corrupted data', async () => {
      // Set corrupted JSON data
      mockAsyncStorageInstance.setStorageData({
        [STORAGE_KEYS.USER_STATS]: 'invalid json data',
      });

      const { getByText } = renderWithProviders(<ExampleComponent title="Corrupted Data" />);
      
      expect(getByText('Corrupted Data')).toBeTruthy();
    });
  });
});

// Update Jest configuration to include the correct module extensions
// Add this to jest.config.js
module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'android.js', 'ios.js'],
};
