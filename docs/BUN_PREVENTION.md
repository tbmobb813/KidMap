# Bun Prevention Measures for KidMap

This document outlines the measures implemented to ensure Bun is never used for testing in the KidMap project.

## Problem Context

During Phase 3 ComponentTestTemplate development, we encountered issues where Bun was being used as the test runner instead of Jest. Bun has parsing issues with React Native's Flow type syntax, causing test failures like:

```
[Bun] failed to parse _tests_/components/WeatherCard.test.tsx
```

## Prevention Measures Implemented

### 1. Package.json Script Updates

All test scripts now use `npx jest` to explicitly force Jest execution:

- `test`: `npx jest`
- `test:ci`: `npx jest --ci --coverage...`
- `test:critical`: `npx jest --config=jest.config.critical.js`
- etc.

### 2. Environment Variables (.env)

Added environment variables to force Jest usage:

```bash
NODE_OPTIONS="--require jest"
JEST_WORKER_ID=1
FORCE_JEST=1
```

### 3. VS Code Settings (.vscode/settings.json)

Configured VS Code to use Jest as the default test runner:

```json
{
  "jest.jestCommandLine": "npx jest",
  "jest.runner": "jest",
  "test.defaultRunnerForLanguage": {
    "typescript": "jest",
    "javascript": "jest"
  },
  "npm.packageManager": "npm"
}
```

### 4. npm Configuration (.npmrc)

Force npm as the package manager:

```
package-manager=npm
engine-strict=true
```

### 5. Jest Configuration

Ensured jest.config.js includes all test directories:

```javascript
testMatch: [
  '<rootDir>/_tests_/components/**/*.(test|spec).(ts|tsx|js)'
  // ... other patterns
]
```

## Verification

To verify these measures work:

1. Run any test script: `npm test`
2. Check that Jest is used (not Bun) in terminal output
3. Verify React Native Flow syntax is parsed correctly

## Why This Matters

- **Reliability**: Jest properly handles React Native mock syntax
- **Consistency**: All developers use the same test runner
- **CI/CD**: Prevents environment-dependent test failures
- **Flow Type Support**: Jest correctly parses React Native Flow types

## Future Maintenance

When adding new test scripts:

1. Always use `npx jest` instead of bare `jest`
2. Test locally to ensure Jest is used
3. Update this document if new prevention measures are needed
