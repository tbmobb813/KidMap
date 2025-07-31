// __tests__/helpers/index.ts - Central export for all test helpers
// This file makes it easy to import all helpers from one place

// AsyncStorage helpers
export * from './mockAsyncStorage'

// Trip data and related mocks
export * from './mockTripData'

// Render utilities
export * from './renderWithProviders'

// Safe zone specific helpers
export * from './safeZoneTestHelpers'

// General test utilities
export * from './testUtils'

// Common test setup function
export const setupKidMapTests = () => {
  // Import all setup functions
  const { setupMockAsyncStorage } = require('./mockAsyncStorage')
  const { setupMocks } = require('./testUtils')

  // Run all setup
  setupMockAsyncStorage()
  setupMocks()
}

// Re-export commonly used testing library functions for convenience
export {
  render,
  fireEvent,
  waitFor,
  act,
  cleanup,
  screen,
} from '@testing-library/react-native'
