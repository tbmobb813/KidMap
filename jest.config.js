const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = {
  // Use basic React Native preset instead of jest-expo for now
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Enable verbose logging
  verbose: true,

  // Coverage settings with output to logs
  collectCoverage: true,
  coverageDirectory: './logs/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Test results and logging
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './logs/test-runs',
      outputName: `test-results-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xml`
    }],
    ['jest-html-reporters', {
      publicPath: './logs/test-runs',
      filename: `test-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.html`,
      expand: true,
      hideIcon: false,
      pageTitle: 'KidMap Test Results'
    }]
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
    '^react-native-css-interop(/.*)?$': '<rootDir>/__mocks__/react-native-css-interop.js',
    '^nativewind$': '<rootDir>/__mocks__/nativewind.js',
    '^nativewind/jsx-runtime$': '<rootDir>/__mocks__/nativewind-jsx-runtime.js',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo|@expo|lucide-react-native|@react-native-async-storage|react-clone-referenced-element|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-svg|react-native-web)',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'cjs'],
};
