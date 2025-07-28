# KidMap Project Onboarding

Welcome to KidMap! This guide will help you get started with development, testing, and contributing.

## Getting Started

- Clone the repository and install dependencies with `npm install` or `yarn install`.
- Run the app locally using Expo (`npx expo start`).

## Testing

- All tests use Jest and React Native Testing Library.
- **Global mocks** for Button and Appearance are set in `__mocks__/react-native.js`.
- Do not add local Button mocks to test files; use the global mock only.
- See `docs/TESTING_AND_MOCKS.md` for details.

## Key Features

- Kid-friendly UI and navigation
- Parental controls and safe zones
- Real-time transit tracking
- Gamification and educational content

## Contribution

- Follow the roadmap in `ROADMAP.md` for feature priorities.
- See `FEATURES.md` for current and planned features.
- Review `DEPENDENCY_AUDIT.md` for third-party libraries and security notes.

## Troubleshooting

- If you encounter test failures related to Button or Appearance, check the global mock setup.
- For help, see the documentation in the `docs/` folder or reach out to the maintainer.

---

Happy coding!
