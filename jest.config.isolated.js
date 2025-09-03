/**
 * ALTERNATIVE JEST CONFIGURATION - MORE ISOLATED APPROACH
 * 
 * This configuration provides better isolation from React Native Flow files
 * and uses more comprehensive mocking strategies.
 */
/* eslint-env node */
module.exports = {
    preset: 'react-native',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    
    // More aggressive Flow file exclusion
    modulePathIgnorePatterns: [
        '.*\\.flow$',
        'node_modules/react-native/Libraries/.*\\.flow$',
        'node_modules/react-native/.*\\.flow$'
    ],
    
    // Enhanced module name mapping for better isolation
    moduleNameMapper: {
        // React Native - use our comprehensive mock
        '^react-native$': '<rootDir>/__mocks__/react-native.js',
        '^react-native/(.*)$': '<rootDir>/__mocks__/react-native.js',
        
        // React Native Libraries - mock individually 
        '^react-native/Libraries/(.*)$': '<rootDir>/__mocks__/react-native-library.js',
        
        // Lucide icons - comprehensive mock
        '^lucide-react-native$': '<rootDir>/__mocks__/lucide-react-native.js',
        
        // Application path mappings
        '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
        '^@/core/(.*)$': '<rootDir>/src/core/$1',
        '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
        '^@/hooks-internal/(.*)$': '<rootDir>/src/hooks/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/telemetry/(.*)$': '<rootDir>/src/telemetry/$1',
        '^@/telemetry$': '<rootDir>/src/telemetry/index.ts',
        '^@/constants/(.*)$': '<rootDir>/constants/$1',
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/(.*)$': '<rootDir>/$1'
    },
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    setupFiles: ['<rootDir>/jest.setup.isolated.js'], // Additional isolation setup
    
    // Test file patterns
    testMatch: [
        '<rootDir>/_tests_/**/*.(test|spec).(ts|tsx|js)',
        '<rootDir>/__tests__/**/*.(test|spec).(ts|tsx|js)'
    ],
    
    // Coverage configuration
    collectCoverageFrom: [
        'components/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'stores/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/*.stories.*',
        '!**/*.test.*'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'json'],
    coverageThreshold: {
        global: {
            lines: 80,
            statements: 80,
            branches: 70,
            functions: 75,
        }
    },
    
    // Transform configuration - use existing Babel config
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    
    // More comprehensive ignore patterns
    transformIgnorePatterns: [
        // Keep required modules but exclude Flow files
        'node_modules/(?!(react-native(?!/.*\\.flow$)|@react-native(?!/.*\\.flow$)|@react-navigation|@react-native-async-storage|expo(nent)?|expo-modules-core|expo-location|expo-image-picker|expo-image|lucide-react-native|@expo|@unimodules|@nkzw/create-context-hook)/)',
        
        // Explicitly exclude all Flow files
        'node_modules/.*\\.flow$',
        'node_modules/react-native/Libraries/.*\\.flow$',
        'node_modules/react-native/.*\\.flow$',
        'node_modules/.*/.*\\.flow$'
    ],
    
    // Global configurations
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    verbose: true,
    
    // Error handling
    errorOnDeprecated: false,
    
    // Performance settings
    maxWorkers: '50%',
    
    // Additional Jest options for stability
    testTimeout: 10000,
    resetMocks: true,
    clearMocks: true,
    restoreMocks: true,
};
