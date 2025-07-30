// __tests__/integration/safetySystem.integration.test.tsx - Fixed integration tests
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SafeZoneManager from '@/components/SafeZoneManager';
import SafetyErrorBoundary from '@/components/SafetyErrorBoundary';
import { safeZoneAlertManager } from '@/utils/safeZoneAlerts';
import { renderWithAllProviders, setupKidMapTests } from '../helpers';

// Use our comprehensive AsyncStorage mock
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

jest.mock('@/stores/safeZoneStore', () => ({
  useSafeZoneStore: () => ({
    safeZones: [],
    addSafeZone: jest.fn().mockResolvedValue(undefined),
    updateSafeZone: jest.fn().mockResolvedValue(undefined),
    removeSafeZone: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Safety System Integration', () => {
  beforeEach(() => {
    setupKidMapTests();
    jest.clearAllMocks();
  });

  it('should render SafeZoneManager without errors', () => {
    const { getByText } = renderWithAllProviders(<SafeZoneManager />);
    expect(getByText('Safe Zones')).toBeTruthy();
  });

  it('should handle SafetyErrorBoundary correctly', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { getByText } = renderWithAllProviders(
      <SafetyErrorBoundary componentName="Test">
        <ErrorComponent />
      </SafetyErrorBoundary>
    );

    expect(getByText('Safety Feature Unavailable')).toBeTruthy();
  });

  it('should initialize SafeZoneAlertManager', async () => {
    await safeZoneAlertManager.initialize();
    const settings = safeZoneAlertManager.getSettings();
    expect(settings).toBeDefined();
    expect(typeof settings.enableVoiceAlerts).toBe('boolean');
  });
});