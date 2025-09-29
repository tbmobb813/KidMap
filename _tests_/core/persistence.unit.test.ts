import * as persistence from '@/utils/persistence/persistence';

// Mock AsyncStorage used in persistence.ts
const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStorage[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStorage[k] = v;
    return Promise.resolve();
  }),
}));

describe('persistence', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  });

  it('loadPersistedState returns null when nothing stored', async () => {
    const result = await persistence.loadPersistedState();
    expect(result).toBeNull();
  });

  it('savePersistedState stores JSON string without throwing', async () => {
    const partial = { favorites: [], recentSearches: [], accessibilitySettings: {}, photoCheckIns: [], selectedTravelMode: 'walk', routeOptions: {} };
    await expect(persistence.savePersistedState(partial)).resolves.toBeUndefined();
    const raw = mockStorage['kidmap.navigation.v1'];
    expect(typeof raw).toBe('string');
    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe(1);
    expect(parsed.selectedTravelMode).toBe('walk');
  });

  it('loadPersistedState returns object when stored with correct version', async () => {
    mockStorage['kidmap.navigation.v1'] = JSON.stringify({ version: 1, favorites: [], recentSearches: [], accessibilitySettings: {}, photoCheckIns: [], selectedTravelMode: 'drive', routeOptions: {} });
    const out = await persistence.loadPersistedState();
    expect(out).toMatchObject({ selectedTravelMode: 'drive' });
  });
});
