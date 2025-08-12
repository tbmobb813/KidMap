/**
 * Jest configuration for Expo + React Native + TypeScript.
 */
module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    testMatch: [
        '<rootDir>/_tests_/**/*.(test|spec).(ts|tsx|js)',
        '<rootDir>/__tests__/**/*.(test|spec).(ts|tsx|js)'
    ],
    collectCoverageFrom: [
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    verbose: true,
};
