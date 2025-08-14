import { useEffect } from 'react';

import { useThemeControls } from '@/constants/theme';
import { useNavigationStore } from '@/stores/navigationStore';

/**
 * Integration hook that connects theme system with accessibility settings store.
 * 
 * This hook ensures the ThemeProvider stays in sync with accessibility settings
 * and provides a unified way to manage theme preferences across the app.
 */
export function useThemeIntegration() {
    const { accessibilitySettings, updateAccessibilitySettings } = useNavigationStore();
    const { currentScheme, setScheme, enableHighContrast } = useThemeControls();

    // Sync theme changes back to the store when manually changed
    useEffect(() => {
        if (currentScheme === 'highContrast' && !accessibilitySettings.highContrast) {
            updateAccessibilitySettings({ highContrast: true });
        } else if (currentScheme !== 'highContrast' && accessibilitySettings.highContrast) {
            updateAccessibilitySettings({ highContrast: false });
        }

        if (currentScheme === 'dark' && !accessibilitySettings.darkMode && !accessibilitySettings.preferSystemTheme) {
            updateAccessibilitySettings({ darkMode: true, preferSystemTheme: false });
        } else if (currentScheme === 'light' && accessibilitySettings.darkMode && !accessibilitySettings.preferSystemTheme) {
            updateAccessibilitySettings({ darkMode: false, preferSystemTheme: false });
        }
    }, [currentScheme, accessibilitySettings, updateAccessibilitySettings]);

    return {
        // Theme controls
        currentScheme,
        setScheme,
        enableHighContrast,

        // Convenience methods
        enableDarkMode: () => {
            updateAccessibilitySettings({ darkMode: true, preferSystemTheme: false, highContrast: false });
        },
        enableLightMode: () => {
            updateAccessibilitySettings({ darkMode: false, preferSystemTheme: false, highContrast: false });
        },
        enableSystemTheme: () => {
            updateAccessibilitySettings({ preferSystemTheme: true, highContrast: false });
        },
        enableHighContrastMode: () => {
            updateAccessibilitySettings({ highContrast: true });
        },

        // Current settings
        isDarkMode: accessibilitySettings.darkMode,
        isHighContrast: accessibilitySettings.highContrast,
        isSystemTheme: accessibilitySettings.preferSystemTheme,
    };
}

/**
 * Helper to get the appropriate theme provider props from navigation store.
 * Use this in your app root to connect the theme system to accessibility settings.
 */
export function useThemeProviderProps() {
    const { accessibilitySettings } = useNavigationStore();

    return {
        accessibilitySettings: {
            darkMode: accessibilitySettings.darkMode,
            highContrast: accessibilitySettings.highContrast,
            preferSystemTheme: accessibilitySettings.preferSystemTheme,
        },
    };
}
