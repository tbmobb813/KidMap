/* global jest, global */
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage first
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() => 
        Promise.resolve({ status: 'granted' })
    ),
    getCurrentPositionAsync: jest.fn(() => 
        Promise.resolve({
            coords: {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
            },
        })
    ),
    watchPositionAsync: jest.fn(() => 
        Promise.resolve({ remove: jest.fn() })
    ),
    LocationAccuracy: {
        Highest: 'highest',
        High: 'high',
        Balanced: 'balanced',
        Low: 'low',
        Lowest: 'lowest',
    },
}));

// Global setup
global.__DEV__ = true;

// Silence react-native dev menu errors that occur in tests
const originalConsoleError = console.error;
console.error = (message, ...args) => {
    if (
        typeof message === 'string' &&
        (message.includes('TurboModuleRegistry') ||
            message.includes('DevMenu') ||
            message.includes('Invariant Violation') ||
            message.includes('could not be found'))
    ) {
        return; // Suppress these specific errors
    }
    originalConsoleError(message, ...args);
};

// React Native mock is handled by our custom mock file

jest.setTimeout(10000);
