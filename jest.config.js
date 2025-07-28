module.exports = {
  preset: 'react-native',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  setupFiles: [
    '<rootDir>/jest.globals.js',
    '<rootDir>/jest.setup.js',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // Ignore transforming most node_modules except React Native core and our mocks
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo|@expo|lucide-react-native|@react-native-async-storage|react-clone-referenced-element|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-svg|react-native-web)',
    // Exclude CSS-Interop and NativeWind
  ],
  moduleNameMapper: {
    // Path aliases
    '^@/(.*)$': '<rootDir>/$1',
    // Static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
    // Redirect CSS Interop and NativeWind to React Native or React
    // Stub out CSS Interop and NativeWind to avoid runtime errors
    // Stub out all CSS-Interop and NativeWind code
    // Stub CSS-Interop packages (some imports use react-native/css-interop as path)
    '^react-native-css-interop(/.*)?$': '<rootDir>/__mocks__/react-native-css-interop.js',
    '^react-native/css-interop(/.*)?$': '<rootDir>/__mocks__/react-native-css-interop.js',
    // Map nativewind package imports
    '^nativewind$': '<rootDir>/__mocks__/nativewind.js',
    // Map nativewind jsx-runtime to custom stub for JSX transform
    '^nativewind/jsx-runtime$': '<rootDir>/__mocks__/nativewind-jsx-runtime.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/android/',
    '/ios/',
    // Ignore SafeZoneManager tests
    'SafeZoneManager\\.test\\.tsx$'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'cjs'],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
