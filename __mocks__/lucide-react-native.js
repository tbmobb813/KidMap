/**
 * Mock for lucide-react-native icons to prevent import issues
 */
/* global jest */

const React = require('react');

// Create a mock icon component that displays the icon name and props
const createMockIcon = (iconName) => {
  return jest.fn((props = {}) => {
    const { size = 24, color = '#000000', testID, ...otherProps } = props;
    
    return React.createElement('span', {
      'data-testid': testID || `${iconName.toLowerCase()}-icon`,
      'data-icon': iconName,
      'data-size': size,
      'data-color': color,
      ...otherProps,
    }, `${iconName}(${size},${color})`);
  });
};

// Export commonly used icons in SmartNotification and other components
module.exports = {
  // Time and reminder icons
  Clock: createMockIcon('Clock'),
  Timer: createMockIcon('Timer'),
  Bell: createMockIcon('Bell'),
  
  // Location icons
  MapPin: createMockIcon('MapPin'),
  Navigation: createMockIcon('Navigation'),
  Compass: createMockIcon('Compass'),
  
  // Weather icons
  Cloud: createMockIcon('Cloud'),
  CloudRain: createMockIcon('CloudRain'),
  Sun: createMockIcon('Sun'),
  
  // UI icons
  X: createMockIcon('X'),
  Check: createMockIcon('Check'),
  ChevronRight: createMockIcon('ChevronRight'),
  ChevronLeft: createMockIcon('ChevronLeft'),
  
  // Action icons
  Play: createMockIcon('Play'),
  Pause: createMockIcon('Pause'),
  Settings: createMockIcon('Settings'),
  
  // Safety and alert icons
  AlertTriangle: createMockIcon('AlertTriangle'),
  Shield: createMockIcon('Shield'),
  Heart: createMockIcon('Heart'),
  
  // Achievement icons
  Star: createMockIcon('Star'),
  Trophy: createMockIcon('Trophy'),
  Award: createMockIcon('Award'),
  
  // Default export for any other icons
  default: createMockIcon('DefaultIcon'),
};
