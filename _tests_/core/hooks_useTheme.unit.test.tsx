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
    const useTheme = require('@/hooks/useTheme').default as () => any;

    const TestComp: React.FC = () => {
      const theme = useTheme();
      return <Text testID="theme-primary">{String(theme.colors.primary)}</Text>;
    };

    const { getByTestId } = render(<TestComp />);
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
      const mockedUseTheme = require('@/hooks/useTheme').default as () => any;

      const MockComp: React.FC = () => {
        const t = mockedUseTheme();
        return <Text testID="mocked">{t.colors.primary}</Text>;
      };

      const { getByTestId } = render(<MockComp />);
      expect(getByTestId('mocked').props.children).toBe('MOCK_PRIMARY');
    });
  });
});
