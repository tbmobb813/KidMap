// Centralized color utilities for theme-related manipulations
// Provides alpha blending helper for hex colors and semantic tint helpers

// Ensure hex format #RRGGBB; returns original if malformed
export function withAlpha(hex: string, alphaHex: string): string {
    if (!hex || typeof hex !== 'string') return hex;
    const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
    if (!match) return hex;
    return `${hex}${alphaHex}`;
}

// Convenience: produce a 13% (approx) tint overlay using 0x22 alpha
export function tint(hex: string): string {
    return withAlpha(hex, '22');
}

// Future extension idea: implement lighten/darken via HSL adjustments if needed.
