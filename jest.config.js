module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/scripts/jest-init-hooks.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|nativewind)/)',
  ],
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/coverage/',
    '/.expo/',
    '/next/',
    '.vscode/',
  ],
};