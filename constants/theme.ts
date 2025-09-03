import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

import { palettes, Palette } from './colors';

export interface ThemeDefinition {
    name: 'light' | 'dark' | 'highContrast';
    colors: Palette;
    spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
    radius: { sm: number; md: number; lg: number };
    elevation: { sm: number; md: number; lg: number };
}

function buildTheme(name: ThemeDefinition['name']): ThemeDefinition {
    return {
        name,
        colors: palettes[name] as Palette,
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        radius: { sm: 4, md: 8, lg: 12 },
        elevation: { sm: 2, md: 4, lg: 8 },
    };
}

export interface ThemeContextType {
    theme: ThemeDefinition;
    setScheme: (name: ThemeDefinition['name']) => void;
    toggleDarkMode: () => void;
    enableHighContrast: (enabled: boolean) => void;
    currentScheme: ThemeDefinition['name'];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export interface ThemeProviderProps {
    children: React.ReactNode;
    // Integration with accessibility settings
    accessibilitySettings?: {
        darkMode?: boolean;
        highContrast?: boolean;
        preferSystemTheme?: boolean;
    };
    // Manual overrides
    initial?: ThemeDefinition['name'];
    highContrast?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    accessibilitySettings,
    initial,
    highContrast
}) => {
    // Determine initial theme based on settings hierarchy
    const getInitialScheme = (): ThemeDefinition['name'] => {
        // 1. High contrast override (manual or from settings)
        if (highContrast || accessibilitySettings?.highContrast) {
            return 'highContrast';
        }

        // 2. Manual initial override
        if (initial) {
            return initial;
        }

        // 3. Accessibility settings (if not preferSystemTheme)
        if (accessibilitySettings && !accessibilitySettings.preferSystemTheme) {
            return accessibilitySettings.darkMode ? 'dark' : 'light';
        }

        // 4. System preference (default)
        const systemColorScheme = Appearance?.getColorScheme?.() === 'dark' ? 'dark' : 'light';
        return systemColorScheme;
    };

    const [scheme, setScheme] = useState<ThemeDefinition['name']>(getInitialScheme);

    // React to accessibility settings changes
    useEffect(() => {
        if (!accessibilitySettings) return;

        if (accessibilitySettings.highContrast) {
            setScheme('highContrast');
        } else if (accessibilitySettings.preferSystemTheme) {
            const systemScheme = Appearance?.getColorScheme?.() === 'dark' ? 'dark' : 'light';
            setScheme(systemScheme);
        } else {
            setScheme(accessibilitySettings.darkMode ? 'dark' : 'light');
        }
    }, [accessibilitySettings]);

    // Listen to system theme changes when preferSystemTheme is true
    useEffect(() => {
        if (!accessibilitySettings?.preferSystemTheme || accessibilitySettings.highContrast) {
            return;
        }

        const subscription = Appearance?.addChangeListener?.(({ colorScheme }) => {
            setScheme(colorScheme === 'dark' ? 'dark' : 'light');
        });

        return () => subscription?.remove?.();
    }, [accessibilitySettings?.preferSystemTheme, accessibilitySettings?.highContrast]);

    // Manual theme control functions
    const toggleDarkMode = useMemo(() => () => {
        if (scheme === 'highContrast') return; // Don't toggle in high contrast mode
        setScheme(current => current === 'dark' ? 'light' : 'dark');
    }, [scheme]);

    const enableHighContrast = useMemo(() => (enabled: boolean) => {
        if (enabled) {
            setScheme('highContrast');
        } else {
            // Return to appropriate light/dark mode
            const systemScheme = Appearance?.getColorScheme?.() === 'dark' ? 'dark' : 'light';
            setScheme(accessibilitySettings?.darkMode ? 'dark' : systemScheme);
        }
    }, [accessibilitySettings?.darkMode]);

    const value: ThemeContextType = useMemo(() => ({
        theme: buildTheme(scheme),
        setScheme,
        toggleDarkMode,
        enableHighContrast,
        currentScheme: scheme
    }), [scheme, toggleDarkMode, enableHighContrast]);

    return React.createElement(ThemeContext.Provider, { value }, children);
};

export function useTheme(): ThemeDefinition {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx.theme;
}

export function useThemeControls(): Omit<ThemeContextType, 'theme'> {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useThemeControls must be used within ThemeProvider');
    return {
        setScheme: ctx.setScheme,
        toggleDarkMode: ctx.toggleDarkMode,
        enableHighContrast: ctx.enableHighContrast,
        currentScheme: ctx.currentScheme
    };
}

export function useSetTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useSetTheme must be used within ThemeProvider');
    return ctx.setScheme;
}

export type Theme = ThemeDefinition;
/**
 * @deprecated The legacy `theme` export always returns the light theme and is not dynamic.
 * Use `getTheme()` or the `useTheme()` hook instead for dynamic theming.
 */
export const theme = buildTheme('light');

// Removed getTheme because React hooks cannot be called outside of components or custom hooks.
