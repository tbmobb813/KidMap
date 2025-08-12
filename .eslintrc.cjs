module.exports = {
    root: true,
    env: { es2022: true, node: true },
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', project: undefined },
    plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'import'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react-native/all'
    ],
    settings: { react: { version: 'detect' } },
    ignorePatterns: ['dist', 'web-build', 'node_modules', '.expo', 'coverage'],
    rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'import/order': ['warn', { 'newlines-between': 'always', 'alphabetize': { order: 'asc', caseInsensitive: true } }]
    }
};
