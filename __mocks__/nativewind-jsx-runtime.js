const React = require('react');

module.exports = {
  jsx: (type, props, key) => React.createElement(type, props),
  jsxs: (type, props, key) => React.createElement(type, props),
  Fragment: React.Fragment,
};
