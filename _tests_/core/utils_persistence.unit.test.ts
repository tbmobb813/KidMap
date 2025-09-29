import { expect } from '@jest/globals';

describe('persistence helpers', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns null when storage has no data', async () => {
    const mockGetItem = jest.fn(async () => null);

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      getItem: mockGetItem,
      setItem: jest.fn(),
    }));

    const { loadPersistedState } = require('@/utils/persistence/persistence');

    const res = await loadPersistedState();
    expect(mockGetItem).toHaveBeenCalled();
    expect(res).toBeNull();
  });

  it('parses and returns persisted state when version matches', async () => {
    const payload = {
      version: 1,
      favorites: [],
      recentSearches: [],
      accessibilitySettings: null,
      photoCheckIns: [],
      selectedTravelMode: 'car',
      routeOptions: {},
    };

    const mockGetItem = jest.fn(async () => JSON.stringify(payload));

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      getItem: mockGetItem,
      setItem: jest.fn(),
    }));

    const { loadPersistedState } = require('@/utils/persistence/persistence');

    const res = await loadPersistedState();
    expect(res).toEqual(payload);
  });

  it('returns null when stored version does not match', async () => {
    const payload = { version: 2 };
    const mockGetItem = jest.fn(async () => JSON.stringify(payload));

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      getItem: mockGetItem,
      setItem: jest.fn(),
    }));

    const { loadPersistedState } = require('@/utils/persistence/persistence');

    const res = await loadPersistedState();
    expect(res).toBeNull();
  });

  it('savePersistedState writes JSON including version', async () => {
    const mockSetItem = jest.fn(async () => undefined);

    jest.doMock('@react-native-async-storage/async-storage', () => ({
      getItem: jest.fn(),
      setItem: mockSetItem,
    }));

    const { savePersistedState } = require('@/utils/persistence/persistence');

    const partial = {
      favorites: [],
      recentSearches: [],
      accessibilitySettings: null,
      photoCheckIns: [],
      selectedTravelMode: 'walk',
      routeOptions: {},
    };

    await savePersistedState(partial);

  expect(mockSetItem).toHaveBeenCalled();
  // safe-guard: ensure the mock was called and extract the second arg
  const call = mockSetItem.mock.calls[0] as any;
  const jsonArg = (call && call[1]) || '';
  const parsed = jsonArg ? JSON.parse(jsonArg) : {};
  expect(parsed.version).toBe(1);
  expect(parsed.selectedTravelMode).toBe('walk');
  });
});
