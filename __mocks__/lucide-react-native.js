const React = require('react');
const RN = require('react-native');

// Simple mock factory that returns a React component for the named icon
function createIcon(name) {
  const Icon = (props) => React.createElement(RN.Text, { testID: `icon-${name}`, ...props }, `${name}`);
  Icon.displayName = `Icon(${name})`;
  return Icon;
}

// Pre-declare a small set of commonly used icons to keep test output stable
const explicitIcons = {
  Bot: createIcon('Bot'),
  VolumeX: createIcon('VolumeX'),
  Sparkles: createIcon('Sparkles'),
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
  Globe: createIcon('Globe'),
  Shield: createIcon('Shield'),
  Phone: createIcon('Phone'),
  MessageCircle: createIcon('MessageCircle'),
  Camera: createIcon('Camera'),
  Users: createIcon('Users'),
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
  Search: createIcon('Search'),
  Home: createIcon('Home'),
  School: createIcon('School'),
  BookOpen: createIcon('BookOpen'),
  Trees: createIcon('Trees'),
  Store: createIcon('Store'),
  Utensils: createIcon('Utensils'),
  Target: createIcon('Target'),
  // Common names that were missing and caused failures
  AlertCircle: createIcon('AlertCircle'),
  AlertTriangle: createIcon('AlertTriangle'),
  Info: createIcon('Info'),
  Activity: createIcon('Activity'),
};

// Use a Proxy so any imported icon name returns a mock component.
// This prevents "Element type is invalid" errors when tests import an icon
// that wasn't explicitly added above.
const handler = {
  get(target, prop) {
    if (prop === 'default') return explicitIcons.default || createIcon('DefaultIcon');
    if (prop in explicitIcons) return explicitIcons[prop];
    return createIcon(String(prop));
  },
};

module.exports = new Proxy(explicitIcons, handler);
