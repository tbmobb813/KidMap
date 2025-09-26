// __mocks__/react.js
const actualReact = jest.requireActual('react');

module.exports = {
  ...actualReact,
  useState: actualReact.useState,
  useEffect: actualReact.useEffect,
  useRef: actualReact.useRef,
  useCallback: actualReact.useCallback,
};
