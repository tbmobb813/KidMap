## Onboarding: Testing & Mocks

- All React Native tests use a global manual mock for the Button and Appearance APIs, located in `__mocks__/react-native.js`.
- Do **not** add local Button mocks to test files; use the global mock only.
- To find buttons in tests, use their title text (e.g., `getByText('Add Safe Zone')`).
- If you encounter native module errors, check the global mock for conflicts.
- For details, see `docs/TESTING_AND_MOCKS.md`.
