// Single-file clean tests for persistence helpers
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStorage[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStorage[k] = v;
    return Promise.resolve();
  }),
}));

import * as persistence from '@/utils/persistence/persistence';

describe('persistence utils', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
    jest.clearAllMocks();
  });

  it('loadPersistedState returns null when storage empty', async () => {
    const res = await persistence.loadPersistedState();
    expect(res).toBeNull();
  });

  it('savePersistedState stores JSON with version and load returns it', async () => {
    const partial = { favorites: [], recentSearches: [], accessibilitySettings: {}, photoCheckIns: [], selectedTravelMode: 'walk', routeOptions: {} };
    await expect(persistence.savePersistedState(partial)).resolves.toBeUndefined();
    const raw = mockStorage['kidmap.navigation.v1'];
    expect(typeof raw).toBe('string');
    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe(1);
    // now load
    const out = await persistence.loadPersistedState();
    expect(out).toMatchObject({ selectedTravelMode: 'walk' });
  });
});
