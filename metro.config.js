const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure compatibility with web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for TypeScript paths
config.resolver.alias = {
    '@': __dirname,
};

// Ensure proper module resolution
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');

module.exports = config;
