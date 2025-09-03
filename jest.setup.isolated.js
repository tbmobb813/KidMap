/**
 * ISOLATED JEST SETUP
 * 
 * Additional setup for more isolated testing environment
 */
/* global jest, global, setTimeout */

// Polyfill global objects that might be missing in test environment
global.globalThis = global.globalThis || global;

// Define __DEV__ early and consistently
global.__DEV__ = true;
global.globalThis.__DEV__ = true;

// Mock problematic React Native core modules before they're imported
jest.mock('react-native/Libraries/Utilities/warnOnce', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('react-native/Libraries/Components/Touchable/Touchable', () => ({
  __esModule: true,
  default: {},
  Touchable: {},
}));

// Mock React Native Libraries that might have Flow issues
const reactNativeLibraryMock = {
  __esModule: true,
  default: {},
};

jest.mock('react-native/Libraries/ReactNative/RootTag', () => reactNativeLibraryMock);
jest.mock('react-native/Libraries/StyleSheet/EdgeInsetsPropType', () => reactNativeLibraryMock);
jest.mock('react-native/Libraries/Components/View/ViewPropTypes', () => reactNativeLibraryMock);

// Comprehensive console suppression for cleaner test output
const originalConsole = { ...console };
const suppressedMessages = [
  'TurboModuleRegistry',
  'DevMenu',
  'Invariant Violation',
  'could not be found',
  'ProgressBarAndroid has been extracted',
  'Clipboard has been extracted',
  'PushNotificationIOS has been extracted',
  'Flow',
  'Expected ";" but found',
  'Expected "from" but found',
  'import type',
  'Unexpected',
];

console.error = (message, ...args) => {
  const messageStr = String(message);
  if (!suppressedMessages.some(suppressed => messageStr.includes(suppressed))) {
    originalConsole.error(message, ...args);
  }
};

console.warn = (message, ...args) => {
  const messageStr = String(message);
  if (!suppressedMessages.some(suppressed => messageStr.includes(suppressed))) {
    originalConsole.warn(message, ...args);
  }
};

// Set up test environment globals
global.fetch = jest.fn();
global.alert = jest.fn();
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock Expo modules comprehensively
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {},
    manifest: {},
  },
}));

jest.mock('expo-font', () => ({
  __esModule: true,
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

// Error handling for unhandled promises in tests
process.on('unhandledRejection', (reason, promise) => {
  // Only log if it's not a suppressed message type
  const reasonStr = String(reason);
  if (!suppressedMessages.some(suppressed => reasonStr.includes(suppressed))) {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
});
