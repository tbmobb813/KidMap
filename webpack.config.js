const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Customize the config before returning it.
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "crypto": false,
        "stream": false,
        "assert": false,
        "http": false,
        "https": false,
        "os": false,
        "url": false,
        "zlib": false,
    };

    // Fix import.meta issues
    config.module.rules.push({
        test: /\.m?js$/,
        resolve: {
            fullySpecified: false,
        },
    });

    return config;
};
