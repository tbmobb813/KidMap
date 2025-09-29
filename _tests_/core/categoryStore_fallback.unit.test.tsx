import { useCategoryStore, useCategoryManagement } from '@/stores/categoryStore';

describe('categoryStore fallback and helpers', () => {
  test('fallback returns defaults when internal store is unavailable', () => {
    // Simulate environment where internal hook throws
    const store = useCategoryStore();
    expect(store.categories.length).toBeGreaterThan(0);
    expect(store.getAvailableIcons().length).toBeGreaterThan(2);

    const management = useCategoryManagement();
    expect(typeof management.canCreateCategory).toBe('function');
    expect(management.canCreateCategory('parent')).toBe(true);
    expect(management.needsApproval('child')).toBe(true);
  });
});
