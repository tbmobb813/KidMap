import React from 'react';

// Mock stores and theme controls at module load time so test-utils can register before the test body
const mockUpdate = jest.fn();
jest.doMock('@/stores/navigationStore', () => ({
  useNavigationStore: () => ({
    accessibilitySettings: { highContrast: false, darkMode: false, preferSystemTheme: false },
    updateAccessibilitySettings: mockUpdate,
  }),
}));

jest.doMock('@/constants/theme', () => ({
  useThemeControls: () => ({
    currentScheme: 'highContrast',
    setScheme: jest.fn(),
    enableHighContrast: jest.fn(),
  }),
}));

import { render } from '../testUtils';
const { useThemeIntegration } = require('@/hooks/useThemeIntegration');

describe('useThemeIntegration', () => {
  it('syncs navigation store accessibility settings when scheme is highContrast', () => {
    // Call hook from within a test component so useEffect/useState have a dispatcher
    const TestComp = () => {
      useThemeIntegration();
      return React.createElement(React.Fragment, null, 'ok');
    };

    render(React.createElement(TestComp));
    // Expect the navigation store's updateAccessibilitySettings to have been called
    expect(mockUpdate).toHaveBeenCalled();
  });
});
