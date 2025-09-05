import js from '@eslint/js';
import react from 'eslint-plugin-react';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 
      react,
      '@typescript-eslint': typescript
    },
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        globalThis: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Notification: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        // Browser Web APIs
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        MediaRecorder: 'readonly',
        MediaStream: 'readonly',
        BlobPart: 'readonly',
        BlobEvent: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        // React Native globals
        __DEV__: 'readonly',
        ErrorUtils: 'readonly',
        // Node.js globals
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        // TypeScript globals
        RequestInit: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        console: 'readonly',
        global: 'readonly',
      },
    },
  },
  {
    files: ['**/__mocks__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/_tests_/**/*.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
];