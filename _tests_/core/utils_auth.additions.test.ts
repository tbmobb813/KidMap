import { jest } from '@jest/globals';

describe('utils/auth additional tests', () => {
  const makeUser = () => ({
    id: 'u1',
    email: 'a@b.com',
    name: 'A',
    role: 'user',
    preferences: { notifications: true, locationSharing: false, emergencyContacts: [] },
    parentalControls: { isEnabled: false, restrictions: [] },
    likedSuggestions: [],
    savedRoutes: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  });

  test('initializes from stored tokens and profile, sets auth token and session time', async () => {
    jest.resetModules();

    const tokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 10000 };
    const user = makeUser();

    const mockApi: any = {
      post: (jest.fn() as any),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: user }),
      setAuthToken: (jest.fn() as any),
      clearAuthToken: (jest.fn() as any),
    };

    const mockSafeAsyncStorage: any = {
      getItem: (jest.fn() as any).mockImplementation((_key: string) => {
        return Promise.resolve(tokens);
      }),
      setItem: (jest.fn() as any).mockResolvedValue(undefined),
      removeItem: (jest.fn() as any).mockResolvedValue(undefined),
    };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');

    // initialization is async - wait a short tick for constructor to finish
    await new Promise((r) => setTimeout(r, 0));

    expect(auth.authManager.isAuthenticated).toBe(true);
    expect(auth.authManager.getSessionTimeRemaining()).toBeGreaterThan(0);
    expect(mockApi.setAuthToken).toHaveBeenCalledWith('a');
    // ensure profile was requested and cached
    expect(mockApi.get).toHaveBeenCalledWith('/auth/profile');
    expect(mockSafeAsyncStorage.setItem).toHaveBeenCalled();
  });

  test('extendSession calls api when authenticated', async () => {
    jest.resetModules();

    const tokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 10000 };
    const user = makeUser();

    const mockApi: any = {
      post: (jest.fn() as any).mockResolvedValue({ success: true }),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: user }),
      setAuthToken: (jest.fn() as any),
    };

    const mockSafeAsyncStorage: any = {
      getItem: (jest.fn() as any).mockImplementation((_key: string) => Promise.resolve(tokens)),
      setItem: (jest.fn() as any).mockResolvedValue(undefined),
      removeItem: (jest.fn() as any).mockResolvedValue(undefined),
    };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    await new Promise((r) => setTimeout(r, 0));

    await auth.authManager.extendSession();
    expect(mockApi.post).toHaveBeenCalledWith('/auth/extend-session');
  });

  test('toggleLikedSuggestion and saveRoute call updateProfile (api put)', async () => {
    jest.resetModules();

    const tokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 10000 };
    const user = makeUser();

    const mockApi: any = {
      post: (jest.fn() as any),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: user }),
      put: (jest.fn() as any).mockResolvedValue({ success: true, data: { ...user, likedSuggestions: ['x'] } }),
      setAuthToken: (jest.fn() as any),
    };

    const mockSafeAsyncStorage: any = {
      getItem: (jest.fn() as any).mockImplementation((_key: string) => Promise.resolve(tokens)),
      setItem: (jest.fn() as any).mockResolvedValue(undefined),
      removeItem: (jest.fn() as any).mockResolvedValue(undefined),
    };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    await new Promise((r) => setTimeout(r, 0));

    const res1 = await auth.authManager.toggleLikedSuggestion('x', true);
    expect(mockApi.put).toHaveBeenCalled();
    expect(res1.success).toBe(true);

    const res2 = await auth.authManager.saveRoute('r1', true);
    expect(mockApi.put).toHaveBeenCalled();
    expect(res2.success).toBe(true);
  });

  test('changePassword and resetPassword both handle success and failure', async () => {
    jest.resetModules();

    const mockApi: any = {
      post: (jest.fn() as any).mockImplementation((path: string) => {
        if (path === '/auth/change-password') return Promise.resolve({ success: true });
        if (path === '/auth/reset-password') return Promise.resolve({ success: false, message: 'no' });
        return Promise.resolve({ success: false });
      }),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: makeUser() }),
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

    const pass = await auth.authManager.changePassword('old', 'new');
    expect(pass.success).toBe(true);

    const reset = await auth.authManager.resetPassword('a@b.com');
    expect(reset.success).toBe(false);
  });

  test('setParentalPin updates local profile and notifies listeners', async () => {
    jest.resetModules();

    const tokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 10000 };
    const user = makeUser();
    user.parentalControls = { isEnabled: false, restrictions: [] };

    const mockApi: any = {
      post: (jest.fn() as any).mockResolvedValue({ success: true }),
      get: (jest.fn() as any).mockResolvedValue({ success: true, data: user }),
      setAuthToken: (jest.fn() as any),
    };

    const mockSafeAsyncStorage: any = {
      getItem: (jest.fn() as any).mockImplementation((_key: string) => Promise.resolve(tokens)),
      setItem: (jest.fn() as any).mockResolvedValue(undefined),
      removeItem: (jest.fn() as any).mockResolvedValue(undefined),
    };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');
    await new Promise((r) => setTimeout(r, 0));

    const listener = jest.fn();
    const unsubscribe = auth.authManager.addListener(listener);

    const res = await auth.authManager.setParentalPin('9999');
    expect(res.success).toBe(true);
    expect(mockApi.post).toHaveBeenCalledWith('/auth/set-parental-pin', { pin: '9999' });
    expect(mockSafeAsyncStorage.setItem).toHaveBeenCalledWith('user_profile', expect.any(Object));
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });
});
