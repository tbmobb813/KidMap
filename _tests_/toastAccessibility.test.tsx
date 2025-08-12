import React from 'react';
import { render, act } from '@testing-library/react-native';
import Toast from '@/components/Toast';

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
    const { update } = render(<Toast message="Hello" type="success" visible={false} onHide={() => {}} />);
    const { announce } = require('@/utils/accessibility');
    expect(announce).not.toHaveBeenCalled();
    act(() => {
      update(<Toast message="Hello" type="success" visible={true} onHide={() => {}} />);
    });
    expect(announce).toHaveBeenCalledWith('Success: Hello');
  });
});
