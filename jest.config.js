module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native-css-interop(/.*)?$': '<rootDir>/__mocks__/react-native-css-interop.js',
    '^nativewind$': '<rootDir>/__mocks__/nativewind.js',
    '^nativewind/jsx-runtime$': '<rootDir>/__mocks__/nativewind-jsx-runtime.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
    '^../Utilities/Platform$': [
      '<rootDir>/node_modules/react-native/Libraries/Utilities/Platform.android.js',
      '<rootDir>/node_modules/react-native/Libraries/Utilities/Platform.ios.js',
    ],
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }], 
        '@babel/preset-react', 
        '@babel/preset-typescript'
      ] 
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@testing-library/react-native|react-native-safe-area-context)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverage: false,
  verbose: true,
  bail: false,
  passWithNoTests: true,
  resolver: '<rootDir>/jest.debug.resolver.js',
};
