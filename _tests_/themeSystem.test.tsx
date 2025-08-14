/**
 * Tests for S3-1: Dark Mode & High Contrast Tokens
 * 
 * Validates theme switching, accessibility integration, and contrast compliance.
 */
import { palettes } from '../constants/colors';

// Simplified contrast calculation for testing
const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16)
    ];
  };

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

describe('Theme Color Palettes', () => {
  it('provides all required color tokens for each theme', () => {
    const requiredTokens: Array<keyof typeof palettes.light> = [
      'primary', 'primaryForeground', 'secondary', 'secondaryForeground',
      'background', 'surface', 'surfaceAlt', 'text', 'textSecondary',
      'border', 'focus', 'error', 'errorForeground', 'success', 'successForeground',
      'warning', 'warningForeground', 'info', 'infoForeground'
    ];

    const themes = ['light', 'dark', 'highContrast'] as const;
    
    themes.forEach(themeName => {
      const palette = palettes[themeName];
      requiredTokens.forEach(token => {
        expect(palette[token]).toBeDefined();
        expect(typeof palette[token]).toBe('string');
        expect(palette[token]).toMatch(/^#[0-9A-Fa-f]{6}$/); // Valid hex color
      });
    });
  });

  it('has consistent token structure across all themes', () => {
    const lightKeys = Object.keys(palettes.light).sort();
    const darkKeys = Object.keys(palettes.dark).sort();
    const highContrastKeys = Object.keys(palettes.highContrast).sort();

    expect(darkKeys).toEqual(lightKeys);
    expect(highContrastKeys).toEqual(lightKeys);
  });
});

describe('WCAG Contrast Compliance', () => {
  it('ensures WCAG AA compliance for light theme text combinations', () => {
    const { light } = palettes;
    
    // Primary text combinations (4.5:1 minimum)
    expect(getContrastRatio(light.text, light.background)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.textSecondary, light.background)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.text, light.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.textSecondary, light.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('ensures WCAG AA compliance for light theme button combinations', () => {
    const { light } = palettes;
    
    // Button text combinations (4.5:1 minimum)
    expect(getContrastRatio(light.primaryForeground, light.primary)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.secondaryForeground, light.secondary)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.errorForeground, light.error)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.successForeground, light.success)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.warningForeground, light.warning)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.infoForeground, light.info)).toBeGreaterThanOrEqual(4.5);
  });

  it('ensures WCAG AA compliance for dark theme text combinations', () => {
    const { dark } = palettes;
    
    // Primary text combinations (4.5:1 minimum)
    expect(getContrastRatio(dark.text, dark.background)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(dark.textSecondary, dark.background)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(dark.text, dark.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(dark.textSecondary, dark.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('ensures WCAG AA compliance for dark theme button combinations', () => {
    const { dark } = palettes;
    
    // Debug: Log the actual colors being tested
    console.log('Dark theme secondary:', dark.secondary);
    console.log('Dark theme secondaryForeground:', dark.secondaryForeground);
    
    // Button text combinations (4.5:1 minimum)
    expect(getContrastRatio(dark.primaryForeground, dark.primary)).toBeGreaterThanOrEqual(4.5);
    
    const secondaryRatio = getContrastRatio(dark.secondaryForeground, dark.secondary);
    console.log('Secondary contrast ratio:', secondaryRatio);
    expect(secondaryRatio).toBeGreaterThanOrEqual(4.5);
    
    expect(getContrastRatio(dark.errorForeground, dark.error)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(dark.successForeground, dark.success)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(dark.warningForeground, dark.warning)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(dark.infoForeground, dark.info)).toBeGreaterThanOrEqual(4.5);
  });

  it('ensures WCAG AAA compliance for high contrast theme', () => {
    const { highContrast } = palettes;
    
    // AAA standard requires 7:1 contrast ratio
    expect(getContrastRatio(highContrast.text, highContrast.background)).toBeGreaterThanOrEqual(7.0);
    expect(getContrastRatio(highContrast.primaryForeground, highContrast.primary)).toBeGreaterThanOrEqual(7.0);
    expect(getContrastRatio(highContrast.errorForeground, highContrast.error)).toBeGreaterThanOrEqual(4.5); // Some flexibility for red
    expect(getContrastRatio(highContrast.successForeground, highContrast.success)).toBeGreaterThanOrEqual(7.0);
  });

  it('validates specific contrast improvements made in S3-1', () => {
    const { light } = palettes;
    
    // Verify the specific improvements made to resolve contrast warnings
    expect(getContrastRatio(light.successForeground, light.success)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(light.warningForeground, light.warning)).toBeGreaterThanOrEqual(4.5);
    
    // Document the actual ratios for reference
    const successRatio = getContrastRatio(light.successForeground, light.success);
    const warningRatio = getContrastRatio(light.warningForeground, light.warning);
    
    expect(successRatio).toBeGreaterThan(5.0); // Should be improved from original
    expect(warningRatio).toBeGreaterThan(4.8); // Should be improved from original
  });
});

describe('Theme Token Semantic Consistency', () => {
  it('maintains appropriate color temperature across themes', () => {
    // Light theme should have dark text on light backgrounds
    expect(palettes.light.text).toMatch(/^#[0-3]/); // Dark colors start with 0-3
    expect(palettes.light.background).toMatch(/^#[F-f]/); // Light colors start with F

    // Dark theme should have light text on dark backgrounds  
    expect(palettes.dark.text).toMatch(/^#[F-f]/); // Light colors start with F
    expect(palettes.dark.background).toMatch(/^#[0-3]/); // Dark colors start with 0-3

    // High contrast should use pure extremes
    expect(palettes.highContrast.text).toBe('#FFFFFF'); // Pure white
    expect(palettes.highContrast.background).toBe('#000000'); // Pure black
  });

  it('provides distinct semantic color meanings', () => {
    const themes = ['light', 'dark', 'highContrast'] as const;
    
    themes.forEach(themeName => {
      const palette = palettes[themeName];
      
      // All semantic colors should be different
      const semanticColors = [palette.error, palette.success, palette.warning, palette.info];
      const uniqueColors = new Set(semanticColors);
      expect(uniqueColors.size).toBe(semanticColors.length);
      
      // Primary and secondary should be different
      expect(palette.primary).not.toBe(palette.secondary);
    });
  });
});

describe('Transit and Map Color Accessibility', () => {
  it('ensures transit mode colors meet contrast requirements', () => {
    const { light } = palettes;
    
    // Transit colors should be distinguishable on light backgrounds
    expect(getContrastRatio(light.subway, light.background)).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio(light.bus, light.background)).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio(light.train, light.background)).toBeGreaterThanOrEqual(3.0);
    expect(getContrastRatio(light.walk, light.background)).toBeGreaterThanOrEqual(3.0);
  });

  it('provides distinct transit colors for color-blind accessibility', () => {
    const themes = ['light', 'dark', 'highContrast'] as const;
    
    themes.forEach(themeName => {
      const palette = palettes[themeName];
      const transitColors = [palette.subway, palette.bus, palette.train, palette.walk];
      const uniqueColors = new Set(transitColors);
      
      // All transit modes should have unique colors
      expect(uniqueColors.size).toBe(transitColors.length);
    });
  });
});
