// jest.setup.js

// ----- Mock React Native Core -----
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return Object.setPrototypeOf(
    {
      Platform: { OS: 'web', select: (objs) => objs.web },
      Linking: {
        openURL: jest.fn(() => Promise.resolve()),
        canOpenURL: jest.fn(() => Promise.resolve(true)),
        getInitialURL: jest.fn(() => Promise.resolve(null)),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    },
    RN
  );
});

// ----- Polyfill fetch for Node environment -----
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// ----- Setup React Native Gesture Handler -----
import 'react-native-gesture-handler/jestSetup';

// ----- Mock react-native-reanimated -----
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence warnings: `useNativeDriver` is not supported in Jest environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => {});

// ----- Mock @expo/vector-icons -----
jest.mock('@expo/vector-icons', () => new Proxy({}, { get: (_, key) => key }));

// ----- Mock lucide-react-native -----
jest.mock('lucide-react-native', () => new Proxy({}, { get: (_, key) => key }));

// ----- Mock Expo Modules -----
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'KidMap',
      slug: 'kidmap',
    },
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 37.78825, longitude: -122.4324, accuracy: 5, altitude: 0, heading: 0, speed: 0 },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  Link: ({ children }) => children,
}));

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
}));

// ----- Silence console warnings & errors -----
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
