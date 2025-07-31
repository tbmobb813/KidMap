const path = require('path')

module.exports = (request, options) => {
  if (request === '../Utilities/Platform') {
    const platform = process.env.PLATFORM || 'ios' // Default to iOS
    return path.join(
      options.basedir,
      `node_modules/react-native/Libraries/Utilities/Platform.${platform}.js`,
    )
  }

  return options.defaultResolver(request, options)
}
