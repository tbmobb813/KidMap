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
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        'services/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/*.test.{ts,tsx}',
        '!**/node_modules/**',
    ],

    // Coverage thresholds for core functionality
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
        // Higher thresholds for critical areas
        './components/SafetyDashboard.tsx': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
        './hooks/useSafeZoneMonitor.ts': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
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