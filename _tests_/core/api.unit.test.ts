import { offlineStorage, checkBackendHealth } from '@/utils/api/api';

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
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
  multiRemove: jest.fn((keys: string[]) => {
    for (const k of keys) delete mockStorage[k];
    return Promise.resolve();
  }),
}));

describe('api offlineStorage utilities', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  });

  it('caches and retrieves responses', async () => {
    await offlineStorage.cacheResponse('foo', { data: { a: 1 } });
    const cached = await offlineStorage.getCachedResponse('foo');
    expect(cached).toEqual({ data: { a: 1 } });
  });

  it('expires old cache and removes it', async () => {
    const old = { data: { a: 2 }, timestamp: Date.now() - 10 * 60 * 1000 };
    mockStorage['cache_bar'] = JSON.stringify(old);
    const result = await offlineStorage.getCachedResponse('bar', 1000);
    expect(result).toBeNull();
  });

  it('clearCache removes cache_* keys', async () => {
    mockStorage['cache_a'] = JSON.stringify({ data: 1, timestamp: Date.now() });
    mockStorage['other'] = 'x';
    await offlineStorage.clearCache();
    expect(mockStorage['cache_a']).toBeUndefined();
    expect(mockStorage['other']).toBeDefined();
  });
});

describe('checkBackendHealth', () => {
  afterEach(() => {
    delete (global as any).fetch;
  });

  it('returns up when fetch ok', async () => {
  (global as any).fetch = jest.fn(() => Promise.resolve({ ok: true }));
    const res = await checkBackendHealth();
    expect(res).toBe('up');
  });

  it('returns down when fetch not ok or throws', async () => {
  (global as any).fetch = jest.fn(() => Promise.resolve({ ok: false }));
    const res = await checkBackendHealth();
    expect(res).toBe('down');

    // simulate network error
  (global as any).fetch = jest.fn(() => Promise.reject(new Error('fail')));
    const res2 = await checkBackendHealth();
    expect(res2).toBe('down');
  });
});
