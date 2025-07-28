// jest.setup.js

// Stub TouchableOpacity to View globally to avoid Animated subclassing errors
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  const { View } = jest.requireActual('react-native');
  return View;
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Appearance = {
    getColorScheme: () => 'light',
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  };
  RN.Button = ({ title, onPress, ...props }) => (
    <RN.TouchableOpacity onPress={onPress} accessibilityRole="button" {...props}>
      <RN.Text>{title}</RN.Text>
    </RN.TouchableOpacity>
  );
  // Render TouchableOpacity as plain View to avoid Animated subclassing errors
  RN.TouchableOpacity = RN.View; // Consolidated mock for TouchableOpacity
  return RN;
});
// Stub CSS-Interop to prevent runtime errors
jest.mock('react-native-css-interop', () => ({}));
jest.mock('react-native/css-interop', () => ({}));
// Stub NativeWind and React JSX runtimes to support JSX transform
jest.mock('nativewind/jsx-runtime', () => {
  const React = require('react');
  return {
    jsx: (type, props, key) => React.createElement(type, props),
    jsxs: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  };
});
jest.mock('react/jsx-runtime', () => {
  const React = require('react');
  return {
    jsx: (type, props, key) => React.createElement(type, props),
    jsxs: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  };
});
// Stub dev runtime for React JSX
jest.mock('react/jsx-dev-runtime', () => {
  const React = require('react');
  return {
    jsxDEV: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  };
});
// Stub dev runtime for NativeWind JSX
jest.mock('nativewind/jsx-dev-runtime', () => {
  const React = require('react');
  return {
    jsxDEV: (type, props, key) => React.createElement(type, props),
    Fragment: React.Fragment,
  };
});

// --- Mock React Native Reanimated ---
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// --- Fix Animated Issues ---
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  createAnimatedComponent: jest.fn((component) => component),
  startOperationBatch: jest.fn(),
  finishOperationBatch: jest.fn(),
  flushQueue: jest.fn(),
  API: {},
}));

jest.mock('react-native/Libraries/Animated/AnimatedImplementation', () => ({
  View: require('react-native').View,
  Text: require('react-native').Text,
  ScrollView: require('react-native').ScrollView,
  createAnimatedComponent: jest.fn((component) => component),
}));

// ----- Mock expo-notifications -----
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  getNotificationAsync: jest.fn(() => Promise.resolve({
    title: 'Ping Alert',
    body: 'Your device is being pinged!',
  })),
}));

// ----- Polyfill fetch for Node environment -----
if (!global.fetch) {
  global.fetch = require('node-fetch');
}


// ----- Setup React Native Gesture Handler -----
import 'react-native-gesture-handler/jestSetup';

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
// Silence console warnings & errors
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
global.navigator = {
  geolocation: {
    getCurrentPosition: jest.fn((success) => success({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    })),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
};

jest.mock('react-native/Libraries/Animated/nodes/AnimatedNode', () => ({
  API: {},
}));

jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    const { children, ...otherProps } = props;
    return React.createElement('ScrollView', { ...otherProps, ref }, children);
  });
});

