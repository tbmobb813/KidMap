export const lightColors = {
  primary: "#4A80F0",
  primaryForeground: '#FFFFFF',
  secondary: "#67D295",
  secondaryForeground: '#06260F',
  background: "#FFFFFF",
  surface: "#F8F9FA",
  surfaceAlt: '#EFF1F3',
  text: "#222222",
  textSecondary: "#555555",
  border: "#E0E0E0",
  error: "#D93025",
  errorForeground: '#FFFFFF',
  success: "#1E8E3E",
  successForeground: '#FFFFFF',
  warning: "#B56200",
  warningForeground: '#FFFFFF',
  info: '#1A56B3',
  infoForeground: '#FFFFFF',
  focus: '#1A73E8',
  // Transit
  subway: "#FF9500",
  bus: "#4285F4",
  train: "#34A853",
  walk: "#9C27B0",
  // Map
  mapWater: "#A5D7F7",
  mapPark: "#B8E39B",
  mapRoad: "#FFFFFF",
  mapBuilding: "#E6E6E6",
  // Misc
  overlay: 'rgba(0,0,0,0.5)'
} as const;

export const darkColors = {
  ...lightColors,
  background: '#0D1117',
  surface: '#161B22',
  surfaceAlt: '#1F242B',
  text: '#F1F5F9',
  textSecondary: '#A0A6AE',
  border: '#2D333B',
  primary: '#5391FF',
  secondary: '#55C686',
  focus: '#3182F6',
  error: '#F85149',
  success: '#34D058',
  warning: '#E3B341',
  info: '#3693F3',
  mapRoad: '#2D333B',
  mapBuilding: '#3A424B',
  overlay: 'rgba(255,255,255,0.4)'
} as const;

export const highContrastColors = {
  ...lightColors,
  background: '#000000',
  surface: '#111111',
  surfaceAlt: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#E0E0E0',
  border: '#FFFFFF',
  primary: '#FFFF00',
  primaryForeground: '#000000',
  secondary: '#00FFFF',
  secondaryForeground: '#000000',
  focus: '#FF00FF',
  error: '#FF5555',
  success: '#33FF66',
  warning: '#FFA500',
  info: '#00A2FF'
} as const;

// Permit any string values for palette keys, not locked to light palette literal types
export type Palette = { [K in keyof typeof lightColors]: string };

export const palettes: Record<'light' | 'dark' | 'highContrast', Palette> = {
  light: lightColors as Palette,
  dark: darkColors as Palette,
  highContrast: highContrastColors as Palette,
};

// Backward compatibility shim: many components still reference legacy semantic keys
// like Colors.card, Colors.textLight, Colors.background, etc. We expose a proxy object
// that maps old keys to the nearest palette equivalents, preserving existing imports
// while allowing incremental migration to theme context usage.
type LegacyKeys = {
  card: string;
  textLight: string; // maps to textSecondary
  white: string; // maps to primaryForeground or '#FFFFFF'
  primaryLight: string; // lighten(primary) approximation
  secondaryLight: string; // lighten(secondary) approximation
  androidRipple: string; // semi-transparent ripple color
  background: string;
  text: string;
  border: string;
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  success: string;
};

// Determine current scheme (temporary simplistic approach; can be wired to ThemeProvider later)
const activeScheme: keyof typeof palettes = 'light';
const base = palettes[activeScheme];

const legacy: LegacyKeys & Palette = new Proxy(base as any, {
  get(target, prop: string) {
    if (prop === 'card') return target.surface;
    if (prop === 'textLight') return target.textSecondary;
    if (prop === 'white') return '#FFFFFF';
    if (prop === 'primaryLight') {
      // naive lighten: blend with white
      const c = target.primary.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      const lr = Math.min(255, Math.round(r + (255 - r) * 0.25));
      const lg = Math.min(255, Math.round(g + (255 - g) * 0.25));
      const lb = Math.min(255, Math.round(b + (255 - b) * 0.25));
      return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
    }
    if (prop === 'secondaryLight') {
      const c = target.secondary.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      const lr = Math.min(255, Math.round(r + (255 - r) * 0.25));
      const lg = Math.min(255, Math.round(g + (255 - g) * 0.25));
      const lb = Math.min(255, Math.round(b + (255 - b) * 0.25));
      return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
    }
    if (prop === 'androidRipple') return 'rgba(0,0,0,0.12)';
    return target[prop];
  }
});

export default legacy;
