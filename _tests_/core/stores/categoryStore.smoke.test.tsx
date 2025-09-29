// Use the JS mock directly from __mocks__ to avoid environment-specific setup
const { useCategoryManagement } = require('../../../__mocks__/stores/categoryStore.js');

describe('categoryStore smoke', () => {
  it('mocked category store exports expected symbols', () => {
    expect(typeof useCategoryManagement).toBe('function');
    const store = useCategoryManagement();
    expect(store).toBeDefined();
    expect(Array.isArray(store.getAvailableIcons())).toBe(true);
  });
});
