import { parseHex, luminance, contrastRatio, meetsAA } from '@/utils/color/contrast';

describe('color contrast utilities', () => {
  it('parses 3- and 6-digit hex colors correctly', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('123')).toBeDefined();
  });

  it('calculates luminance and contrast ratios', () => {
    const lumWhite = luminance('#ffffff');
    const lumBlack = luminance('#000000');
    expect(lumWhite).toBeGreaterThan(lumBlack);

    const ratio = contrastRatio('#ffffff', '#000000');
    // White vs black should be the maximum contrast (around 21)
    expect(ratio).toBeGreaterThan(20);
    expect(meetsAA('#ffffff', '#000000')).toBe(true);
    // low contrast example
    expect(meetsAA('#777777', '#888888')).toBe(false);
  });
});
