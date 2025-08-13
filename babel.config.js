module.exports = function (api) {
    api.cache(true);
    /* eslint-env node */
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-reanimated/plugin',
        ],
    };
};
