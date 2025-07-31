// __tests__/config/testSetup.ts - Centralized test configuration
import 'react-native-testing-library/extend-expect'

// Global test configuration
export const TEST_CONFIG = {
  // Timeout for async operations
  ASYNC_TIMEOUT: 5000,

  // Default mock data
  DEFAULT_COORDINATES: {
    latitude: 40.7589,
    longitude: -73.9851,
  },

  // Common test IDs
  TEST_IDS: {
    LOADING_SPINNER: 'loading-spinner',
    ERROR_MESSAGE: 'error-message',
    SUCCESS_MESSAGE: 'success-message',
  },

  // Mock user data
  MOCK_USER: {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
  },
} as const

// Global Jest setup
beforeAll(() => {
  // Suppress console warnings during tests
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = jest.fn()
  console.error = jest.fn()

  // Restore after all tests
  afterAll(() => {
    console.warn = originalWarn
    console.error = originalError
  })
})

// Common mock implementations
export const COMMON_MOCKS = {
  // AsyncStorage mock factory
  createAsyncStorageMock: () => ({
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  }),

  // Navigation mock
  createNavigationMock: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
  }),

  // Alert mock
  createAlertMock: () => ({
    alert: jest.fn(),
  }),
} as const

export default TEST_CONFIG
