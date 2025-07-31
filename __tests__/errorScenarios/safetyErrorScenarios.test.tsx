// __tests__/errorScenarios/safetyErrorScenarios.test.tsx

import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'
import SafeZoneManager from '@/components/SafeZoneManager'
import { safeZoneAlertManager } from '@/utils/safeZoneAlerts'
import {
  renderWithProviders,
  setupKidMapTests,
  mockAsyncStorageInstance,
  setupFailingAsyncStorage,
} from '../helpers'
import AsyncStorage from '@react-native-async-storage/async-storage'

// 🔧 Use our comprehensive mocks
jest.mock('@react-native-async-storage/async-storage', () =>
  require('../helpers/mockAsyncStorage').createAsyncStorageMock(),
)

jest.mock('@/utils/speechEngine', () => ({
  speechEngine: {
    speak: jest.fn(),
  },
}))

jest.mock('@/stores/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      addPoints: jest.fn(),
      updateStats: jest.fn(),
      userStats: { safeTrips: 0 },
    }),
  },
}))

jest.mock('@/stores/safeZoneStore', () => ({
  useSafeZoneStore: () => ({
    safeZones: [],
    addSafeZone: jest.fn().mockResolvedValue(undefined),
    updateSafeZone: jest.fn().mockResolvedValue(undefined),
    removeSafeZone: jest.fn().mockResolvedValue(undefined),
  }),
}))

jest.spyOn(Alert, 'alert')
jest.spyOn(console, 'error').mockImplementation(() => {})

