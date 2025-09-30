// Mock AsyncStorage before importing category store so persistence path is exercised
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));
import { render, act, waitFor } from '@testing-library/react-native';
import React from 'react';
const { useCategoryStore, CategoryProvider } = jest.requireActual('@/stores/categoryStore');

describe('categoryStore persistence', () => {
  jest.setTimeout(15000);
  function createWithProvider() {
    const ref: { current?: ReturnType<typeof useCategoryStore> } = {} as any;
    const Comp = () => {
      ref.current = useCategoryStore();
      return null;
    };
    render(
      <CategoryProvider>
        <Comp />
      </CategoryProvider>
    );
    return ref as { current: ReturnType<typeof useCategoryStore> };
  }

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('approveCategory persists via AsyncStorage.setItem', async () => {
    const ref = createWithProvider();

    // wait for provider to be ready (isLoading false)
    await waitFor(() => expect(ref.current!.isLoading).toBe(false));

    // Add a category that will need approval. addCategory returns the created category (store generates id).
    let created: any;
    await act(async () => {
      created = await ref.current!.addCategory({ name: 'PC', icon: 'Star', color: '#112233', isDefault: false, createdBy: 'child', isApproved: false } as any);
    });

    await act(async () => {
      await ref.current!.approveCategory(created.id);
    });

  // In-memory state should reflect approval first
  const found = ref.current!.categories.find((c: any) => c.id === created.id);
  expect(found).toBeDefined();
  expect(found!.isApproved).toBe(true);

    // saveCategories should call AsyncStorage.setItem
    const asyncStorageMock = jest.requireMock('@react-native-async-storage/async-storage');
  await waitFor(() => expect(asyncStorageMock.setItem).toHaveBeenCalled());
  // Take the last call in case multiple writes occurred during the test
  const lastCall = asyncStorageMock.setItem.mock.calls[asyncStorageMock.setItem.mock.calls.length - 1];
  const [key, value] = lastCall;
    expect(typeof key).toBe('string');
    expect(typeof value).toBe('string');
    const parsed = JSON.parse(value);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed.some((c: any) => c.id === created.id && c.isApproved)).toBe(true);
  });
});
