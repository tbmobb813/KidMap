// __tests__/helpers/mockAsyncStorage.ts - Comprehensive AsyncStorage mock for KidMap testing
import AsyncStorage from '@react-native-async-storage/async-storage'

// Storage keys used throughout the app
export const STORAGE_KEYS = {
  USER_STATS: 'user_stats',
  ACHIEVEMENTS: 'achievements',
  SAFE_ZONES: 'safe_zones',
  TRIP_JOURNAL: 'trip_journal',
  SAFETY_CONTACTS: 'safety_contacts',
  USER_PREFERENCES: 'user_preferences',
  PARENT_AUTH: 'parent_auth',
  ACCESSIBILITY_SETTINGS: 'accessibility_settings',
  REGION_SETTINGS: 'region_settings',
  GAMIFICATION_DATA: 'gamification_data',
  PHOTO_CHECKINS: 'photo_checkins',
  FAVORITE_PLACES: 'favorite_places',
  ROUTE_HISTORY: 'route_history',
  SAFETY_SETTINGS: 'safety_settings',
} as const

// Default mock data for different storage keys
export const DEFAULT_STORAGE_DATA = {
  [STORAGE_KEYS.USER_STATS]: JSON.stringify({
    totalTrips: 5,
    totalPoints: 150,
    placesVisited: 8,
    favoriteTransitMode: 'walking',
    streakDays: 3,
    level: 2,
    averageSafety: 4.2,
    safeTrips: 4,
    walkingTrips: 3,
    transitTrips: 1,
    combinedTrips: 1,
    morningTrips: 2,
    eveningTrips: 3,
    totalDistance: 5.2,
    weatherConditions: ['sunny', 'cloudy'],
    consecutiveDays: 3,
  }),

  [STORAGE_KEYS.ACHIEVEMENTS]: JSON.stringify([
    {
      id: 'first_step',
      title: 'First Steps! 👶',
      description: 'Complete your first trip',
      icon: '🚶',
      points: 10,
      unlocked: true,
      unlockedAt: new Date('2025-07-25').toISOString(),
      category: 'milestone',
      requirement: 'Complete 1 trip',
    },
    {
      id: 'explorer',
      title: 'Little Explorer 🗺️',
      description: 'Complete 10 trips',
      icon: '🧭',
      points: 50,
      unlocked: false,
      category: 'milestone',
      requirement: 'Complete 10 trips',
    },
  ]),

  [STORAGE_KEYS.SAFE_ZONES]: JSON.stringify([
    {
      id: 'zone-home',
      name: 'Home',
      latitude: 40.7128,
      longitude: -74.006,
      radius: 100,
      isActive: true,
    },
    {
      id: 'zone-school',
      name: 'Lincoln Elementary',
      latitude: 40.758,
      longitude: -73.9855,
      radius: 150,
      isActive: true,
    },
  ]),

  [STORAGE_KEYS.TRIP_JOURNAL]: JSON.stringify([
    {
      id: 'trip-1',
      date: '2025-07-28',
      from: 'Home',
      to: 'Central Park',
      photos: ['photo1.jpg'],
      notes: 'Saw a cool squirrel!',
      rating: 5,
      funFacts: ['Central Park has over 25,000 trees!'],
    },
    {
      id: 'trip-2',
      date: '2025-07-29',
      from: 'Home',
      to: 'Public Library',
      photos: [],
      notes: 'Found a great book about space',
      rating: 4,
      funFacts: ['The New York Public Library has over 50 million items!'],
    },
  ]),

  [STORAGE_KEYS.SAFETY_CONTACTS]: JSON.stringify([
    {
      id: 'contact-1',
      name: 'Mom',
      phone: '+1234567890',
      relationship: 'Parent',
      isPrimary: true,
    },
    {
      id: 'contact-2',
      name: 'Dad',
      phone: '+1234567891',
      relationship: 'Parent',
      isPrimary: false,
    },
  ]),

  [STORAGE_KEYS.USER_PREFERENCES]: JSON.stringify({
    theme: 'auto',
    soundEnabled: true,
    voiceGuidance: true,
    notificationsEnabled: true,
    parentalControlsEnabled: true,
    defaultTransitMode: 'walking',
    language: 'en',
  }),

  [STORAGE_KEYS.ACCESSIBILITY_SETTINGS]: JSON.stringify({
    largeText: false,
    highContrast: false,
    voiceDescriptions: true,
    simplifiedMode: false,
  }),

  [STORAGE_KEYS.REGION_SETTINGS]: JSON.stringify({
    selectedRegion: 'nyc',
    availableRegions: ['nyc', 'sf', 'la'],
    transitApiKeys: {
      nyc: 'test-mta-key',
      sf: 'test-bart-key',
    },
  }),
}

