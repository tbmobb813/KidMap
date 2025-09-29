import { handleLocationError, handleNetworkError, handleCameraError, SafeAsyncStorage, withRetry } from '@/utils/error/errorHandling';

const mockStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStorage[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStorage[k] = v;
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete mockStorage[k];
    return Promise.resolve();
  }),
}));

describe('error handling helpers', () => {
  it('handles location permission denial', () => {
    const out = handleLocationError({ code: 1 });
    expect(out.userMessage).toContain('Location access');
    expect(out.canRetry).toBe(true);
  });

  it('handles position unavailable', () => {
    const out = handleLocationError({ code: 2 });
    expect(out.technicalMessage).toContain('GPS');
  });

  it('handles network offline error', () => {
    const out = handleNetworkError({ message: 'Network is offline' });
    expect(out.isOffline).toBe(true);
  });

  it('handles camera permission error', () => {
    const out = handleCameraError({ message: 'permission denied' });
    expect(out.requiresPermission).toBe(true);
  });

  it('SafeAsyncStorage set/get/remove basic flow', async () => {
    await SafeAsyncStorage.setItem('k', { x: 1 });
    const v = await SafeAsyncStorage.getItem('k');
    expect(v).toMatchObject({ x: 1 });
    await SafeAsyncStorage.removeItem('k');
    const v2 = await SafeAsyncStorage.getItem('k');
    expect(v2).toBeNull();
  });

  it('withRetry returns value on first try', async () => {
    const res = await withRetry(async () => 'ok', { maxAttempts: 2, delayMs: 1 });
    expect(res).toBe('ok');
  });
});
