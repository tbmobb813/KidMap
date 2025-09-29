import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

afterEach(() => {
  // Ensure module cache is clean when tests mock modules
  jest.resetModules();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('hooks/useTheme (minimal mock)', () => {
  it('returns an object with expected color keys', () => {
    // Import the module directly (it's a simple default-export function)
    // eslint-disable-next-line import/no-unresolved
    const useTheme = require('@/hooks/useTheme').default as () => any;
    const theme = useTheme();
    expect(theme).toBeTruthy();
    expect(theme).toHaveProperty('colors');
    expect(theme.colors).toHaveProperty('primary');
    expect(theme.colors).toHaveProperty('background');
    expect(theme.colors).toHaveProperty('text');
  });

  it('can be used inside a component render', () => {
    // Require inside test so any per-test mocks are applied correctly
    // eslint-disable-next-line import/no-unresolved
    const useTheme = require('@/hooks/useTheme').default as () => any;

    const TestComp: React.FC = () => {
      const theme = useTheme();
      // Use createElement so this file can remain a .ts file (no JSX parsing required)
      return React.createElement(Text, { testID: 'theme-primary' }, theme.colors.primary);
    };

    const { getByTestId } = render(React.createElement(TestComp));
    expect(getByTestId('theme-primary').props.children).toBeTruthy();
  });

  it('is mockable per-test using jest.doMock / isolateModules', () => {
    jest.isolateModules(() => {
      // Provide a custom implementation for this test only
      jest.doMock('@/hooks/useTheme', () => ({
        __esModule: true,
        default: () => ({
          colors: { primary: 'MOCK_PRIMARY', background: 'MOCK_BG', text: 'MOCK_TEXT' },
        }),
      }));

      // Now require and render a small component that reads the mocked hook
      // eslint-disable-next-line import/no-unresolved
      const mockedUseTheme = require('@/hooks/useTheme').default as () => any;

      const MockComp: React.FC = () => {
        const t = mockedUseTheme();
        return React.createElement(Text, { testID: 'mocked' }, t.colors.primary);
      };

      const { getByTestId } = render(React.createElement(MockComp));
      expect(getByTestId('mocked').props.children).toBe('MOCK_PRIMARY');
    });
  });
});
