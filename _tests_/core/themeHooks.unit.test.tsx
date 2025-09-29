import { renderHook, act } from '@testing-library/react-native';
import React from 'react';

import { ThemeProvider, useTheme, useThemeControls } from '@/constants/theme';

describe('Theme hooks', () => {
  it('useTheme throws when outside provider', () => {
     
    expect(() => (useTheme as any)()).toThrow();
  });

  it('provides theme and controls inside provider', () => {
    const wrapper = ({ children }: any) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => ({ theme: useTheme(), controls: useThemeControls() }), { wrapper });
    expect(result.current.theme).toBeDefined();
    expect(typeof result.current.controls.toggleDarkMode).toBe('function');
    act(() => result.current.controls.toggleDarkMode());
    expect(result.current.controls.currentScheme).toMatch(/light|dark|highContrast/);
  });
});
