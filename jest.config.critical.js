const baseConfig = require('./jest.config.js');

/**
 * Jest configuration for CRITICAL test suite execution
 * Target: <30 seconds execution time
 * Scope: Essential safety, security, and core functionality tests
 * Trigger: Every commit, PR creation, pre-merge
 */
module.exports = {
    ...baseConfig,
    displayName: 'Critical Tests',

    // Optimize for speed - critical tests only
    testMatch: [
        '<rootDir>/_tests_/critical/**/*.test.{js,jsx,ts,tsx}',
    ],

    // Performance optimizations for critical tests
    maxWorkers: '50%', // Use half available cores for speed
    testTimeout: 10000, // 10 second timeout per test

    // Minimal coverage for speed
    collectCoverage: false,

    // Fast test environment setup
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
    ],

    // Optimize module resolution
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // Critical test reporter - minimal output for CI speed
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: './coverage/critical',
            outputName: 'critical-test-results.xml',
            suiteName: 'Critical Test Suite',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
        }],
    ],

    // Cache configuration for speed
    cache: true,
    cacheDirectory: '<rootDir>/node_modules/.cache/jest/critical',

    // Fail fast on critical test failures
    bail: 1, // Stop on first failure

    // Verbose output for critical failures
    verbose: true,

    // Test result processor for critical metrics
    testResultsProcessor: '<rootDir>/scripts/critical-test-processor.js',
};