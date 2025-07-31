import { act } from '@testing-library/react-native'
import { useParentalControlStore } from '@/stores/parentalControlStore'
import {
  mockSafeZones,
  mockEmergencyContacts,
  createMockSafeZone,
  createMockEmergencyContact,
  setupKidMapTests,
} from '../helpers'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('../helpers/mockAsyncStorage').createAsyncStorageMock(),
)

describe('Parental Control Store', () => {
  beforeEach(() => {
    setupKidMapTests()
    // Reset store state
    const store = useParentalControlStore.getState()
    if (store.setSafeZones) {
      act(() => {
        store.setSafeZones?.([])
        store.setEmergencyContacts?.([])
        store.setLocationSharingEnabled?.(true)
        store.setParentalLockEnabled?.(false)
      })
    }
    // Reset locked state for legacy functionality
    useParentalControlStore.setState({ isLocked: false })
  })

  describe('Legacy Lock Screen Functionality', () => {
    it('should start with isLocked = false by default', () => {
      const { isLocked } = useParentalControlStore.getState()
      expect(isLocked).toBe(false)
    })

    it('should lock the screen when lockScreen is called', () => {
      const { lockScreen } = useParentalControlStore.getState()

      act(() => {
        lockScreen()
      })

      const { isLocked } = useParentalControlStore.getState()
      expect(isLocked).toBe(true)
    })

    it('should unlock the screen when unlockScreen is called', () => {
      const { lockScreen, unlockScreen } = useParentalControlStore.getState()

      act(() => {
        lockScreen()
        unlockScreen()
      })

      const { isLocked } = useParentalControlStore.getState()
      expect(isLocked).toBe(false)
    })

    it('should maintain locked state until explicitly unlocked', () => {
      const { lockScreen } = useParentalControlStore.getState()

      act(() => {
        lockScreen()
      })

      const { isLocked } = useParentalControlStore.getState()
      expect(isLocked).toBe(true)
    })
  })

  describe('Safe Zone Management', () => {
    it('should set and get safe zones if supported', () => {
      const { setSafeZones } = useParentalControlStore.getState()

      if (setSafeZones) {
        const testSafeZones = [mockSafeZones[0], mockSafeZones[1]]

        act(() => {
          setSafeZones(testSafeZones)
        })

        const updatedState = useParentalControlStore.getState()
        expect(updatedState.safeZones).toEqual(testSafeZones)
        expect(updatedState.safeZones).toHaveLength(2)
      }
    })

    it('should add a new safe zone if supported', () => {
      const { addSafeZone } = useParentalControlStore.getState()

      if (addSafeZone) {
        const newSafeZone = mockSafeZones[0]

        act(() => {
          addSafeZone(newSafeZone)
        })

        const updatedState = useParentalControlStore.getState()
        expect(updatedState.safeZones).toContainEqual(newSafeZone)
      }
    })

    it('should work with custom safe zones', () => {
      const { setSafeZones } = useParentalControlStore.getState()

      if (setSafeZones) {
        const customSafeZone = createMockSafeZone({
          id: 'custom-park',
          name: 'City Park',
          type: 'recreational',
          center: { latitude: 40.7831, longitude: -73.9712 },
          radius: 150,
          isActive: true,
        })

        act(() => {
          setSafeZones([customSafeZone])
        })

        const updatedState = useParentalControlStore.getState()
        expect(updatedState.safeZones?.[0]?.name).toBe('City Park')
        expect(updatedState.safeZones?.[0]?.type).toBe('recreational')
      }
    })
  })

  describe('Emergency Contacts Management', () => {
    it('should set and get emergency contacts if supported', () => {
      const { setEmergencyContacts } = useParentalControlStore.getState()

      if (setEmergencyContacts) {
        const testContacts = [
          mockEmergencyContacts[0],
          mockEmergencyContacts[1],
        ]

        act(() => {
          setEmergencyContacts(testContacts)
        })

        const updatedState = useParentalControlStore.getState()
        expect(updatedState.emergencyContacts).toEqual(testContacts)
        expect(updatedState.emergencyContacts).toHaveLength(2)
      }
    })

    it('should work with custom emergency contacts', () => {
      const { setEmergencyContacts } = useParentalControlStore.getState()

      if (setEmergencyContacts) {
        const customContact = createMockEmergencyContact({
          id: 'custom-contact',
          name: 'Aunt Sarah',
          phone: '+1-555-0123',
          relationship: 'aunt',
          isPrimary: false,
        })

        act(() => {
          setEmergencyContacts([customContact])
        })

        const updatedState = useParentalControlStore.getState()
        expect(updatedState.emergencyContacts?.[0]?.name).toBe('Aunt Sarah')
        expect(updatedState.emergencyContacts?.[0]?.relationship).toBe('aunt')
      }
    })
  })

  describe('Privacy Settings', () => {
    it('should toggle location sharing if supported', () => {
      const { setLocationSharingEnabled } = useParentalControlStore.getState()

      if (setLocationSharingEnabled) {
        // Disable location sharing
        act(() => {
          setLocationSharingEnabled(false)
        })

        let state = useParentalControlStore.getState()
        expect(state.isLocationSharingEnabled).toBe(false)

        // Re-enable location sharing
        act(() => {
          setLocationSharingEnabled(true)
        })

        state = useParentalControlStore.getState()
        expect(state.isLocationSharingEnabled).toBe(true)
      }
    })

    it('should toggle parental lock if supported', () => {
      const { setParentalLockEnabled } = useParentalControlStore.getState()

      if (setParentalLockEnabled) {
        // Enable parental lock
        act(() => {
          setParentalLockEnabled(true)
        })

        let state = useParentalControlStore.getState()
        expect(state.isParentalLockEnabled).toBe(true)

        // Disable parental lock
        act(() => {
          setParentalLockEnabled(false)
        })

        state = useParentalControlStore.getState()
        expect(state.isParentalLockEnabled).toBe(false)
      }
    })
  })

  describe('Integration with Mock Data', () => {
    it('should work with helper mock data', () => {
      const homeSafeZone = mockSafeZones.find((sz) => sz.name === 'Home')
      const momContact = mockEmergencyContacts.find((ec) => ec.name === 'Mom')

      expect(homeSafeZone).toBeDefined()
      expect(homeSafeZone?.type).toBe('home')

      expect(momContact).toBeDefined()
      expect(momContact?.relationship).toBe('mother')
      expect(momContact?.isPrimary).toBe(true)
    })
  })
})
