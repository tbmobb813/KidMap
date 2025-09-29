// Mock AsyncStorage before importing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

import { render, act, waitFor } from '@testing-library/react-native';
import React from 'react';
// Use actual implementation to avoid global jest.setup mocks
const { useCategoryStoreInternal, CategoryProvider } = jest.requireActual('@/stores/categoryStore');

describe('categoryStore unit tests', () => {
  function harnessWithProvider<T>(hook: () => T) {
    const ref: { current?: T } = {} as any;
    const Comp = () => {
       
      ref.current = hook();
      return null;
    };
    const Wrapper = ({ children }: any) => <CategoryProvider>{children}</CategoryProvider>;
    render(<Wrapper><Comp /></Wrapper>);
    return ref as { current: T };
  }

  test('addCategory creates new category with id', async () => {
    const ref = harnessWithProvider(() => useCategoryStoreInternal());

    // wait for initial load to finish so storage load effect doesn't overwrite our changes
    await waitFor(() => expect(ref.current!.isLoading).toBe(false));

    let newCat: any;
    await act(async () => {
      newCat = await ref.current!.addCategory({ name: 'Custom', icon: 'Car', color: '#000000', isDefault: false, createdBy: 'child', isApproved: false });
    });

    expect(newCat).toHaveProperty('id');
    expect(ref.current!.categories.some((c: any) => c.id === newCat.id)).toBe(true);
  });

  test('approveCategory moves pending to approved and getPending/getApproved reflect that', async () => {
    const ref = harnessWithProvider(() => useCategoryStoreInternal());

    await waitFor(() => expect(ref.current!.isLoading).toBe(false));

    let pending: any;
    await act(async () => {
      pending = await ref.current!.addCategory({ name: 'Pending', icon: 'Car', color: '#111111', isDefault: false, createdBy: 'child', isApproved: false });
    });

    expect(ref.current!.getPendingCategories().some((c: any) => c.id === pending.id)).toBe(true);

    await act(async () => {
      await ref.current!.approveCategory(pending.id);
    });

    expect(ref.current!.getPendingCategories().some((c: any) => c.id === pending.id)).toBe(false);
    expect(ref.current!.getApprovedCategories().some((c: any) => c.id === pending.id)).toBe(true);
  });

  test('getPlaceCategory returns other for custom non-default categories', async () => {
    const ref = harnessWithProvider(() => useCategoryStoreInternal());

    await waitFor(() => expect(ref.current!.isLoading).toBe(false));

    // pick an existing default id
    const defaultId = ref.current!.categories.find((c: any) => c.isDefault)?.id as string;
    expect(ref.current!.getPlaceCategory(defaultId)).toBe(defaultId);

    // simulate custom
    const customId = 'custom_test_id';
    expect(ref.current!.getPlaceCategory(customId)).toBe('other');
  });
});

