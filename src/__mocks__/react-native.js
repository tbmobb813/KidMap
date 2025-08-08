const React = require('react')
const RN = jest.requireActual('react-native') // RN is now run through Babel

// override just the bits you care about:
RN.Appearance = { getColorScheme: ()=>'light', addChangeListener:jest.fn(), removeChangeListener:jest.fn() }
RN.Button = ({title,onPress,...p})=> React.createElement(RN.TouchableOpacity,{onPress,accessibilityRole:'button',...p},React.createElement(RN.Text,null,title))

module.exports = RN
