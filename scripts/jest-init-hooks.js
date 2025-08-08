// scripts/jest-init-hooks.js

// If you need fetch mocks:
require('jest-fetch-mock').enableMocks();

// Reanimated test setup:
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
global.__reanimatedWorkletInit = jest.fn();

// (Add other harmless runtime test inits here — no Babel configs)
