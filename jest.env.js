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