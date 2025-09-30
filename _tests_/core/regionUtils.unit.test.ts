import { formatCurrency, formatDistance, formatTemperature, getLocalizedTime, validateRegionConfig, generateRegionFromTemplate } from '@/utils/location/regionUtils';

describe('regionUtils', () => {
  test('formatCurrency and fallback behavior', () => {
    const formatted = formatCurrency(123.45, 'USD');
    expect(typeof formatted).toBe('string');
    const fallback = formatCurrency(123.45, 'INVALID');
    expect(typeof fallback).toBe('string');
  });

  test('distance and temperature formatting', () => {
    expect(formatDistance(500, 'metric')).toMatch(/m/);
    expect(formatDistance(1500, 'metric')).toMatch(/km/);
    expect(formatTemperature(0, 'metric')).toMatch(/°C/);
    expect(formatTemperature(0, 'imperial')).toMatch(/°F/);
  });

  test('generateRegionFromTemplate and validation', () => {
    const cfg = generateRegionFromTemplate('Test City', 'TC', { latitude: 1, longitude: 2 });
    expect(cfg.id).toContain('test-city');
    expect(validateRegionConfig(cfg)).toBe(true);
  });

  test('getLocalizedTime returns string even if Intl unavailable', () => {
    const origIntl = (global as any).Intl;
    try {
      (global as any).Intl = undefined;
      const out = getLocalizedTime(new Date('2020-01-01T12:00:00Z'), 'UTC');
      expect(typeof out).toBe('string');
    } finally {
      (global as any).Intl = origIntl;
    }
  });
});
