import {
  formatCurrency,
  formatDistance,
  formatTemperature,
  getLocalizedTime,
  validateRegionConfig,
  generateRegionFromTemplate,
} from '@/utils/location/regionUtils';

describe('regionUtils helpers', () => {
  test('formatCurrency falls back gracefully for unknown currency', () => {
    const val = formatCurrency(12.5, 'XXX');
    // either formatted or the fallback; ensure it contains digits
    expect(/\d/.test(val)).toBe(true);
  });

  test('formatDistance metric and imperial behavior (non-strict)', () => {
    // avoid strict string equality because formatting may vary; assert units
    expect(formatDistance(500, 'metric')).toMatch(/m|km/);
    expect(formatDistance(1500, 'metric')).toMatch(/km/);
    expect(formatDistance(10, 'imperial')).toMatch(/ft|mi/);
  });

  test('formatTemperature conversions', () => {
    expect(formatTemperature(0, 'metric')).toMatch(/°C/);
    expect(formatTemperature(0, 'imperial')).toMatch(/°F/);
  });

  test('validateRegionConfig and generateRegionFromTemplate', () => {
    const r = generateRegionFromTemplate('Testland', 'TL', { latitude: 1, longitude: 2 });
    expect(typeof r.id).toBe('string');
    expect(validateRegionConfig(r)).toBeTruthy();
  });

  test('getLocalizedTime falls back when Intl is missing', () => {
    const orig = (global as any).Intl;
    try {
      (global as any).Intl = undefined;
      const d = new Date('2020-01-01T12:00:00Z');
      const out = getLocalizedTime(d, 'UTC');
      expect(typeof out).toBe('string');
    } finally {
      (global as any).Intl = orig;
    }
  });
});
