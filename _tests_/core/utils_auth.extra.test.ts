import { jest } from '@jest/globals';

describe('utils/auth extra branches', () => {
  test('refreshTokens succeeds when api returns new tokens', async () => {
    jest.resetModules();

    const oldTokens = { accessToken: 'old', refreshToken: 'r', expiresAt: Date.now() - 1000 };
    const newTokens = { accessToken: 'new', refreshToken: 'r2', expiresAt: Date.now() + 100000 };

    const mockApi: any = {
      post: (jest.fn() as any).mockImplementation((path: string) => {
        if (path === '/auth/refresh') return Promise.resolve({ success: true, data: newTokens });
        return Promise.resolve({ success: false });
      }),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: null }),
      setAuthToken: (jest.fn() as any),
    };

    const mockSafeAsyncStorage: any = {
      getItem: (jest.fn() as any).mockResolvedValue(null),
      setItem: (jest.fn() as any).mockResolvedValue(undefined),
      removeItem: (jest.fn() as any).mockResolvedValue(undefined),
    };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    // manually set tokens to simulate existing expired tokens
    (auth.authManager as any).tokens = oldTokens;

    const res = await (auth.authManager as any).refreshTokens();
    expect(res).toBe(true);
    expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'r' });
    expect(mockSafeAsyncStorage.setItem).toHaveBeenCalledWith('auth_tokens', newTokens, expect.any(Object));
    expect(mockApi.setAuthToken).toHaveBeenCalledWith('new');
  });

  test('refreshTokens returns false when no refresh token', async () => {
    jest.resetModules();

    const mockApi: any = { post: jest.fn(), get: jest.fn(), setAuthToken: jest.fn() };
    const mockSafeAsyncStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    (auth.authManager as any).tokens = { accessToken: 'a', refreshToken: undefined, expiresAt: Date.now() + 1000 };

    const res = await (auth.authManager as any).refreshTokens();
    expect(res).toBe(false);
  });

  test('register failure returns error object', async () => {
    jest.resetModules();

    const mockApi: any = {
      post: (jest.fn() as any).mockResolvedValue({ success: false, message: 'bad' }),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: null }),
      setAuthToken: (jest.fn() as any),
    };
    const mockSafeAsyncStorage: any = { getItem: (jest.fn() as any), setItem: (jest.fn() as any), removeItem: (jest.fn() as any) };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');

    const res = await auth.authManager.register({ email: 'a@b.com', password: 'P@ssw0rd', name: 'A' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('bad');
  });

  test('logout clears storage and attempts server logout', async () => {
    jest.resetModules();

    const tokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 10000 };
    const mockApi: any = {
      post: (jest.fn() as any).mockResolvedValue({ success: true }),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: null }),
      setAuthToken: (jest.fn() as any),
      clearAuthToken: (jest.fn() as any),
    };

    const mockSafeAsyncStorage: any = {
      getItem: (jest.fn() as any).mockResolvedValue(tokens),
      setItem: (jest.fn() as any).mockResolvedValue(undefined),
      removeItem: (jest.fn() as any).mockResolvedValue(undefined),
    };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    (auth.authManager as any).tokens = tokens;

    await auth.authManager.logout();
    expect(mockApi.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'r' });
    expect(mockSafeAsyncStorage.removeItem).toHaveBeenCalledWith('auth_tokens');
  });

  test('updateProfile returns not authenticated when no user', async () => {
    jest.resetModules();

    const mockApi: any = { put: jest.fn() };
    const mockSafeAsyncStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    const res = await auth.authManager.updateProfile({ name: 'X' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Not authenticated');
  });

  test('verifyParentalPin returns false when api fails or invalid', async () => {
    jest.resetModules();

    const user = { id: 'u1', parentalControls: { isEnabled: true, restrictions: [] } };
    const mockApi: any = {
      post: (jest.fn() as any).mockRejectedValue(new Error('boom')),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: user }),
      setAuthToken: (jest.fn() as any),
    };
    const mockSafeAsyncStorage: any = { getItem: (jest.fn() as any).mockResolvedValue(null), setItem: (jest.fn() as any), removeItem: (jest.fn() as any) };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    (auth.authManager as any).currentUser = { ...user, email: 'a@b.com', name: 'A', role: 'parent', preferences: { notifications: true, locationSharing: false, emergencyContacts: [] }, createdAt: '', lastLoginAt: '' };

    const valid = await auth.authManager.verifyParentalPin('1234');
    expect(valid).toBe(false);
  });
});
