const baseConfig = require('./jest.config.js');

/**
 * Jest configuration for FULL test suite execution
 * Target: <15 minutes execution time
 * Scope: Complete test coverage including integration, performance, and edge cases
 * Trigger: Nightly builds, pre-release validation, manual execution
 */
module.exports = {
    ...baseConfig,
    displayName: 'Full Test Suite',

    // Complete test coverage
    testMatch: [
        '<rootDir>/_tests_/**/*.test.{js,jsx,ts,tsx}',
        '!<rootDir>/_tests_/duplicates/**', // Exclude archived duplicates
    ],

    // Maximum performance utilization
    maxWorkers: '100%', // Use all available cores
    testTimeout: 30000, // 30 second timeout for complex tests

    // Comprehensive coverage collection
    collectCoverage: true,
    collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        'services/**/*.{ts,tsx}',
        'modules/**/*.{ts,tsx}',
        'shared/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/*.test.{ts,tsx}',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/_tests_/**',
        '!**/scripts/**',
    ],

    // Comprehensive coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
        // Critical component thresholds
        './components/SafetyDashboard.tsx': {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
        },
        './components/RouteCard.tsx': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
        './hooks/useSafeZoneMonitor.ts': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
        './stores/parentalStore.ts': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },

    // Full test environment setup
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
    ],

    // Comprehensive reporting
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: './coverage/full',
            outputName: 'full-test-results.xml',
            suiteName: 'Full Test Suite',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
        }],
        ['jest-html-reporters', {
            publicPath: './coverage/full',
            filename: 'full-test-report.html',
            expand: true,
            pageTitle: 'KidMap Full Test Suite Report',
        }],
        ['@jest/reporters', {
            coverageReporter: {
                includeAllSources: true,
            },
        }],
    ],

    // Comprehensive coverage output
    coverageDirectory: '<rootDir>/coverage/full',
    coverageReporters: [
        'text',
        'text-summary',
        'lcov',
        'html',
        'json',
        'json-summary',
        'cobertura',
    ],

    // Cache configuration for full suite
    cache: true,
    cacheDirectory: '<rootDir>/node_modules/.cache/jest/full',

    // Run all tests regardless of failures
    bail: false,

    // Detailed output for full suite
    verbose: true,

    // Test result processors for comprehensive metrics
    testResultsProcessor: '<rootDir>/scripts/full-test-processor.js',

    // Performance monitoring for full suite
    testPathIgnorePatterns: [
        '/node_modules/',
        '/_tests_/duplicates/',
        '/coverage/',
    ],

    // Additional full suite configurations
    detectOpenHandles: true, // Detect async handles for cleanup
    forceExit: false, // Allow proper cleanup
    logHeapUsage: true, // Monitor memory usage

    // Test environment specific to full suite
    testEnvironmentOptions: {
        url: 'http://localhost',
    },
};