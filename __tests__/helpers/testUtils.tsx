// __tests__/testUtils.tsx - Shared test utilities and mocks
import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Common mock implementations
export const mockAsyncStorage = {
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
};

export const mockSpeechEngine = {
  speak: jest.fn().mockResolvedValue(undefined),
};

export const mockGamificationStore = {
  safetyContacts: [
    { id: '1', name: 'Mom', phone: '+1234567890', isPrimary: true }
  ],
  userStats: {
    totalRoutes: 10,
    totalDistance: 50,
    timesSaved: 5,
    co2Saved: 2.5,
    safetyScore: 85,
  },
  addPoints: jest.fn().mockResolvedValue(undefined),
  updateStats: jest.fn().mockResolvedValue(undefined),
};

export const mockSafeZoneStore = {
  safeZones: [
    {
      id: 'zone-1',
      name: 'Home',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 100,
      isActive: true,
    }
  ],
  addSafeZone: jest.fn().mockResolvedValue(undefined),
  updateSafeZone: jest.fn().mockResolvedValue(undefined),
  removeSafeZone: jest.fn().mockResolvedValue(undefined),
};

export const mockParentalControlStore = {
  session: { isAuthenticated: false },
  childActivity: {
    lastSeen: new Date(),
    isInSafeZone: true,
    currentSafeZone: 'Home',
    batteryLevel: 85,
    currentLocation: [40.7128, -74.0060],
  },
  pendingApprovals: [],
  isSessionValid: jest.fn(() => false),
  extendSession: jest.fn().mockResolvedValue(undefined),
  requestChildCheckIn: jest.fn().mockResolvedValue(undefined),
  locateChild: jest.fn().mockResolvedValue(undefined),
  triggerEmergencyAlert: jest.fn().mockResolvedValue(undefined),
  settings: {},
};

export const mockCategoryStore = {
  getPendingCategories: jest.fn(() => []),
  initializeDefaultCategories: jest.fn().mockResolvedValue(undefined),
};

// Setup common mocks
export const setupMocks = () => {
  // Mock Alert
  jest.spyOn(require('react-native'), 'Alert', 'get').mockReturnValue({
    alert: jest.fn(),
  });

  // Mock AsyncStorage
  jest.doMock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

  // Mock speechEngine
  jest.doMock('@/utils/speechEngine', () => ({
    speechEngine: mockSpeechEngine,
  }));

  // Mock stores
  jest.doMock('@/stores/gamificationStore', () => ({
    useGamificationStore: () => mockGamificationStore,
  }));

  jest.doMock('@/stores/safeZoneStore', () => ({
    useSafeZoneStore: () => mockSafeZoneStore,
  }));

  jest.doMock('@/stores/parentalControlStore', () => ({
    useParentalControlStore: () => mockParentalControlStore,
  }));

  jest.doMock('@/stores/categoryStore', () => ({
    useCategoryStore: () => mockCategoryStore,
  }));

  // Mock router
  jest.doMock('expo-router', () => ({
    useRouter: () => ({
      push: jest.fn(),
      back: jest.fn(),
    }),
  }));
};

// Custom render function with common providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };

// Common test data
export const mockSafeZone = {
  id: 'test-zone-1',
  name: 'Test Zone',
  latitude: 40.7128,
  longitude: -74.0060,
  radius: 100,
  isActive: true,
};

export const mockLocation = {
  latitude: 40.7128,
  longitude: -74.0060,
};

// Helper functions for tests
export const waitForAsyncUpdates = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockZone = (overrides = {}) => ({
  ...mockSafeZone,
  ...overrides,
});
