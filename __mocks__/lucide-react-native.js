const React = require('react');
const RN = require('react-native');

// Simple mock factory that returns a React component for the named icon
function createIcon(name) {
  const Icon = (props) => React.createElement(RN.Text, { testID: `icon-${name}`, ...props }, `${name}`);
  Icon.displayName = `Icon(${name})`;
  return Icon;
}

// Export the icons used across the tests and a default fallback
module.exports = {
  Eye: createIcon('Eye'),
  Volume2: createIcon('Volume2'),
  Zap: createIcon('Zap'),
  Settings: createIcon('Settings'),
  ArrowLeft: createIcon('ArrowLeft'),
  Moon: createIcon('Moon'),
  Sun: createIcon('Sun'),
  Monitor: createIcon('Monitor'),
  ArrowRight: createIcon('ArrowRight'),
  Clock: createIcon('Clock'),
  CheckCircle: createIcon('CheckCircle'),
  MapPin: createIcon('MapPin'),
  Shield: createIcon('Shield'),
  Phone: createIcon('Phone'),
  MessageCircle: createIcon('MessageCircle'),
  Camera: createIcon('Camera'),
  Users: createIcon('Users'),
  AlertTriangle: createIcon('AlertTriangle'),
  Timer: createIcon('Timer'),
  Bell: createIcon('Bell'),
  Navigation: createIcon('Navigation'),
  Compass: createIcon('Compass'),
  Cloud: createIcon('Cloud'),
  CloudRain: createIcon('CloudRain'),
  X: createIcon('X'),
  Check: createIcon('Check'),
  ChevronRight: createIcon('ChevronRight'),
  ChevronLeft: createIcon('ChevronLeft'),
  Play: createIcon('Play'),
  Pause: createIcon('Pause'),
  Heart: createIcon('Heart'),
  Star: createIcon('Star'),
  Trophy: createIcon('Trophy'),
  Award: createIcon('Award'),
  default: createIcon('DefaultIcon'),
};
