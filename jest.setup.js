// jest.setup.js

// Import the testing library
import '@testing-library/jest-native/extend-expect'

// Define global variables
global.__DEV__ = true

// Basic React Native platform mocks
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
}))

// Stub CSS-Interop to prevent runtime errors
jest.mock('react-native-css-interop', () => ({}))
// Stub NativeWind and React JSX runtimes to support JSX transform
jest.mock('nativewind/jsx-runtime', () => {
  const React = require('react')
  return {
    jsx: (type, props, key) => React.createElement(type, props),
    jsxs: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  }
})
jest.mock('react/jsx-runtime', () => {
  const React = require('react')
  return {
    jsx: (type, props, key) => React.createElement(type, props),
    jsxs: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  }
})
// Stub dev runtime for React JSX
jest.mock('react/jsx-dev-runtime', () => {
  const React = require('react')
  return {
    jsxDEV: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  }
})
// Stub dev runtime for NativeWind JSX
jest.mock('nativewind/jsx-dev-runtime', () => {
  const React = require('react')
  return {
    jsxDEV: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  }
})

// --- Mock React Native Reanimated ---
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// --- Fix Animated Issues ---
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  createAnimatedComponent: jest.fn((component) => component),
  startOperationBatch: jest.fn(),
  finishOperationBatch: jest.fn(),
  flushQueue: jest.fn(),
  API: {},
}))

jest.mock('react-native/Libraries/Animated/AnimatedImplementation', () => ({
  View: require('react-native').View,
  Text: require('react-native').Text,
  ScrollView: require('react-native').ScrollView,
  createAnimatedComponent: jest.fn((component) => component),
}))

// ----- Mock expo-notifications -----
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  getNotificationAsync: jest.fn(() =>
    Promise.resolve({
      title: 'Ping Alert',
      body: 'Your device is being pinged!',
    }),
  ),
}))

// ----- Polyfill fetch for Node environment -----
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

// ----- Setup React Native Gesture Handler -----
import 'react-native-gesture-handler/jestSetup'

// ----- Mock @expo/vector-icons -----
jest.mock('@expo/vector-icons', () => new Proxy({}, { get: (_, key) => key }))

// ----- Mock lucide-react-native -----
jest.mock('lucide-react-native', () => new Proxy({}, { get: (_, key) => key }))

// ----- Mock Expo Modules -----
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'KidMap',
      slug: 'kidmap',
    },
  },
}))

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' }),
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
        accuracy: 5,
        altitude: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    }),
  ),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }) => children,
}))

// ----- Mock Async Storage -----
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}))

// ----- Silence console warnings & errors -----
// Silence console warnings & errors
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
global.navigator = {
  geolocation: {
    getCurrentPosition: jest.fn((success) =>
      success({
        coords: { latitude: 37.7749, longitude: -122.4194 },
      }),
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
}

jest.mock('react-native/Libraries/Animated/nodes/AnimatedNode', () => ({
  API: {},
}))

jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const React = require('react')
  return React.forwardRef((props, ref) => {
    const { children, ...otherProps } = props
    return React.createElement('ScrollView', { ...otherProps, ref }, children)
  })
})

if (typeof navigator === 'undefined') {
  global.navigator = {}
}

// Mock API functions for testing
jest.mock('@/utils/api', () => ({
  fetchRoute: jest.fn(async (from, to, mode) => {
    // Return mock route data based on mode
    const baseStep = {
      startLocation: from,
      endLocation: [from[0] + 0.001, from[1] + 0.001],
      distance: 100,
      duration: 120,
      instruction: 'Walk to destination',
    }

    const steps = [
      baseStep,
      {
        ...baseStep,
        line: mode === 'transit' ? 'Bus 42' : undefined,
      },
      baseStep,
    ]

    return {
      steps,
      totalDistance: 300,
      totalDuration: 360,
      mode,
      overview_polyline: 'encoded_polyline_string',
      bounds: {
        northeast: { lat: 1.001, lng: 1.001 },
        southwest: { lat: 0, lng: 0 },
      },
    }
  }),
  searchPlaces: jest.fn(async () => []),
}))

// Import testLogger from testHelpers
const { testLogger } = require('./__tests__/utils/testHelpers')

// Make testLogger available globally
global.testLogger = testLogger

// Enhanced test lifecycle logging with data focus
let testStartTime

beforeEach(() => {
  testStartTime = Date.now()
  const testName = expect.getState().currentTestName || 'Unknown test'
  // Log test start with context
  testLogger.info(`� TEST_START: "${testName}"`)
})

afterEach(() => {
  const testName = expect.getState().currentTestName || 'Unknown test'
  const duration = Date.now() - testStartTime

  // Check if test passed or failed based on Jest state
  const testState = expect.getState()
  const passed =
    !testState.currentTestName ||
    testState.assertionCalls === testState.expectedAssertionsNumber

  testLogger.logTestResult(testName, passed ? 'PASS' : 'FAIL', duration)
})

// Enhanced error logging for failed tests with detailed context
const originalIt = global.it
global.it = (name, fn, timeout) => {
  return originalIt(
    name,
    async (...args) => {
      const startTime = Date.now()
      try {
        const result = await fn(...args)
        const duration = Date.now() - startTime
        testLogger.logTestResult(name, 'PASS', duration, {
          type: 'individual_test',
          args: args.length,
        })
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        testLogger.logTestFailure(name, error, {
          type: 'individual_test',
          duration,
          args,
        })
        throw error
      }
    },
    timeout,
  )
}
