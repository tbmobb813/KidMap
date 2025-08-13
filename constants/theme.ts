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

const ThemeContext = createContext<{ theme: ThemeDefinition; setScheme: (name: ThemeDefinition['name']) => void; } | null>(null);

export const ThemeProvider: React.FC<{ initial?: ThemeDefinition['name']; children: React.ReactNode; highContrast?: boolean; }> = ({ initial, children, highContrast }) => {
    const systemColorScheme = Appearance?.getColorScheme?.() === 'dark' ? 'dark' : 'light';
    const resolvedInitial: ThemeDefinition['name'] = highContrast ? 'highContrast' : (initial || systemColorScheme);
    const [scheme, setScheme] = useState<ThemeDefinition['name']>(resolvedInitial);

    // If highContrast flag toggles on, override.
    useEffect(() => {
        if (highContrast) setScheme('highContrast');
    }, [highContrast]);

    const value = useMemo(() => ({ theme: buildTheme(scheme), setScheme }), [scheme]);
    return React.createElement(ThemeContext.Provider, { value }, children);
};

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx.theme;
}

export function useSetTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useSetTheme must be used within ThemeProvider');
    return ctx.setScheme;
}

export type Theme = ThemeDefinition;
export const theme = buildTheme('light'); // legacy export for any code still importing
