const React = require('react');
// Use real React Native module as basis
const RN = jest.requireActual('react-native');

// Override Appearance to avoid native Appearance API in tests
RN.Appearance = {
  getColorScheme: () => 'light',
  addChangeListener: jest.fn(),
  removeChangeListener: jest.fn(),
};

// Override Button globally: renders as TouchableOpacity wrapping Text
RN.Button = ({ title, onPress, ...props }) =>
  React.createElement(
    RN.TouchableOpacity,
    { onPress, accessibilityRole: 'button', ...props },
    React.createElement(RN.Text, null, title)
  );

module.exports = RN;
