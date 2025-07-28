# Testing & Mocks

This project uses Jest for unit and integration testing. To ensure consistent test results and avoid issues with native modules, we use a global manual mock for React Native components in `__mocks__/react-native.js`.

## Global Button Mock

- The React Native `Button` is globally mocked in `__mocks__/react-native.js`.
- The mock renders a `TouchableOpacity` with a `Text` child, allowing tests to find buttons by their title text.
- No local Button mocks are needed in individual test files.

**Example mock implementation:**

```js
Button: ({ title, onPress, ...props }) => (
  <TouchableOpacity onPress={onPress} {...props}>
    <Text>{title}</Text>
  </TouchableOpacity>
),
```

## Appearance Mock

- The `Appearance` API is also mocked to default to the 'light' color scheme.

## Usage

- All tests automatically use these mocks; no additional setup is required in test files.
- If you encounter issues with native modules, check the global mock and avoid duplicating mocks locally.

## Troubleshooting

- If a test fails to find a button, ensure you are searching for the button's title text.
- For more details, see `__mocks__/react-native.js`.

---

For more information on testing setup, see the [Jest documentation](https://jestjs.io/docs/manual-mocks) and the project's README.
