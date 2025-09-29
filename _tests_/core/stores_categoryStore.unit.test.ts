// Mock AsyncStorage before importing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
import { render, act, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useCategoryStoreInternal, CategoryProvider } from '@/stores/categoryStore';

describe('categoryStore unit tests', () => {
  function harnessHook<T>(hook: () => T) {
    const ref: { current?: T } = {} as any;
    const Comp = () => {
      ref.current = hook();
      return null;
    };
    // Render inside CategoryProvider so the internal hook has context
    render(React.createElement(CategoryProvider, null, React.createElement(Comp)));
    return ref as { current: T };
  }

  test('addCategory creates new category with id', async () => {
    const ref = harnessHook(() => useCategoryStoreInternal());
    await waitFor(() => expect(ref.current).toBeDefined());

    let newCat: any;
    await act(async () => {
      newCat = await ref.current!.addCategory({ name: 'Custom', icon: 'Car', color: '#112233', isDefault: false, createdBy: 'child', isApproved: false });
    });

    expect(newCat).toHaveProperty('id');
    expect(ref.current!.categories.some((c) => c.id === newCat.id)).toBe(true);
  });

  test('approveCategory moves pending to approved and getPending/getApproved reflect that', async () => {
    const ref = harnessHook(() => useCategoryStoreInternal());
    await waitFor(() => expect(ref.current).toBeDefined());

    let pending: any;
    await act(async () => {
      pending = await ref.current!.addCategory({ name: 'Pending', icon: 'Car', color: '#223344', isDefault: false, createdBy: 'child', isApproved: false });
    });

    expect(ref.current!.getPendingCategories().some((c) => c.id === pending.id)).toBe(true);

    await act(async () => {
      await ref.current!.approveCategory(pending.id);
    });

    expect(ref.current!.getPendingCategories().some((c) => c.id === pending.id)).toBe(false);
    expect(ref.current!.getApprovedCategories().some((c) => c.id === pending.id)).toBe(true);
  });

  test('getPlaceCategory returns other for custom non-default categories', () => {
    const ref = harnessHook(() => useCategoryStoreInternal());

    // pick an existing default id
    const defaultId = ref.current!.categories.find((c) => c.isDefault)?.id as string;
    expect(ref.current!.getPlaceCategory(defaultId)).toBe(defaultId);

    // simulate custom
    const customId = 'custom_test_id';
    expect(ref.current!.getPlaceCategory(customId)).toBe('other');
  });

  test('addCategory rejects invalid zod payloads (bad color)', async () => {
    const ref = harnessHook(() => useCategoryStoreInternal());
    await waitFor(() => expect(ref.current).toBeDefined());

    await expect(
      ref.current!.addCategory({ name: 'BadColor', icon: 'Car', color: 'not-a-hex', isDefault: false, createdBy: 'child', isApproved: false } as any)
    ).rejects.toThrow();
  });

  test('deleteCategory removes only custom categories', async () => {
    const ref = harnessHook(() => useCategoryStoreInternal());
    await waitFor(() => expect(ref.current).toBeDefined());

    let newCat: any;
    await act(async () => {
      newCat = await ref.current!.addCategory({ name: 'ToDelete', icon: 'Car', color: '#445566', isDefault: false, createdBy: 'child', isApproved: true });
    });

    expect(ref.current!.categories.some((c) => c.id === newCat.id)).toBe(true);

    await act(async () => {
      await ref.current!.deleteCategory(newCat.id);
    });

    expect(ref.current!.categories.some((c) => c.id === newCat.id)).toBe(false);
  });
});
