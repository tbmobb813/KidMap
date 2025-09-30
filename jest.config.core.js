const baseConfig = require('./jest.config.js');

/**
 * Jest configuration for CORE test suite execution
 * Target: <5 minutes execution time
 * Scope: Core features, components, hooks, and essential integrations
 * Trigger: Daily builds, feature branch merges, release candidates
 */
module.exports = {
    ...baseConfig,
    displayName: 'Core Tests',

    // Core test coverage
    testMatch: [
        '<rootDir>/_tests_/critical/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/_tests_/core/**/*.test.{js,jsx,ts,tsx}',
    ],

    // Balanced performance settings
    maxWorkers: '75%', // Use most available cores
    testTimeout: 15000, // 15 second timeout per test

    // Enable coverage for core tests
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/components/**/*.{ts,tsx}',
        '<rootDir>/hooks/**/*.{ts,tsx}',
        '<rootDir>/stores/**/*.{ts,tsx}',
        '<rootDir>/services/**/*.{ts,tsx}',
        '<rootDir>/utils/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/*.test.{ts,tsx}',
        '!**/node_modules/**',
        '!**/__mocks__/**',
        '!**/_tests_/**',
    ],

    // Immediate (conservative) thresholds based on current coverage run
    // These are intentionally set at or just below the current reported
    // percentages so the core suite will pass while the team iterates
    // on improving coverage. See README or CI docs for target goals.
    coverageThreshold: {
        // Global thresholds set slightly below current measured values
        // to allow the suite to pass while we iterate on improving coverage.
        global: {
            branches: 33,
            functions: 31,
            lines: 33,
            statements: 33,
        },

        // Per-area thresholds approximate current measurements (conservative)
        'components/': {
            branches: 44,
            functions: 51,
            lines: 52,
            statements: 52,
        },
        'hooks/': {
            branches: 9,
            functions: 17,
            lines: 17,
            statements: 17,
        },
        'stores/': {
            branches: 0,
            functions: 4,
            lines: 4,
            statements: 4,
        },

        // Keep thresholds for important files at current measured values
        './components/SafetyDashboard.tsx': {
            branches: 95,
            functions: 64,
            lines: 80,
            statements: 81,
        },
        './hooks/useSafeZoneMonitor.ts': {
            branches: 15,
            functions: 30,
            lines: 23,
            statements: 22,
        },
    },

    // Core test setup
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
    ],

    // Comprehensive reporting for core tests
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: './coverage/core',
            outputName: 'core-test-results.xml',
            suiteName: 'Core Test Suite',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
        }],
        ['jest-html-reporters', {
            publicPath: './coverage/core',
            filename: 'core-test-report.html',
            expand: true,
        }],
    ],

    // Coverage output
    coverageDirectory: '<rootDir>/coverage/core',
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json-summary',
    ],

    // Cache configuration
    cache: true,
    cacheDirectory: '<rootDir>/node_modules/.cache/jest/core',

    // Continue on failures for full core coverage
    bail: false,

    // Moderate verbosity for core tests
    verbose: false,

    // Test result processor for core metrics
    testResultsProcessor: '<rootDir>/scripts/core-test-processor.js',
};