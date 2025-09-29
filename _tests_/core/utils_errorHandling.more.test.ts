import errorHandling from '@/utils/error/errorHandling';

describe('errorHandling utilities - extra branches', () => {
  const { handleLocationError, handleNetworkError, handleCameraError } = errorHandling;

  it('handleLocationError returns permission message when code is PERMISSION_DENIED', () => {
    const res = handleLocationError({ code: 'PERMISSION_DENIED' });
    expect(res.userMessage).toMatch(/Location access is needed/i);
    expect(res.canRetry).toBe(true);
  });

  it('handleNetworkError detects offline message', () => {
    const res = handleNetworkError({ message: 'Network is offline' });
    expect(res.isOffline).toBe(true);
    expect(res.userMessage).toMatch(/No internet connection/i);
  });

  it('handleCameraError recognizes permission denied', () => {
    const res = handleCameraError({ message: 'Permission denied by user' });
    expect(res.requiresPermission).toBe(true);
    expect(res.userMessage).toMatch(/permission is needed/i);
  });
});
