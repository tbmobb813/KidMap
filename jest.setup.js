// ─── PRE-ENV SHIMS (was in jest.env.js) ────────────────────────────────────────
// Ensure a window/navigator object exists for jest-expo/src/preset/setup.js
global.window = global.window || {};
global.navigator = global.navigator || {};

// Stub out geolocation so Object.defineProperty in jest-expo/setup.js has a real object to operate on
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
  configurable: true,
  writable: true,
});

// ─── TESTING LIBRARY EXTENSIONS & MOCKS ───────────────────────────────────────
// Testing Library extensions
require('@testing-library/jest-native/extend-expect');
require('@testing-library/jest-dom/extend-expect');

// Gesture-handler setup
require('react-native-gesture-handler/jestSetup');

// Any other global mocks you need…
global.__DEV__ = true;