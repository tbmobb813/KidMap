/* eslint-env node */
// Flat ESLint configuration (final) adapted from previous .eslintrc.cjs
// Using FlatCompat to reuse plugin recommended sets.

const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
    js.configs.recommended,
    ...compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
    ),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        ignores: ['dist', 'web-build', 'node_modules', '.expo', 'coverage'],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
            globals: {
                // Common Node globals used across config / scripts
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                process: 'readonly',
                console: 'readonly'
            }
        },
        linterOptions: { reportUnusedDisableDirectives: true },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            react: require('eslint-plugin-react'),
            'react-hooks': require('eslint-plugin-react-hooks'),
            import: require('eslint-plugin-import')
        },
        settings: { react: { version: 'detect' } },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
            // Keep minimal debt rules active; heavy RN-specific rules removed for now.
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-empty': ['warn', { allowEmptyCatch: true }]
        }
    },
    // Node-centric script overrides
    {
        files: ['scripts/**/*.{js,ts}', '*.config.{js,ts}', '*config.js', 'metro.config.js', 'babel.config.js', 'jest.config.js'],
        languageOptions: { sourceType: 'script' },
        rules: {
            'import/no-commonjs': 'off'
        }
    },
    // (Trimmed) Scripts/config override no longer needed since rule is off globally.
    {
        files: ['**/*.test.ts'],
        rules: {
            'no-restricted-syntax': [
                'error',
                { selector: 'Program:has(JSXElement)', message: 'JSX detected in .test.ts file; rename to .test.tsx' }
            ]
        }
    },
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'no-restricted-properties': [
                'warn',
                { object: 'Colors', property: 'card', message: 'Legacy color key card: migrate to theme.colors.surface or useTheme().' },
                { object: 'Colors', property: 'textLight', message: 'Use theme.colors.textSecondary instead of textLight.' },
                { object: 'Colors', property: 'primaryLight', message: 'Introduce semantic token or derive shade; avoid primaryLight.' },
                { object: 'Colors', property: 'secondaryLight', message: 'Introduce semantic token or derive shade; avoid secondaryLight.' },
                { object: 'Colors', property: 'androidRipple', message: 'Use Platform.select ripple logic; avoid androidRipple.' },
                { object: 'Colors', property: 'white', message: 'Use semantic foreground token or explicit #FFF.' }
            ]
        }
    },
    // (Trimmed) Removed previous RN overrides and tightening blocks for sprint focus.
];
