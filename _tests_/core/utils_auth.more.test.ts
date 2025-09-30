describe('utils/auth additional tests', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('getSessionTimeRemaining returns 0 when no tokens and >0 when tokens set', async () => {
    const mockApi = { post: jest.fn(), get: jest.fn(), setAuthToken: jest.fn(), clearAuthToken: jest.fn() };
    const mockSafeAsyncStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');

    // initially should be 0
    expect(auth.authManager.getSessionTimeRemaining()).toBe(0);

    // set tokens on the singleton to simulate logged in state
    (auth.authManager as any).tokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 60_000 };
    expect(auth.authManager.getSessionTimeRemaining()).toBeGreaterThan(0);
  });

  test('enableBiometricAuth returns unsupported on web and sets storage on mobile', async () => {
    const mockApi = { post: jest.fn(), get: jest.fn(), setAuthToken: jest.fn(), clearAuthToken: jest.fn() };
    const mockSafeAsyncStorage = { getItem: jest.fn(), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn() };

    // web path -> should return not supported
    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'web', Version: 1 } }));

    let auth = require('../../utils/auth');
    const webRes = await auth.authManager.enableBiometricAuth();
    expect(webRes.success).toBe(false);
    expect(webRes.error).toMatch(/not supported/i);

    // android path -> should store the preference
    jest.resetModules();
    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    auth = require('../../utils/auth');
    const mobileRes = await auth.authManager.enableBiometricAuth();
    expect(mobileRes.success).toBe(true);
    expect(mockSafeAsyncStorage.setItem).toHaveBeenCalledWith('biometric_enabled', true);
  });

  test('isBiometricAuthEnabled handles boolean, string and errors', async () => {
    const mockApi = { post: jest.fn(), get: jest.fn(), setAuthToken: jest.fn(), clearAuthToken: jest.fn() };
    const mockSafeAsyncStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };

  // Return 'true' for any key so initialization won't consume a one-off value
  mockSafeAsyncStorage.getItem.mockImplementation((_key: string) => Promise.resolve('true'));
    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));
    let auth = require('../../utils/auth');
    await expect(auth.authManager.isBiometricAuthEnabled()).resolves.toBe(true);

    // Now test error path: make getItem reject only for biometric key
    jest.resetModules();
    mockSafeAsyncStorage.getItem.mockImplementation((key: string) => {
      if (key === 'biometric_enabled') return Promise.reject(new Error('fail'));
      return Promise.resolve(null);
    });
    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));
    auth = require('../../utils/auth');
    await expect(auth.authManager.isBiometricAuthEnabled()).resolves.toBe(false);
  });

  test('extendSession calls api when authenticated and does nothing when not', async () => {
    const mockApi = { post: jest.fn().mockResolvedValue({ success: true }), get: jest.fn(), setAuthToken: jest.fn(), clearAuthToken: jest.fn() };
    const mockSafeAsyncStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };

    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));

    const auth = require('../../utils/auth');

    // not authenticated -> should not call api
    await auth.authManager.extendSession();
    expect(mockApi.post).not.toHaveBeenCalled();

    // authenticated -> should call api
    (auth.authManager as any).currentUser = { id: 'u', email: 'e', name: 'n', role: 'user', preferences: { notifications: true, locationSharing: true, emergencyContacts: [] }, createdAt: '', lastLoginAt: '' };
    (auth.authManager as any).tokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 60000 };
    await auth.authManager.extendSession();
    expect(mockApi.post).toHaveBeenCalledWith('/auth/extend-session');
  });

  test('verifyParentalPin and setParentalPin behaviors', async () => {
    const mockApi = { post: jest.fn(), get: jest.fn(), setAuthToken: jest.fn(), clearAuthToken: jest.fn() };
    const mockSafeAsyncStorage = { getItem: jest.fn(), setItem: jest.fn().mockResolvedValue(undefined), removeItem: jest.fn() };

    // parental controls disabled -> verifyParentalPin should return true
    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));
    let auth = require('../../utils/auth');
    (auth.authManager as any).currentUser = { id: 'u', email: 'e', name: 'n', role: 'user', preferences: { notifications: true, locationSharing: true, emergencyContacts: [] }, createdAt: '', lastLoginAt: '' };
    await expect(auth.authManager.verifyParentalPin('1234')).resolves.toBe(true);

    // enabled -> API returns valid true
    jest.resetModules();
    mockApi.post.mockResolvedValueOnce({ success: true, data: { valid: true } });
    jest.doMock('../../utils/api/api', () => ({ apiClient: mockApi }));
    jest.doMock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'android', Version: 1 } }));
    auth = require('../../utils/auth');
    (auth.authManager as any).currentUser = { id: 'u', email: 'e', name: 'n', role: 'parent', parentalControls: { isEnabled: true, restrictions: [] }, preferences: { notifications: true, locationSharing: true, emergencyContacts: [] }, createdAt: '', lastLoginAt: '' };
    await expect(auth.authManager.verifyParentalPin('1234')).resolves.toBe(true);

    // setParentalPin -> when API succeeds, storage should be updated and success returned
    mockApi.post.mockResolvedValueOnce({ success: true });
    const res = await auth.authManager.setParentalPin('9999');
    expect(res.success).toBe(true);
    expect(mockSafeAsyncStorage.setItem).toHaveBeenCalledWith('user_profile', expect.any(Object));
  });
});
