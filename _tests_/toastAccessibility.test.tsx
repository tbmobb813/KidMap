import { render, act } from '@testing-library/react-native';
import React from 'react';

import Toast from '@/components/Toast';
import { ThemeProvider } from '@/constants/theme';

jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual.AccessibilityInfo,
    announceForAccessibility: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  };
});

jest.mock('@/utils/accessibility', () => ({ announce: jest.fn() }));

describe('Toast accessibility', () => {
  it('announces message when visible', () => {
    const { update } = render(<ThemeProvider><Toast message="Hello" type="success" visible={false} onHide={() => {}} /></ThemeProvider>);
    const { announce } = require('@/utils/accessibility');
    expect(announce).not.toHaveBeenCalled();
    act(() => {
      update(<ThemeProvider><Toast message="Hello" type="success" visible={true} onHide={() => {}} /></ThemeProvider>);
    });
    expect(announce).toHaveBeenCalledWith('Success: Hello');
  });
});
