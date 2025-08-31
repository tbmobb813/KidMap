// Utility to compute relative luminance and contrast ratio between two hex colors.
// Based on WCAG 2.1 formulas.
export function parseHex(color: string): { r: number; g: number; b: number } {
    const hex = color.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
    const int = parseInt(full, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function channel(v: number) {
    const srgb = v / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

export function luminance(color: string) {
    const { r, g, b } = parseHex(color);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg: string, bg: string) {
    const L1 = luminance(fg);
    const L2 = luminance(bg);
    const light = Math.max(L1, L2);
    const dark = Math.min(L1, L2);
    return (light + 0.05) / (dark + 0.05);
}

export function meetsAA(fg: string, bg: string, largeText = false) {
    const ratio = contrastRatio(fg, bg);
    return ratio >= (largeText ? 3 : 4.5);
}
