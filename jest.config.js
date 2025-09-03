/**
 * Jest configuration for Expo + React Native + TypeScript.
 */
/* eslint-env node */
module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    modulePathIgnorePatterns: ['.*\\.flow$'],
    moduleNameMapper: {
        '^react-native$': '<rootDir>/__mocks__/react-native.js',
        '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@/core/(.*)$': '<rootDir>/src/core/$1',
        '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
        '^@/hooks-internal/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/telemetry/(.*)$': '<rootDir>/src/telemetry/$1',
        '^@/telemetry$': '<rootDir>/src/telemetry/index.ts',
        '^@/(.*)$': '<rootDir>/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
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
            lines: 80,
            statements: 80,
            branches: 70,
            functions: 75,
        }
    },
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|expo(nent)?|expo-modules-core|expo-location|expo-image-picker|expo-image|lucide-react-native|@expo|@unimodules|@nkzw/create-context-hook)/)',
        'node_modules/react-native/.*\\.flow$'
    ],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    verbose: true,
};
