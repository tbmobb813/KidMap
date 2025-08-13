/* global jest, global */
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage first
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Global setup
global.__DEV__ = true;

// Silence react-native dev menu errors that occur in tests
const originalConsoleError = console.error;
console.error = (message, ...args) => {
    if (
        typeof message === 'string' &&
        (message.includes('TurboModuleRegistry') ||
            message.includes('DevMenu') ||
            message.includes('could not be found'))
    ) {
        return; // Suppress these specific errors
    }
    originalConsoleError(message, ...args);
};

jest.setTimeout(10000);
