/* eslint-env jest */
// __mocks__/react.js
const actualReact = require('react');

module.exports = {
  ...actualReact,
  useState: actualReact.useState,
  useEffect: actualReact.useEffect,
  useRef: actualReact.useRef,
  useCallback: actualReact.useCallback,
};
