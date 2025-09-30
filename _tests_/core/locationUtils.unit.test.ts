import {
  validateLocation,
  calculateDistance,
  verifyLocationProximity,
  formatDistance,
  getLocationAccuracyDescription,
} from '@/utils/location/locationUtils';

describe('locationUtils', () => {
  describe('validateLocation', () => {
    it('validates a correct location', () => {
      const out = validateLocation({ latitude: 10, longitude: 20 });
      expect(out.isValid).toBe(true);
      expect(out.errors).toHaveLength(0);
    });

    it('rejects non-numeric coordinates', () => {
      const out = validateLocation({ latitude: NaN as any, longitude: 20 as any });
      expect(out.isValid).toBe(false);
      expect(out.errors[0]).toMatch(/valid numbers/);
    });

    it('warns when near (0,0)', () => {
      const out = validateLocation({ latitude: 0.00001, longitude: 0.00002 });
      expect(out.isValid).toBe(true);
      expect(out.warnings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects out-of-range lat/lon', () => {
      const latErr = validateLocation({ latitude: 100 as any, longitude: 0 });
      expect(latErr.isValid).toBe(false);
      expect(latErr.errors.some((e: string) => e.includes('Latitude'))).toBe(true);

      const lonErr = validateLocation({ latitude: 0, longitude: 200 as any });
      expect(lonErr.isValid).toBe(false);
      expect(lonErr.errors.some((e: string) => e.includes('Longitude'))).toBe(true);
    });
  });

  describe('calculateDistance', () => {
    it('returns small distance for close points', () => {
      // ~11.1 meters for 0.0001 deg lat difference
      const d = calculateDistance(37.7749, -122.4194, 37.7750, -122.4194);
      expect(d).toBeGreaterThan(5);
      expect(d).toBeLessThan(20);
    });

    it('is symmetric', () => {
      const a = calculateDistance(0, 0, 1, 1);
      const b = calculateDistance(1, 1, 0, 0);
      expect(Math.round(a)).toBe(Math.round(b));
    });

    it('returns ~0 for identical points', () => {
      const d = calculateDistance(0, 0, 0, 0);
      expect(Math.round(d)).toBe(0);
    });
  });

  describe('verifyLocationProximity', () => {
    it('reports within radius when close', () => {
      const res = verifyLocationProximity(37.7749, -122.4194, 37.7750, -122.4194, 50);
      expect(res.isWithinRadius).toBe(true);
      expect(typeof res.distance).toBe('number');
    });

    it('reports outside radius when far', () => {
      const res = verifyLocationProximity(0, 0, 10, 10, 1000);
      expect(res.isWithinRadius).toBe(false);
    });
  });

  describe('formatDistance & accuracy description', () => {
    it('formats meters and kilometers', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(1200)).toBe('1.2km');
    });

    it('returns expected accuracy descriptions', () => {
      expect(getLocationAccuracyDescription(10)).toBe('Very close');
      expect(getLocationAccuracyDescription(75)).toBe('Close');
      expect(getLocationAccuracyDescription(150)).toBe('Nearby');
      expect(getLocationAccuracyDescription(300)).toBe('In the area');
      expect(getLocationAccuracyDescription(1000)).toBe('Far away');
      expect(getLocationAccuracyDescription(2000)).toBe('Far away');
    });
  });
});
import {
  validateLocation,
  calculateDistance,
  verifyLocationProximity,
  formatDistance,
  getLocationAccuracyDescription,
} from '@/utils/location/locationUtils';

describe('locationUtils', () => {
  describe('validateLocation', () => {
    it('validates a correct location', () => {
      const out = validateLocation({ latitude: 10, longitude: 20 });
      expect(out.isValid).toBe(true);
      expect(out.errors).toHaveLength(0);
    });

    it('rejects non-numeric coordinates', () => {
      const out = validateLocation({ latitude: NaN as any, longitude: 20 as any });
      expect(out.isValid).toBe(false);
      expect(out.errors[0]).toMatch(/valid numbers/);
    });

    it('warns when near (0,0)', () => {
      const out = validateLocation({ latitude: 0.00001, longitude: 0.00002 });
      expect(out.isValid).toBe(true);
      expect(out.warnings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects out-of-range lat/lon', () => {
      const latErr = validateLocation({ latitude: 100 as any, longitude: 0 });
      expect(latErr.isValid).toBe(false);
      expect(latErr.errors.some((e: string) => e.includes('Latitude'))).toBe(true);

      const lonErr = validateLocation({ latitude: 0, longitude: 200 as any });
      expect(lonErr.isValid).toBe(false);
      expect(lonErr.errors.some((e: string) => e.includes('Longitude'))).toBe(true);
    });
  });

  describe('calculateDistance', () => {
    it('returns small distance for close points', () => {
      // ~11.1 meters for 0.0001 deg lat difference
      const d = calculateDistance(37.7749, -122.4194, 37.7750, -122.4194);
      expect(d).toBeGreaterThan(5);
      expect(d).toBeLessThan(20);
    });

    it('is symmetric', () => {
      const a = calculateDistance(0, 0, 1, 1);
      const b = calculateDistance(1, 1, 0, 0);
      expect(Math.round(a)).toBe(Math.round(b));
    });

    it('returns ~0 for identical points', () => {
      const d = calculateDistance(0, 0, 0, 0);
      expect(Math.round(d)).toBe(0);
    });
  });

  describe('verifyLocationProximity', () => {
    it('reports within radius when close', () => {
      const res = verifyLocationProximity(37.7749, -122.4194, 37.7750, -122.4194, 50);
      expect(res.isWithinRadius).toBe(true);
      expect(typeof res.distance).toBe('number');
    });

    it('reports outside radius when far', () => {
      const res = verifyLocationProximity(0, 0, 10, 10, 1000);
      expect(res.isWithinRadius).toBe(false);
    });
  });

  describe('formatDistance & accuracy description', () => {
    it('formats meters and kilometers', () => {
      expect(formatDistance(500)).toBe('500m');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(1200)).toBe('1.2km');
    });

    it('returns expected accuracy descriptions', () => {
      expect(getLocationAccuracyDescription(10)).toBe('Very close');
      expect(getLocationAccuracyDescription(75)).toBe('Close');
      expect(getLocationAccuracyDescription(150)).toBe('Nearby');
      expect(getLocationAccuracyDescription(300)).toBe('In the area');
      expect(getLocationAccuracyDescription(1000)).toBe('Far away');
      expect(getLocationAccuracyDescription(2000)).toBe('Far away');
    });
  });
});