// Mock storage implementation
class MockAsyncStorage {
  private storage: Record<string, string> = { ...DEFAULT_STORAGE_DATA }
  private shouldFail = false
  private failureError = new Error('MockAsyncStorage: Simulated failure')

  // Test control methods
  setFailureMode(shouldFail: boolean, error?: Error) {
    this.shouldFail = shouldFail
    if (error) {
      this.failureError = error
    }
  }

  resetToDefaults() {
    this.storage = { ...DEFAULT_STORAGE_DATA }
    this.shouldFail = false
  }

  clear() {
    this.storage = {}
  }

  // AsyncStorage interface implementation
  async getItem(key: string): Promise<string | null> {
    if (this.shouldFail) {
      throw this.failureError
    }
    return this.storage[key] || null
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.shouldFail) {
      throw this.failureError
    }
    this.storage[key] = value
  }

  async removeItem(key: string): Promise<void> {
    if (this.shouldFail) {
      throw this.failureError
    }
    delete this.storage[key]
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    if (this.shouldFail) {
      throw this.failureError
    }
    return keys.map((key) => [key, this.storage[key] || null])
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    if (this.shouldFail) {
      throw this.failureError
    }
    keyValuePairs.forEach(([key, value]) => {
      this.storage[key] = value
    })
  }

  async multiRemove(keys: string[]): Promise<void> {
    if (this.shouldFail) {
      throw this.failureError
    }
    keys.forEach((key) => {
      delete this.storage[key]
    })
  }

  async getAllKeys(): Promise<string[]> {
    if (this.shouldFail) {
      throw this.failureError
    }
    return Object.keys(this.storage)
  }

  // Test utility methods
  getStorageSnapshot(): Record<string, string> {
    return { ...this.storage }
  }

  setStorageData(data: Record<string, string>) {
    this.storage = { ...data }
  }
}

// Create singleton instance
export const mockAsyncStorageInstance = new MockAsyncStorage()

// Jest mock factory function
export const createAsyncStorageMock = () => ({
  getItem: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.getItem.bind(mockAsyncStorageInstance),
    ),
  setItem: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.setItem.bind(mockAsyncStorageInstance),
    ),
  removeItem: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.removeItem.bind(mockAsyncStorageInstance),
    ),
  multiGet: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.multiGet.bind(mockAsyncStorageInstance),
    ),
  multiSet: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.multiSet.bind(mockAsyncStorageInstance),
    ),
  multiRemove: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.multiRemove.bind(mockAsyncStorageInstance),
    ),
  getAllKeys: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.getAllKeys.bind(mockAsyncStorageInstance),
    ),
  clear: jest
    .fn()
    .mockImplementation(
      mockAsyncStorageInstance.clear.bind(mockAsyncStorageInstance),
    ),
})

// Default export for jest.mock usage
export default createAsyncStorageMock()

// Helper functions for test setup
export const setupMockAsyncStorage = () => {
  mockAsyncStorageInstance.resetToDefaults()
  jest.clearAllMocks()
}

export const setupFailingAsyncStorage = (error?: Error) => {
  mockAsyncStorageInstance.setFailureMode(true, error)
}

export const setupEmptyAsyncStorage = () => {
  mockAsyncStorageInstance.clear()
}

// Specific data getters for common test scenarios
export const getMockUserStats = () =>
  JSON.parse(DEFAULT_STORAGE_DATA[STORAGE_KEYS.USER_STATS])
export const getMockAchievements = () =>
  JSON.parse(DEFAULT_STORAGE_DATA[STORAGE_KEYS.ACHIEVEMENTS])
export const getMockSafeZones = () =>
  JSON.parse(DEFAULT_STORAGE_DATA[STORAGE_KEYS.SAFE_ZONES])
export const getMockTripJournal = () =>
  JSON.parse(DEFAULT_STORAGE_DATA[STORAGE_KEYS.TRIP_JOURNAL])
export const getMockSafetyContacts = () =>
  JSON.parse(DEFAULT_STORAGE_DATA[STORAGE_KEYS.SAFETY_CONTACTS])
