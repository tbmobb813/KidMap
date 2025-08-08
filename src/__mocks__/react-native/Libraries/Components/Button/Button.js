const React = require('react')
const { TouchableOpacity, Text } = require('react-native')

module.exports = ({ title, onPress, ...props }) => (
  <TouchableOpacity onPress={onPress} accessibilityRole="button" {...props}>
    <Text>{title}</Text>
  </TouchableOpacity>
)
