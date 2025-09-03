/**
 * Mock for React Native Library components that might have Flow issues
 */
/* global jest */

const React = require('react');

// Generic mock component
const MockComponent = (props) => {
  return React.createElement('div', props, props.children);
};

module.exports = {
  // Export a generic mock for any React Native library
  ...MockComponent,
  default: MockComponent,
  
  // Common library exports
  Touchable: {
    Mixin: {
      touchableGetInitialState: jest.fn(() => ({})),
      touchableHandleActivePressIn: jest.fn(),
      touchableHandleActivePressOut: jest.fn(),
      touchableHandlePress: jest.fn(),
      touchableGetPressRectOffset: jest.fn(),
      touchableHandleLongPress: jest.fn(),
      touchableDelayTimeout: null,
    },
  },
  
  EdgeInsetsPropType: jest.fn(),
  ViewPropTypes: {
    style: jest.fn(),
  },
  
  RootTag: 1,
};
