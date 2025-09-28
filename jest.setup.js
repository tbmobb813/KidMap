/* global jest, global, beforeEach */
import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage first
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock stores
jest.mock('./stores/navigationStore', () => {
    const mockState = {
        accessibilitySettings: {
            largeText: false,
            highContrast: false,
            voiceEnabled: false,
            voiceDescriptions: false,
            simplifiedMode: false,
        },
        photoCheckIns: [],
        favorites: [],
        recentSearches: [],
        addPhotoCheckIn: jest.fn(),
        updateAccessibilitySettings: jest.fn(),
        addToFavorites: jest.fn(),
        removeFromFavorites: jest.fn(),
        clearRecentSearches: jest.fn(),
        addRecentSearch: jest.fn(),
    };

    return {
        useNavigationStore: jest.fn(() => mockState),
    };
});

// Provide a flexible, context-backed mock for the parental store used across safety tests.
jest.mock('./stores/parentalStore', () => {
    const React = require('react');

    // Context to support components that read values from the provider directly.
    const StoreContext = React.createContext(null);

    // A mutable mock function tests can update at runtime via require(...) and assignment.
    const __mockUseParentalStore = jest.fn(() => ({
        settings: {
            emergencyContacts: [{ id: 'p1', phone: '9876543210', isPrimary: true }],
        },
        dashboardData: {
            safeZoneActivity: [],
            checkInRequests: [],
        },
        checkInRequests: [],
        safeZones: [],
        devicePings: [],
        addCheckInToDashboard: jest.fn(),
        updateLastKnownLocation: jest.fn(),
        addDevicePing: jest.fn(),
        clearDevicePing: jest.fn(),
    }));

    // Hook used by code under test. Prefer the context value when available so that
    // components that consume the provider directly receive the same data.
    function useParentalStore() {
        try {
            const ctx = React.useContext(StoreContext);
            if (ctx != null) return ctx;
        } catch {
            // If hooks aren't usable (non-React environment), fall back to the mock.
        }
        return __mockUseParentalStore();
    }

    // Provider component that pushes the current mocked store value into context.
    // Tests can pass a `value` prop to force a per-render value, otherwise the
    // provider uses the current return of `__mockUseParentalStore()`.
    function ParentalProvider({ children, value }) {
        const provided = value === undefined ? __mockUseParentalStore() : value;
        return React.createElement(StoreContext.Provider, { value: provided }, children);
    }

    return {
        __mockUseParentalStore,
        useParentalStore,
        ParentalProvider,
    };
});

// The parental store mock above already provides `ParentalProvider` and
// `__mockUseParentalStore`. No additional runtime assignment required.


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

// Shared telemetry mock (available to all tests via global.__mockTrack)
try {
    const mockTrack = jest.fn();
    // Mock the telemetry module so tests can assert calls
    jest.mock('@/telemetry', () => ({
        track: (...args) => mockTrack(...args),
    }));
    global.__mockTrack = mockTrack;
} catch {
    // ignore in environments where jest isn't available
    /* no-op */
}

// Shared Animated mocks so individual tests don't need to re-create them.
try {
    const { Animated } = require('react-native');
    const mockAnimatedValue = {
        setValue: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        reset: jest.fn(),
    };

    const mockAnimation = {
            start: jest.fn((callback) => {
                if (callback) global.setTimeout(() => callback({ finished: true }), 10);
            }),
    };

    Animated.Value = jest.fn(() => mockAnimatedValue);
    Animated.loop = jest.fn(() => mockAnimation);
    Animated.sequence = jest.fn(() => mockAnimation);
    Animated.timing = jest.fn(() => mockAnimation);
} catch {
    // ignore when react-native isn't available in a non-test environment
    /* no-op */
}

// Ensure testing-library label query helpers exist when destructured.
// Avoid requiring/testing-library when no DOM is present (react-test-renderer runs)
// because importing it registers afterEach hooks that can interfere with
// fake timers and hook timeouts in node-only test environments.
if (typeof globalThis.document !== 'undefined' && globalThis.document && globalThis.document.querySelectorAll) {
    try {
        const rtl = require('@testing-library/react-native');
        if (!rtl.queryAllByLabelText) {
            rtl.queryAllByLabelText = (label) => {
                const nodes = Array.from(globalThis.document.querySelectorAll(`[aria-label]`));
                const matches = nodes.filter((n) => {
                    const al = n.getAttribute('aria-label');
                    if (!al) return false;
                    if (label instanceof RegExp) return label.test(al);
                    return al === String(label);
                });
                return matches;
            };
        }

        if (!rtl.getByLabelText) {
            rtl.getByLabelText = (label) => {
                const matches = rtl.queryAllByLabelText(label);
                if (!matches || matches.length === 0) {
                    throw new Error(`Unable to find element with accessibilityLabel: ${label}`);
                }
                return matches[0];
            };
        }
    } catch {
        // If require fails, ignore — this code path only runs when a DOM is available.
    }
}

// A default global fetch mock. Tests should call (global.fetch as jest.Mock).mockResolvedValueOnce(..)
// to provide per-test responses. This default ensures components that call fetch on mount don't
// cause uncaught network errors during tests.
try {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ completion: 'Test content' }),
        })
    );
} catch {
    /* no-op */
}

// Ensure standard timer functions exist. Some test suites or mocks may replace or
// remove globals (including setTimeout) which breaks helpers in testing-library
// that reference the global timer functions. Restore them from Node's timers
// implementation when missing or not a function.
try {
    const timers = require('timers');
    if (typeof global.setTimeout !== 'function') global.setTimeout = timers.setTimeout;
    if (typeof global.clearTimeout !== 'function') global.clearTimeout = timers.clearTimeout;
    if (typeof global.setInterval !== 'function') global.setInterval = timers.setInterval;
    if (typeof global.clearInterval !== 'function') global.clearInterval = timers.clearInterval;
    if (typeof global.setImmediate !== 'function' && typeof timers.setImmediate === 'function') global.setImmediate = timers.setImmediate;
    if (typeof global.clearImmediate !== 'function' && typeof timers.clearImmediate === 'function') global.clearImmediate = timers.clearImmediate;
} catch {
    // If timers can't be required in some environment, don't block tests — most
    // environments will already have timer globals present.
}

// Some tests call `jest.useFakeTimers()` or reassign globals and (incorrectly)
// leave the environment in a state where timer functions are missing or not
// functions. That breaks helpers in @testing-library/react-native which call
// `global.setTimeout` directly. To be defensive we restore the Node timers
// implementation before each test so every test starts with working timer
// functions.
beforeEach(() => {
    try {
        const timers = require('timers');
        if (typeof global.setTimeout !== 'function') global.setTimeout = timers.setTimeout;
        if (typeof global.clearTimeout !== 'function') global.clearTimeout = timers.clearTimeout;
        if (typeof global.setInterval !== 'function') global.setInterval = timers.setInterval;
        if (typeof global.clearInterval !== 'function') global.clearInterval = timers.clearInterval;
        if (typeof global.setImmediate !== 'function' && typeof timers.setImmediate === 'function') global.setImmediate = timers.setImmediate;
        if (typeof global.clearImmediate !== 'function' && typeof timers.clearImmediate === 'function') global.clearImmediate = timers.clearImmediate;
    } catch {
        // Ignore failures restoring timers in exotic environments
    }
});
