/**
 * React Native Mock for Jest Testing
 * Bypasses Flow parsing issues by providing complete mock implementation
 */

/* global jest */

const React = require('react');

// Mock component that renders a simple div
const MockComponent = (props) => {
  return React.createElement('div', props, props.children);
};

// Mock Text component
const MockText = (props) => {
  return React.createElement('span', props, props.children);
};

// Mock Image component
const MockImage = (props) => {
  return React.createElement('img', {
    ...props,
    src: props.source?.uri || props.source,
  });
};

// Mock Animated Value
const createMockAnimatedValue = (initialValue = 0) => ({
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  addListener: jest.fn(() => 'mock-listener-id'),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
  _startNativeLoop: jest.fn(),
  _stopNativeLoop: jest.fn(),
  _value: initialValue,
});

const createMockAnimatedValueXY = (initialValue = { x: 0, y: 0 }) => ({
  x: createMockAnimatedValue(initialValue.x),
  y: createMockAnimatedValue(initialValue.y),
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
});

// Mock animation functions
const createMockAnimation = () => ({
  start: jest.fn((callback) => callback && callback({ finished: true })),
  stop: jest.fn(),
  reset: jest.fn(),
});

module.exports = {
  // Basic components
  View: MockComponent,
  Text: MockText,
  Image: MockImage,
  ScrollView: MockComponent,
  FlatList: MockComponent,
  SectionList: MockComponent,
  VirtualizedList: MockComponent,
  
  // Input components
  TextInput: MockComponent,
  Switch: MockComponent,
  Slider: MockComponent,
  
  // Touchable components
  TouchableOpacity: MockComponent,
  TouchableHighlight: MockComponent,
  TouchableWithoutFeedback: MockComponent,
  Pressable: MockComponent,
  
  // Layout components
  SafeAreaView: MockComponent,
  KeyboardAvoidingView: MockComponent,
  
  // Navigation components
  StatusBar: MockComponent,
  
  // Modal and overlay components
  Modal: MockComponent,
  
  // Progress components
  ActivityIndicator: MockComponent,
  ProgressBarAndroid: MockComponent,
  
  // Platform and device info
  Platform: {
    OS: 'ios',
    Version: 14,
    isPad: false,
    isTV: false,
    select: jest.fn((specifics) => specifics.ios || specifics.default),
  },
  
  Dimensions: {
    get: jest.fn(() => ({
      width: 375,
      height: 667,
      scale: 2,
      fontScale: 1,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // StyleSheet
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    compose: jest.fn((style1, style2) => [style1, style2]),
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    absoluteFill: 0,
    hairlineWidth: 1,
  },
  
  // Animated API
  Animated: {
    View: MockComponent,
    Text: MockText,
    Image: MockImage,
    ScrollView: MockComponent,
    FlatList: MockComponent,
    SectionList: MockComponent,
    
    Value: jest.fn(createMockAnimatedValue),
    ValueXY: jest.fn(createMockAnimatedValueXY),
    
    // Animation functions
    timing: jest.fn(() => createMockAnimation()),
    spring: jest.fn(() => createMockAnimation()),
    decay: jest.fn(() => createMockAnimation()),
    
    // Composition functions
    sequence: jest.fn(() => createMockAnimation()),
    parallel: jest.fn(() => createMockAnimation()),
    stagger: jest.fn(() => createMockAnimation()),
    delay: jest.fn(() => createMockAnimation()),
    loop: jest.fn(() => createMockAnimation()),
    
    // Events
    event: jest.fn(() => jest.fn()),
    
    // Transform functions
    add: jest.fn(),
    subtract: jest.fn(),
    multiply: jest.fn(),
    divide: jest.fn(),
    modulo: jest.fn(),
    diffClamp: jest.fn(),
    
    // Interpolation
    interpolate: jest.fn(),
    
    // Component creation
    createAnimatedComponent: jest.fn((component) => component),
    
    // Native driver
    isNativeDriverSupported: true,
  },
  
  // Native APIs
  Alert: {
    alert: jest.fn((title, message, buttons, _options) => {
      if (buttons && buttons.length > 0) {
        // Simulate pressing the first button
        const firstButton = buttons[0];
        if (firstButton.onPress) {
          firstButton.onPress();
        }
      }
    }),
    prompt: jest.fn((title, message, callbackOrButtons, type, defaultValue, _keyboardType) => {
      if (typeof callbackOrButtons === 'function') {
        callbackOrButtons(defaultValue || '');
      } else if (Array.isArray(callbackOrButtons) && callbackOrButtons.length > 0) {
        const firstButton = callbackOrButtons[0];
        if (firstButton.onPress) {
          firstButton.onPress(defaultValue || '');
        }
      }
    }),
  },
  
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
  
  Clipboard: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(() => Promise.resolve()),
  },
  
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openSettings: jest.fn(() => Promise.resolve()),
    sendIntent: jest.fn(() => Promise.resolve()),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },
  
  // Appearance and Accessibility
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
  
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  },
  
  // Layout and Keyboard
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    dismiss: jest.fn(),
  },
  
  // Pan Responder (needed for react-native-svg)
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
  
  // Utilities
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => size),
  },
  
  // Native Modules
  NativeModules: {},
  
  // TurboModules (causing the Flow parsing error)
  TurboModuleRegistry: {
    get: jest.fn(() => null),
    getEnforcing: jest.fn(() => ({})),
  },
  
  // DevSettings
  DevSettings: {
    addMenuItem: jest.fn(),
    reload: jest.fn(),
  },
  
  // Touchable (needed for react-native-svg)
  Touchable: {
    Mixin: {
      touchableGetInitialState: jest.fn(() => ({})),
      touchableHandleActivePressIn: jest.fn(),
      touchableHandleActivePressOut: jest.fn(),
      touchableHandlePress: jest.fn(),
      touchableGetPressRectOffset: jest.fn(),
      touchableHandleLongPress: jest.fn(),
      touchableDelayTimeout: null,
    },
    TOUCH_TARGET_DEBUG: false,
    renderDebugView: jest.fn(),
  },
  
  // Transforms
  processColor: jest.fn((color) => color),
  
  // Constants
  __DEV__: true,
};
