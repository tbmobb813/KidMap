const js = require('@eslint/js');

module.exports = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      '*.config.js',
      'android/**',
      'ios/**',
      'coverage/**',
      'logs/**',
      '__mocks__/**'
    ]
  },
  
  // Base JavaScript/TypeScript configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        navigator: 'readonly',
        // React Native globals
        __DEV__: 'readonly',
        Alert: 'readonly',
        ErrorUtils: 'readonly',
        // Node globals for config files
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        NodeJS: 'readonly',
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react': require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks')
    },
    rules: {
      // ESLint recommended rules
      ...js.configs.recommended.rules,
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'warn',
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // General rules - more lenient for development
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // Handled by TypeScript
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-constant-binary-expression': 'warn',
      'no-dupe-keys': 'error',
      'no-useless-escape': 'warn',
      'no-case-declarations': 'off', // Common in switch statements
      'no-unreachable': 'warn',
      'no-redeclare': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  
  // Test file specific configuration
  {
    files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off', // Allow console in tests for debugging
      '@typescript-eslint/no-explicit-any': 'off', // More flexible in tests
      '@typescript-eslint/no-non-null-assertion': 'off' // More flexible in tests
    }
  },
  
  // Configuration files and scripts
  {
    files: ['*.config.{js,ts}', 'jest.setup.js', 'scripts/**/*.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  
  // Utility and helper files
  {
    files: ['utils/**/*.{js,ts}', 'helpers/**/*.{js,ts}'],
    rules: {
      'no-console': 'warn', // Allow some console for utilities
      '@typescript-eslint/no-explicit-any': 'warn' // More flexible for utils
    }
  }
];
