import {
  formatCurrency,
  formatDistance,
  formatTemperature,
  getLocalizedTime,
  validateRegionConfig,
  generateRegionFromTemplate,
} from '../../utils/location/regionUtils';

describe('region utils', () => {
  test('formatCurrency falls back gracefully for unknown currency', () => {
    const val = formatCurrency(12.5, 'XXX');
    // either formatted or the fallback; ensure it contains digits
    expect(/\d/.test(val)).toBe(true);
  });

  test('formatDistance metric and imperial behavior', () => {
    expect(formatDistance(500, 'metric')).toBe('500 m');
    expect(formatDistance(1500, 'metric')).toBe('1.5 km');
    expect(formatDistance(10, 'imperial')).toMatch(/ft|mi/);
  });

  test('formatTemperature converts correctly', () => {
    expect(formatTemperature(0, 'metric')).toBe('0°C');
    expect(formatTemperature(0, 'imperial')).toBe('32°F');
  });

  test('getLocalizedTime returns a string for timezone', () => {
    const t = getLocalizedTime(new Date('2020-01-01T12:00:00Z'), 'UTC');
    expect(typeof t).toBe('string');
  });

  test('validateRegionConfig validates basic template', () => {
    const r = generateRegionFromTemplate('Test City', 'TC', { latitude: 0, longitude: 0 });
    expect(validateRegionConfig(r)).toBe(true);
  });
});
