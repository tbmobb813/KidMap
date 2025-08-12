import colors, { ThemeColors } from '../constants/colors';

export const theme = {
    colors,
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    radius: {
        sm: 4,
        md: 8,
        lg: 12,
    },
    elevation: {
        sm: 2,
        md: 4,
        lg: 8,
    },
    // Add more tokens as needed
} as const;

export type Theme = typeof theme;
