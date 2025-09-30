jest.resetModules();

const mockApi = {
  post: jest.fn(),
  get: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
};

const mockSafeAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock('../../utils/api/api', () => ({ apiClient: mockApi }));
jest.mock('../../utils/error/errorHandling', () => ({ SafeAsyncStorage: mockSafeAsyncStorage }));

describe('authManager behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login success stores tokens and user and sets auth token', async () => {
    const auth = require('../../utils/auth');

    const fakeUser = { id: 'u1', email: 'a@b.com', name: 'A', role: 'user', preferences: { notifications: true, locationSharing: true, emergencyContacts: [] }, createdAt: '', lastLoginAt: '' };
    const fakeTokens = { accessToken: 'a', refreshToken: 'r', expiresAt: Date.now() + 1000 * 60 * 60 };

    mockApi.post.mockResolvedValueOnce({ success: true, data: { user: fakeUser, tokens: fakeTokens } });

    const res = await auth.authManager.login({ email: 'a@b.com', password: 'Abcdef1!' });
    expect(res.success).toBe(true);
    expect(mockApi.post).toHaveBeenCalled();
    expect(mockSafeAsyncStorage.setItem).toHaveBeenCalled();
    // session time remaining should be >0
    const remain = auth.authManager.getSessionTimeRemaining();
    expect(remain).toBeGreaterThan(0);
  });
});
