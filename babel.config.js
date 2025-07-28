module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], '@babel/preset-typescript'],
    plugins: [
      ['@babel/plugin-transform-private-methods', { loose: true }],
      'react-native-reanimated/plugin',
      ['module:react-native-dotenv', {
        "moduleName": "@env",
        "path": ".env",
        "blocklist": null,
        "allowlist": null,
        "safe": false,
        "allowUndefined": true,
        "verbose": false
      }],
    ],
  };
};