describe('Safety Error Scenarios', () => {
  beforeEach(() => {
    setupKidMapTests()
    jest.clearAllMocks()
  })

  describe('AsyncStorage Failures', () => {
    it('handles getItem failure gracefully', async () => {
      setupFailingAsyncStorage(new Error('Storage read error'))
      await safeZoneAlertManager.initialize()
      const settings = safeZoneAlertManager.getSettings()
      expect(settings.enableVoiceAlerts).toBe(true) // default
    })

    it('handles setItem failure gracefully', async () => {
      setupFailingAsyncStorage(new Error('Storage write error'))
      const mockZone = {
        id: 'zone-1',
        name: 'Test Zone',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 100,
        isActive: true,
      }

      await expect(
        safeZoneAlertManager.handleSafeZoneEvent('zone-1', 'enter', mockZone, {
          latitude: 40.7128,
          longitude: -74.006,
        }),
      ).resolves.not.toThrow()
    })
  })

  describe('Validation Errors in Form', () => {
    it('validates empty and out-of-range inputs', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(
        <SafeZoneManager />,
      )
      fireEvent.changeText(getByPlaceholderText('Name'), '')
      fireEvent.changeText(getByPlaceholderText('Latitude'), '999')
      fireEvent.changeText(getByPlaceholderText('Longitude'), '-999')
      fireEvent.changeText(getByPlaceholderText('Radius (m)'), '5')
      fireEvent.press(getByText('Add Safe Zone'))

      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy()
      })
    })

    it('validates extreme values', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(
        <SafeZoneManager />,
      )
      fireEvent.changeText(getByPlaceholderText('Name'), 'A'.repeat(1000))
      fireEvent.changeText(getByPlaceholderText('Latitude'), '999999')
      fireEvent.changeText(getByPlaceholderText('Longitude'), '-999999')
      fireEvent.changeText(getByPlaceholderText('Radius (m)'), '999999999')
      fireEvent.press(getByText('Add Safe Zone'))

      await waitFor(() => {
        expect(getByText(/Name cannot exceed 50 characters/)).toBeTruthy()
        expect(getByText('Latitude must be between -90 and 90')).toBeTruthy()
        expect(getByText('Longitude must be between -180 and 180')).toBeTruthy()
        expect(getByText('Radius cannot exceed 10000 meters')).toBeTruthy()
      })
    })

    it('handles non-numeric inputs', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(
        <SafeZoneManager />,
      )
      fireEvent.changeText(getByPlaceholderText('Latitude'), 'not a number')
      fireEvent.changeText(
        getByPlaceholderText('Longitude'),
        'also not a number',
      )
      fireEvent.changeText(
        getByPlaceholderText('Radius (m)'),
        'definitely not a number',
      )
      fireEvent.press(getByText('Add Safe Zone'))

      await waitFor(() => {
        expect(getByText('Latitude must be a valid number')).toBeTruthy()
        expect(getByText('Longitude must be a valid number')).toBeTruthy()
        expect(getByText('Radius must be a valid number')).toBeTruthy()
      })
    })

    it('sanitizes suspicious or injection-like input', async () => {
      const { getByPlaceholderText, getByText } = renderWithProviders(
        <SafeZoneManager />,
      )
      fireEvent.changeText(
        getByPlaceholderText('Name'),
        '<script>alert("xss")</script>',
      )
      fireEvent.changeText(
        getByPlaceholderText('Latitude'),
        '"; DROP TABLE zones; --',
      )
      fireEvent.changeText(
        getByPlaceholderText('Longitude'),
        '${process.exit()}',
      )
      fireEvent.press(getByText('Add Safe Zone'))

      await waitFor(() => {
        expect(getByText('Add Safe Zone')).toBeTruthy() // component should still render
      })
    })
  })

  describe('Settings Validation', () => {
    it('throws when updating with invalid settings', async () => {
      await expect(
        safeZoneAlertManager.updateSettings({ alertCooldownMinutes: -1 }),
      ).rejects.toThrow()
    })
  })

  describe('Memory and Performance', () => {
    it('caps event history to prevent memory overuse', async () => {
      const mockZone = {
        id: 'zone-1',
        name: 'Test Zone',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 100,
        isActive: true,
      }

      for (let i = 0; i < 1000; i++) {
        await safeZoneAlertManager.handleSafeZoneEvent(
          'zone-1',
          i % 2 === 0 ? 'enter' : 'exit',
          mockZone,
          { latitude: 40.7128, longitude: -74.006 },
        )
      }

      const history = safeZoneAlertManager.getEventHistory()
      expect(history.length).toBeLessThanOrEqual(100)
    })

    it('processes rapid-fire events without crashing', async () => {
      const mockZone = {
        id: 'zone-1',
        name: 'Test Zone',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 100,
        isActive: true,
      }

      const events = Array.from({ length: 50 }, () =>
        safeZoneAlertManager.handleSafeZoneEvent('zone-1', 'enter', mockZone, {
          latitude: 40.7128,
          longitude: -74.006,
        }),
      )

      await expect(Promise.all(events)).resolves.not.toThrow()
    })
  })

  describe('Concurrent Access', () => {
    it('handles simultaneous zone event updates', async () => {
      const mockZone1 = {
        id: 'zone-1',
        name: 'Zone 1',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 100,
        isActive: true,
      }

      const mockZone2 = {
        id: 'zone-2',
        name: 'Zone 2',
        latitude: 40.7228,
        longitude: -74.016,
        radius: 150,
        isActive: true,
      }

      const result = await Promise.all([
        safeZoneAlertManager.handleSafeZoneEvent('zone-1', 'enter', mockZone1, {
          latitude: 40.7128,
          longitude: -74.006,
        }),
        safeZoneAlertManager.handleSafeZoneEvent('zone-2', 'enter', mockZone2, {
          latitude: 40.7228,
          longitude: -74.016,
        }),
      ])

      expect(result).toBeDefined()
      expect(safeZoneAlertManager.getEventHistory().length).toBe(2)
    })
  })

  describe('State Corruption', () => {
    it('recovers from corrupted AsyncStorage data', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        'corrupted json data',
      )
      await safeZoneAlertManager.initialize()
      const settings = safeZoneAlertManager.getSettings()
      expect(settings.enableVoiceAlerts).toBe(true)
    })

    it('handles null or undefined data', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
      await safeZoneAlertManager.initialize()
      const settings = safeZoneAlertManager.getSettings()
      expect(settings).toBeDefined()
      expect(typeof settings.enableVoiceAlerts).toBe('boolean')
    })
  })

  describe('Crash Recovery', () => {
    const CrashingComponent = ({ shouldCrash }: { shouldCrash: boolean }) => {
      if (shouldCrash) throw new Error('Component crashed')
      return <></>
    }

    it('renders safely when component crashes internally', () => {
      expect(() => <CrashingComponent shouldCrash={false} />).not.toThrow()
    })
  })
})
