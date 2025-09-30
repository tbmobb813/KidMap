// Stable accessibility labels used across components and tests.
// Export constants to avoid string drift between components and tests.
export const VOICE_A11Y_LABELS = {
  enabled: 'Voice enabled',
  disabled: 'Voice disabled',
} as const;

// Helper factories and additional stable labels used across the app/tests.
export const PLACE_A11Y = {
  forName: (name: string) => `Place ${name}`,
} as const;

export const ROUTE_A11Y = {
  optionFor: (routeLabel: string) => `Route option, duration ${routeLabel}`,
} as const;

export const TOAST_A11Y = {
  composed: (typeLabel: string, message: string) => `${typeLabel}: ${message}`,
};

export const TRAVEL_MODE_A11Y = {
  forLabel: (label: string) => `${label} travel mode`,
};

export const ERROR_BOUNDARY_A11Y = {
  retry: 'Retry after error',
};

export const ARRIVAL_ALERT_A11Y = {
  dismiss: 'Dismiss arrival alert',
};

export const ACHIEVEMENT_A11Y = {
  forTitle: (title: string) => `${title} badge`,
};

export const DIRECTION_STEP_A11Y = {
  unavailable: 'Unavailable step',
  forStep: (typeLabel: string, fromText: string, toText: string) => `${typeLabel} step from ${fromText} to ${toText}`,
};

export const ACCESSIBILITY_SETTINGS_A11Y = {
  toggleFor: (title: string) => `Toggle ${title}`,
  themeItem: (title: string, description: string, isSelected: boolean) => `${title} theme. ${description}. ${isSelected ? 'Currently selected' : 'Tap to select'}`,
};

export const LOADING_A11Y = {
  content: 'Loading content',
};

export const CATEGORY_BUTTON_A11Y = {
  forDisplayName: (displayName: string) => `${displayName} category button`,
};

export const VOICE_NAV_A11Y = {
  controlsLabel: 'Voice navigation controls',
  toggleLabel: 'Toggle voice navigation',
  activateCommands: 'Activate voice commands',
  stopListening: 'Stop listening',
  repeatCurrent: 'Repeat current step',
  // Helper factories for controls and step metadata
  controlsPrevious: (disabled: boolean) => `Voice navigation controls - previous${disabled ? ' (disabled)' : ''}`,
  controlsNext: (disabled: boolean) => `Voice navigation controls - next${disabled ? ' (disabled)' : ''}`,
  stepMeta: (index: number, total: number) => `Step ${index} of ${total}`,
  repeating: 'Repeating directions',
};

export const SAFETY_PANEL_A11Y = {
  monitoring: (isMonitoring: boolean) => (isMonitoring ? 'Stop monitoring safe zones' : 'Start monitoring safe zones'),
  header: 'Safety tools',
  emergencyCall: 'Emergency call',
  shareLocation: 'Share location',
  safeArrival: 'Safe arrival confirmation',
  photoCheckIn: 'Photo check-in',
};

// Future labels can be added here (e.g., play/pause, expand/collapse)
