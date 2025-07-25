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
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo|@expo|lucide-react-native|@react-native-async-storage|react-clone-referenced-element|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-svg|react-native-web)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/android/', '/ios/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'cjs'],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
