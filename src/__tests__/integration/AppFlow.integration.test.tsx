// Integration test for safety system components
import React from 'react'
import { renderWithAllProviders, setupKidMapTests } from '../helpers'

// Mock the Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      googleMapsApiKey: 'test-key',
    },
  },
}))

// Use our comprehensive AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('../helpers/mockAsyncStorage').createAsyncStorageMock(),
)

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
}))

describe('Safety System Integration', () => {
  beforeEach(() => {
    setupKidMapTests()
  })

  describe('SafetyDashboard', () => {
    it('should render without crashing', async () => {
      const SafetyDashboard = require('@/components/SafetyDashboard').default
      const { getByText } = renderWithAllProviders(
        <SafetyDashboard visible={true} onClose={() => {}} />,
      )
      expect(getByText).toBeDefined()
    })
  })

  describe('SafetyPanel', () => {
    it('should render without crashing', async () => {
      const SafetyPanel = require('@/components/SafetyPanel').default
      const { getByText } = renderWithAllProviders(<SafetyPanel />)
      expect(getByText).toBeDefined()
    })
  })

  describe('SafeZoneManager', () => {
    it('should render without crashing', async () => {
      const SafeZoneManager = require('@/components/SafeZoneManager').default
      const { getByText } = renderWithAllProviders(<SafeZoneManager />)
      expect(getByText).toBeDefined()
    })
  })
})
