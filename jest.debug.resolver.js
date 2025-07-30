const path = require('path');

module.exports = (request, options) => {
  console.log('Resolving:', request);
  if (request === '../Utilities/Platform') {
    const platform = process.env.PLATFORM || 'ios'; // Default to iOS
    const resolvedPath = path.join(
      options.basedir,
      `node_modules/react-native/Libraries/Utilities/Platform.${platform}.js`
    );
    console.log('Resolved Path:', resolvedPath);
    return resolvedPath;
  }

  return options.defaultResolver(request, options);
};
