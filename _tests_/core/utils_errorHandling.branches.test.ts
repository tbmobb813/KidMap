import {
  handleLocationError,
  handleNetworkError,
  handleCameraError,
} from '@/utils/error/errorHandling';

describe('error handling branches', () => {
  describe('handleNetworkError', () => {
    it('detects offline/network messages', () => {
      const res = handleNetworkError({ message: 'Network is offline' });
      expect(res.isOffline).toBe(true);
      expect(res.canRetry).toBe(true);
      expect(res.userMessage).toMatch(/No internet/i);
    });

    it('detects timeout messages', () => {
      const res = handleNetworkError({ message: 'Request TIMEOUT occurred' });
      expect(res.technicalMessage).toBe('Request timeout');
      expect(res.canRetry).toBe(true);
      expect(res.isOffline).toBe(false);
    });

    it('detects 404 not found', () => {
      const res = handleNetworkError({ message: '404 Not Found' });
      expect(res.canRetry).toBe(false);
      expect(res.userMessage).toMatch(/Service temporarily unavailable/i);
    });

    it('falls back for unknown network errors', () => {
      const res = handleNetworkError({ message: 'weird error' });
      expect(res.userMessage).toMatch(/Connection problem/i);
      expect(res.isOffline).toBe(false);
    });
  });

  describe('handleCameraError', () => {
    it('handles permission denied', () => {
      const r = handleCameraError({ message: 'Permission denied by user' });
      expect(r.requiresPermission).toBe(true);
      expect(r.canRetry).toBe(true);
      expect(r.userMessage).toMatch(/Camera permission is needed/i);
    });

    it('handles unavailable camera', () => {
      const r = handleCameraError({ message: 'Camera unavailable on this device' });
      expect(r.requiresPermission).toBe(false);
      expect(r.canRetry).toBe(false);
      expect(r.userMessage).toMatch(/not available/i);
    });

    it('handles cancelled camera', () => {
      const r = handleCameraError({ message: 'User cancelled' });
      expect(r.userMessage).toMatch(/cancelled/i);
      expect(r.canRetry).toBe(true);
    });

    it('handles default camera error', () => {
      const r = handleCameraError({ message: 'some other error' });
      expect(r.userMessage).toMatch(/Camera error, please try again/i);
    });
  });

  describe('handleLocationError', () => {
    it('handles permission denied code', () => {
      const r = handleLocationError({ code: 1 });
      expect(r.userMessage).toMatch(/Location access is needed/i);
      expect(r.canRetry).toBe(true);
    });

    it('handles position unavailable', () => {
      const r = handleLocationError({ code: 'POSITION_UNAVAILABLE' });
      expect(r.userMessage).toMatch(/Can't find your location/i);
      expect(r.canRetry).toBe(true);
    });

    it('handles timeout', () => {
      const r = handleLocationError({ code: 3 });
      expect(r.userMessage).toMatch(/taking too long/i);
    });

    it('handles default unknown', () => {
      const r = handleLocationError({ message: 'odd' });
      expect(r.userMessage).toMatch(/Having trouble with location services/i);
      expect(r.suggestedAction).toBeDefined();
    });
  });
});
