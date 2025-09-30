import {
  handleLocationError,
  handleNetworkError,
  handleCameraError,
} from '@/utils/error/errorHandling';

describe('errorHandling helpers', () => {
  it('maps permission denied location error correctly', () => {
    const out = handleLocationError({ code: 'PERMISSION_DENIED' });
    expect(out.userMessage).toMatch(/Location access is needed/i);
    expect(out.canRetry).toBe(true);
  });

  it('maps network offline message correctly', () => {
    const out = handleNetworkError({ message: 'Network is offline' });
    expect(out.isOffline).toBe(true);
    expect(out.userMessage).toMatch(/No internet connection/i);
  });

  it('maps camera permission error correctly', () => {
    const out = handleCameraError({ message: 'Permission denied' });
    expect(out.requiresPermission).toBe(true);
    expect(out.canRetry).toBe(true);
  });
});
