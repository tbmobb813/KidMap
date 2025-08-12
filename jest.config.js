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
        '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@/core/(.*)$': '<rootDir>/src/core/$1',
        '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
        '^@/hooks-internal/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
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
    coverageThreshold: {
        global: {
            lines: 0.8 * 100, // 80%
            statements: 0.8 * 100,
            branches: 0.7 * 100,
            functions: 0.75 * 100,
        }
    },
    verbose: true,
};
