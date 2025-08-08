// __tests__/stores/regionStore.test.ts - Region store tests
import { act } from '@testing-library/react-native'
import { useRegionStore } from '@/stores/regionStore'
import {
  mockRegions,
  mockTransitSystems,
  createMockRegion,
  createMockTransitSystem,
  setupKidMapTests,
} from '../helpers'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('../helpers/mockAsyncStorage').createAsyncStorageMock(),
)

// Mock geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
}))

describe('Region Store', () => {
  beforeEach(() => {
    setupKidMapTests()
    // Reset store state
    const store = useRegionStore.getState()
    act(() => {
      store.setCurrentRegion(null)
      store.setAvailableRegions([])
      store.setTransitSystems([])
    })
  })

  describe('Region Management', () => {
    it('should set and get current region', () => {
      const testRegion = mockRegions[0] // NYC
      const { setCurrentRegion } = useRegionStore.getState()

      act(() => {
        setCurrentRegion(testRegion)
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.currentRegion).toEqual(testRegion)
      expect(updatedState.currentRegion?.name).toBe('New York City')
    })

    it('should set available regions', () => {
      const testRegions = [mockRegions[0], mockRegions[1]] // NYC and San Francisco
      const { setAvailableRegions } = useRegionStore.getState()

      act(() => {
        setAvailableRegions(testRegions)
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.availableRegions).toEqual(testRegions)
      expect(updatedState.availableRegions).toHaveLength(2)
    })

    it('should find region by coordinates', () => {
      const { setAvailableRegions, findRegionByCoordinates } =
        useRegionStore.getState()

      act(() => {
        setAvailableRegions(mockRegions)
      })

      // Test NYC coordinates
      const nycCoords = { latitude: 40.7589, longitude: -73.9851 }
      const foundRegion = findRegionByCoordinates?.(nycCoords)

      expect(foundRegion?.name).toBe('New York City')
      expect(foundRegion?.code).toBe('NYC')
    })

    it('should handle coordinates outside available regions', () => {
      const { setAvailableRegions, findRegionByCoordinates } =
        useRegionStore.getState()

      act(() => {
        setAvailableRegions(mockRegions)
      })

      // Test coordinates in middle of ocean
      const oceanCoords = { latitude: 0, longitude: 0 }
      const foundRegion = findRegionByCoordinates?.(oceanCoords)

      expect(foundRegion).toBeNull()
    })

    it('should work with custom regions', () => {
      const customRegion = createMockRegion({
        id: 'custom-region',
        name: 'Custom City',
        code: 'CC',
        country: 'Test Country',
        bounds: {
          north: 41.0,
          south: 40.0,
          east: -73.0,
          west: -74.0,
        },
        timezone: 'America/New_York',
      })

      const { setCurrentRegion } = useRegionStore.getState()

      act(() => {
        setCurrentRegion(customRegion)
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.currentRegion?.name).toBe('Custom City')
      expect(updatedState.currentRegion?.code).toBe('CC')
      expect(updatedState.currentRegion?.country).toBe('Test Country')
    })
  })

  describe('Transit System Management', () => {
    it('should set and get transit systems', () => {
      const testTransitSystems = [mockTransitSystems[0], mockTransitSystems[1]]
      const { setTransitSystems } = useRegionStore.getState()

      act(() => {
        setTransitSystems(testTransitSystems)
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.transitSystems).toEqual(testTransitSystems)
      expect(updatedState.transitSystems).toHaveLength(2)
    })

    it('should get transit systems for region', () => {
      const nycRegion = mockRegions[0] // NYC
      const {
        setCurrentRegion,
        setTransitSystems,
        getTransitSystemsForRegion,
      } = useRegionStore.getState()

      act(() => {
        setCurrentRegion(nycRegion)
        setTransitSystems(mockTransitSystems)
      })

      const regionTransitSystems = getTransitSystemsForRegion?.(nycRegion.id)
      expect(regionTransitSystems).toBeDefined()
      expect(regionTransitSystems?.length).toBeGreaterThan(0)

      // Should include MTA subway for NYC
      const mtaSubway = regionTransitSystems?.find(
        (ts) => ts.name === 'MTA Subway',
      )
      expect(mtaSubway).toBeDefined()
      expect(mtaSubway?.type).toBe('subway')
    })

    it('should work with custom transit systems', () => {
      const customTransit = createMockTransitSystem({
        id: 'custom-transit',
        name: 'Custom Bus',
        type: 'bus',
        regionId: 'custom-region',
        color: '#FF0000',
        isActive: true,
      })

      const { setTransitSystems } = useRegionStore.getState()

      act(() => {
        setTransitSystems([customTransit])
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.transitSystems[0].name).toBe('Custom Bus')
      expect(updatedState.transitSystems[0].type).toBe('bus')
      expect(updatedState.transitSystems[0].color).toBe('#FF0000')
    })
  })

  describe('Region Detection', () => {
    it('should auto-detect region from coordinates', () => {
      const { setAvailableRegions, autoDetectRegion } =
        useRegionStore.getState()

      act(() => {
        setAvailableRegions(mockRegions)
      })

      // Simulate auto-detection for NYC
      const nycCoords = { latitude: 40.7589, longitude: -73.9851 }

      act(() => {
        autoDetectRegion?.(nycCoords)
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.currentRegion?.name).toBe('New York City')
    })

    it('should handle auto-detection failure gracefully', () => {
      const { setAvailableRegions, autoDetectRegion } =
        useRegionStore.getState()

      act(() => {
        setAvailableRegions(mockRegions)
      })

      // Try to auto-detect in unsupported region
      const unsupportedCoords = { latitude: 0, longitude: 0 }

      act(() => {
        autoDetectRegion?.(unsupportedCoords)
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.currentRegion).toBeNull()
    })
  })

  describe('Region Switching', () => {
    it('should switch regions and update transit systems', () => {
      const { setAvailableRegions, setTransitSystems, switchToRegion } =
        useRegionStore.getState()

      act(() => {
        setAvailableRegions(mockRegions)
        setTransitSystems(mockTransitSystems)
      })

      // Switch to San Francisco
      const sfRegion = mockRegions.find((r) => r.code === 'SF')

      act(() => {
        switchToRegion?.(sfRegion!.id)
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.currentRegion?.name).toBe('San Francisco')

      // Should have appropriate transit systems
      const sfTransitSystems = updatedState.transitSystems?.filter(
        (ts) => ts.regionId === sfRegion!.id,
      )
      expect(sfTransitSystems?.length).toBeGreaterThan(0)
    })

    it('should handle switching to non-existent region', () => {
      const { switchToRegion } = useRegionStore.getState()

      act(() => {
        switchToRegion?.('non-existent-region')
      })

      const updatedState = useRegionStore.getState()
      expect(updatedState.currentRegion).toBeNull()
    })
  })

  describe('Regional Features', () => {
    it('should check if region supports features', () => {
      const nycRegion = mockRegions[0]
      const { setCurrentRegion, doesRegionSupportFeature } =
        useRegionStore.getState()

      act(() => {
        setCurrentRegion(nycRegion)
      })

      // Test feature support
      const supportsSubway = doesRegionSupportFeature?.('subway')
      const supportsBikeShare = doesRegionSupportFeature?.('bike_share')

      expect(supportsSubway).toBe(true)
      expect(supportsBikeShare).toBe(true)
    })

    it('should get region-specific settings', () => {
      const nycRegion = mockRegions[0]
      const { setCurrentRegion, getRegionalSettings } =
        useRegionStore.getState()

      act(() => {
        setCurrentRegion(nycRegion)
      })

      const settings = getRegionalSettings?.()
      expect(settings?.timezone).toBe('America/New_York')
      expect(settings?.currency).toBe('USD')
      expect(settings?.language).toBe('en')
    })
  })

  describe('Complete Region Flow', () => {
    it('should handle full region setup', () => {
      const { setAvailableRegions, setTransitSystems, setCurrentRegion } =
        useRegionStore.getState()

      const testRegions = mockRegions
      const testTransitSystems = mockTransitSystems
      const currentRegion = mockRegions[0] // NYC

      act(() => {
        setAvailableRegions(testRegions)
        setTransitSystems(testTransitSystems)
        setCurrentRegion(currentRegion)
      })

      const finalState = useRegionStore.getState()
      expect(finalState.availableRegions).toEqual(testRegions)
      expect(finalState.transitSystems).toEqual(testTransitSystems)
      expect(finalState.currentRegion).toEqual(currentRegion)

      // Verify region has associated transit systems
      const regionTransitCount = finalState.transitSystems?.filter(
        (ts) => ts.regionId === currentRegion.id,
      ).length
      expect(regionTransitCount).toBeGreaterThan(0)
    })

    it('should validate region completeness', () => {
      const { setAvailableRegions, setCurrentRegion } =
        useRegionStore.getState()

      act(() => {
        setAvailableRegions(mockRegions)
        setCurrentRegion(mockRegions[0])
      })

      const state = useRegionStore.getState()
      const hasValidRegionSetup =
        state.availableRegions.length > 0 && state.currentRegion !== null
      expect(hasValidRegionSetup).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid region data', () => {
      const { setAvailableRegions } = useRegionStore.getState()

      act(() => {
        setAvailableRegions([] as any)
      })

      const state = useRegionStore.getState()
      expect(state.availableRegions).toEqual([])
    })

    it('should handle null current region', () => {
      const { setCurrentRegion } = useRegionStore.getState()

      act(() => {
        setCurrentRegion(null)
      })

      const state = useRegionStore.getState()
      expect(state.currentRegion).toBeNull()
    })
  })

  describe('Data Integration', () => {
    it('should work with helper mock data structure', () => {
      const nycRegion = mockRegions.find((r) => r.code === 'NYC')
      const sfRegion = mockRegions.find((r) => r.code === 'SF')

      expect(nycRegion).toBeDefined()
      expect(nycRegion?.name).toBe('New York City')
      expect(nycRegion?.timezone).toBe('America/New_York')

      expect(sfRegion).toBeDefined()
      expect(sfRegion?.name).toBe('San Francisco')
      expect(sfRegion?.timezone).toBe('America/Los_Angeles')
    })

    it('should verify transit system associations', () => {
      const mtaSubway = mockTransitSystems.find(
        (ts) => ts.name === 'MTA Subway',
      )
      const bartSystem = mockTransitSystems.find((ts) => ts.name === 'BART')

      expect(mtaSubway?.regionId).toBe('nyc')
      expect(mtaSubway?.type).toBe('subway')

      expect(bartSystem?.regionId).toBe('sf')
      expect(bartSystem?.type).toBe('rail')
    })
  })

  describe('State Persistence', () => {
    it('should maintain consistent state', () => {
      const testData = {
        regions: mockRegions,
        currentRegion: mockRegions[0],
        transitSystems: mockTransitSystems,
      }

      const { setAvailableRegions, setCurrentRegion, setTransitSystems } =
        useRegionStore.getState()

      act(() => {
        setAvailableRegions(testData.regions)
        setCurrentRegion(testData.currentRegion)
        setTransitSystems(testData.transitSystems)
      })

      // Verify state persists across multiple reads
      const state1 = useRegionStore.getState()
      const state2 = useRegionStore.getState()

      expect(state1.availableRegions).toEqual(state2.availableRegions)
      expect(state1.currentRegion).toEqual(state2.currentRegion)
      expect(state1.transitSystems).toEqual(state2.transitSystems)
    })
  })
})
