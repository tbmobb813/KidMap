import { withAlpha, tint } from '@/utils/color/color';
import { parseHex, luminance, contrastRatio, meetsAA } from '@/utils/color/contrast';
import {
  validateLocation,
  calculateDistance,
  verifyLocationProximity,
  formatDistance,
  getLocationAccuracyDescription,
} from '@/utils/location/locationUtils';

describe('color utilities', () => {
  it('withAlpha returns original for malformed input', () => {
    expect(withAlpha('not-a-hex', '22')).toBe('not-a-hex');
  });

  it('withAlpha appends alpha when valid', () => {
    expect(withAlpha('#112233', 'aa')).toBe('#112233aa');
    expect(tint('#aabbcc')).toBe('#aabbcc22');
  });

  it('parseHex and luminance produce expected values', () => {
    const p = parseHex('#ffffff');
    expect(p).toEqual({ r: 255, g: 255, b: 255 });
    expect(luminance('#ffffff')).toBeGreaterThan(luminance('#000000'));
  });

  it('contrastRatio and meetsAA behave correctly', () => {
    const ratio = contrastRatio('#000000', '#ffffff');
    expect(ratio).toBeGreaterThan(20);
    expect(meetsAA('#000000', '#ffffff')).toBe(true);
    // low contrast
    expect(meetsAA('#888888', '#777777')).toBe(false);
  });
});

describe('location utilities', () => {
  it('validateLocation rejects invalid values and warns near zero', () => {
    const r1 = validateLocation({ latitude: NaN as any, longitude: 0 as any });
    expect(r1.isValid).toBe(false);
    const r2 = validateLocation({ latitude: 0, longitude: 0 });
    expect(r2.isValid).toBe(true);
    expect(r2.warnings.length).toBeGreaterThan(0);
  });

  it('calculateDistance returns reasonable distances', () => {
    // distance between two nearby points (~111km per degree lat)
    const d = calculateDistance(0, 0, 1, 0);
    expect(Math.round(d)).toBeGreaterThan(110000);
  });

  it('verifyLocationProximity reports within radius correctly', () => {
    const targetLat = 37.7749;
    const targetLon = -122.4194;
    // same point
    const r = verifyLocationProximity(targetLat, targetLon, targetLat, targetLon, 10);
    expect(r.isWithinRadius).toBe(true);
    expect(r.distance).toBe(0);
  });

  it('formatDistance and accuracy descriptions', () => {
    expect(formatDistance(50)).toBe('50m');
    expect(formatDistance(1500)).toMatch(/1.5km/);
    expect(getLocationAccuracyDescription(10)).toBe('Very close');
    expect(getLocationAccuracyDescription(300)).toBe('In the area');
  });
});
