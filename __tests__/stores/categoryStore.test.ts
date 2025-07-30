// __tests__/stores/categoryStore.test.ts - Category store tests
import { act } from '@testing-library/react-native';
import { useCategoryStore } from '@/stores/categoryStore';
import { 
  mockCategories, 
  mockPlaces,
  createMockCategory,
  createMockPlace,
  setupKidMapTests 
} from '../helpers';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => 
  require('../helpers/mockAsyncStorage').createAsyncStorageMock()
);

describe('Category Store', () => {
  beforeEach(() => {
    setupKidMapTests();
    // Reset store state
    const store = useCategoryStore.getState();
    act(() => {
      store.setCategories([]);
      store.setSelectedCategories([]);
      store.setCustomCategories([]);
    });
  });

  describe('Category Management', () => {
    it('should set and get categories', () => {
      const testCategories = [mockCategories[0], mockCategories[1]];
      const { setCategories } = useCategoryStore.getState();
      
      act(() => {
        setCategories(testCategories);
      });

      const updatedState = useCategoryStore.getState();
      expect(updatedState.categories).toEqual(testCategories);
      expect(updatedState.categories).toHaveLength(2);
    });

    it('should add a new category', () => {
      const newCategory = mockCategories[0];
      const { addCategory } = useCategoryStore.getState();
      
      act(() => {
        addCategory(newCategory);
      });

      const updatedState = useCategoryStore.getState();
      expect(updatedState.categories).toContainEqual(newCategory);
      expect(updatedState.categories).toHaveLength(1);
    });

    it('should remove a category', () => {
      const testCategories = [mockCategories[0], mockCategories[1]];
      const { setCategories, removeCategory } = useCategoryStore.getState();
      
      // Set initial categories
      act(() => {
        setCategories(testCategories);
      });

      // Remove one category
      act(() => {
        removeCategory(mockCategories[0].id);
      });

      const updatedState = useCategoryStore.getState();
      expect(updatedState.categories).toHaveLength(1);
      expect(updatedState.categories[0]).toEqual(mockCategories[1]);
      expect(updatedState.categories).not.toContainEqual(mockCategories[0]);
    });

    it('should handle removing non-existent category', () => {
      const testCategories = [mockCategories[0]];
      const { setCategories, removeCategory } = useCategoryStore.getState();
      
      act(() => {
        setCategories(testCategories);
        removeCategory('non-existent-id');
      });

      const updatedState = useCategoryStore.getState();
      expect(updatedState.categories).toEqual(testCategories);
    });

    it('should work with custom categories', () => {
      const customCategory = createMockCategory({
        id: 'custom-bookstore',
        name: 'Bookstore',
        icon: '📚',
        color: '#8B4513',
        isUserCreated: true,
        description: 'Places to buy and read books',
      });

      const { addCategory } = useCategoryStore.getState();
      
      act(() => {
        addCategory(customCategory);
      });

      const updatedState = useCategoryStore.getState();
      expect(updatedState.categories[0].name).toBe('Bookstore');
      expect(updatedState.categories[0].icon).toBe('📚');
      expect(updatedState.categories[0].isUserCreated).toBe(true);
    });
  });

  describe('Category Selection', () => {
    it('should select and deselect categories', () => {
      const { 
        setCategories, 
        selectCategory, 
        deselectCategory 
      } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
        selectCategory(mockCategories[0].id);
      });

      let state = useCategoryStore.getState();
      expect(state.selectedCategories).toContain(mockCategories[0].id);

      act(() => {
        deselectCategory(mockCategories[0].id);
      });

      state = useCategoryStore.getState();
      expect(state.selectedCategories).not.toContain(mockCategories[0].id);
    });

    it('should toggle category selection', () => {
      const { setCategories, toggleCategory } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
      });

      // First toggle should select
      act(() => {
        toggleCategory(mockCategories[0].id);
      });

      let state = useCategoryStore.getState();
      expect(state.selectedCategories).toContain(mockCategories[0].id);

      // Second toggle should deselect
      act(() => {
        toggleCategory(mockCategories[0].id);
      });

      state = useCategoryStore.getState();
      expect(state.selectedCategories).not.toContain(mockCategories[0].id);
    });

    it('should select multiple categories', () => {
      const { setCategories, selectCategory } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
        selectCategory(mockCategories[0].id);
        selectCategory(mockCategories[1].id);
      });

      const state = useCategoryStore.getState();
      expect(state.selectedCategories).toContain(mockCategories[0].id);
      expect(state.selectedCategories).toContain(mockCategories[1].id);
      expect(state.selectedCategories).toHaveLength(2);
    });

    it('should clear all selected categories', () => {
      const { 
        setCategories, 
        selectCategory, 
        clearSelectedCategories 
      } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
        selectCategory(mockCategories[0].id);
        selectCategory(mockCategories[1].id);
      });

      let state = useCategoryStore.getState();
      expect(state.selectedCategories).toHaveLength(2);

      act(() => {
        clearSelectedCategories();
      });

      state = useCategoryStore.getState();
      expect(state.selectedCategories).toHaveLength(0);
    });
  });

  describe('Custom Categories', () => {
    it('should add custom categories', () => {
      const customCategory = createMockCategory({
        id: 'user-custom-1',
        name: 'Pet Store',
        icon: '🐕',
        color: '#FF6B6B',
        isUserCreated: true,
      });

      const { addCustomCategory } = useCategoryStore.getState();
      
      act(() => {
        addCustomCategory(customCategory);
      });

      const updatedState = useCategoryStore.getState();
      expect(updatedState.customCategories).toContainEqual(customCategory);
      // Should also be added to main categories
      expect(updatedState.categories).toContainEqual(customCategory);
    });

    it('should remove custom categories', () => {
      const customCategory = mockCategories.find(c => c.isUserCreated);
      const { 
        addCustomCategory, 
        removeCustomCategory 
      } = useCategoryStore.getState();
      
      if (customCategory) {
        act(() => {
          addCustomCategory(customCategory);
        });

        let state = useCategoryStore.getState();
        expect(state.customCategories).toContainEqual(customCategory);

        act(() => {
          removeCustomCategory(customCategory.id);
        });

        state = useCategoryStore.getState();
        expect(state.customCategories).not.toContainEqual(customCategory);
        expect(state.categories).not.toContainEqual(customCategory);
      }
    });

    it('should distinguish between default and custom categories', () => {
      const defaultCategory = mockCategories.find(c => !c.isUserCreated);
      const customCategory = mockCategories.find(c => c.isUserCreated);

      const { setCategories } = useCategoryStore.getState();
      
      act(() => {
        setCategories([defaultCategory!, customCategory!]);
      });

      const state = useCategoryStore.getState();
      const defaultCategories = state.categories.filter(c => !c.isUserCreated);
      const userCategories = state.categories.filter(c => c.isUserCreated);

      expect(defaultCategories.length).toBeGreaterThan(0);
      expect(userCategories.length).toBeGreaterThan(0);
    });
  });

  describe('Category Filtering', () => {
    it('should get places by category', () => {
      const schoolCategory = mockCategories.find(c => c.name === 'School');
      const { 
        setCategories, 
        getPlacesByCategory 
      } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
      });

      if (schoolCategory) {
        const schoolPlaces = getPlacesByCategory?.(schoolCategory.id, mockPlaces);
        expect(schoolPlaces?.length).toBeGreaterThan(0);
        
        const allSchools = schoolPlaces?.every(place => place.category === 'school');
        expect(allSchools).toBe(true);
      }
    });

    it('should filter categories by selection', () => {
      const { 
        setCategories, 
        selectCategory, 
        getSelectedCategories 
      } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
        selectCategory(mockCategories[0].id);
        selectCategory(mockCategories[1].id);
      });

      const selectedCategories = getSelectedCategories?.();
      expect(selectedCategories).toHaveLength(2);
      expect(selectedCategories).toEqual([mockCategories[0], mockCategories[1]]);
    });

    it('should check if category is selected', () => {
      const { 
        setCategories, 
        selectCategory, 
        isCategorySelected 
      } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
        selectCategory(mockCategories[0].id);
      });

      const isSelected = isCategorySelected?.(mockCategories[0].id);
      const isNotSelected = isCategorySelected?.(mockCategories[1].id);

      expect(isSelected).toBe(true);
      expect(isNotSelected).toBe(false);
    });
  });

  describe('Category Search', () => {
    it('should search categories by name', () => {
      const { setCategories, searchCategories } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
      });

      const schoolResults = searchCategories?.('school');
      expect(schoolResults?.length).toBeGreaterThan(0);
      
      const hasSchoolCategory = schoolResults?.some(
        category => category.name.toLowerCase().includes('school')
      );
      expect(hasSchoolCategory).toBe(true);
    });

    it('should handle empty search results', () => {
      const { setCategories, searchCategories } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
      });

      const noResults = searchCategories?.('nonexistentcategory');
      expect(noResults).toEqual([]);
    });

    it('should be case insensitive in search', () => {
      const { setCategories, searchCategories } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
      });

      const upperCaseResults = searchCategories?.('SCHOOL');
      const lowerCaseResults = searchCategories?.('school');

      expect(upperCaseResults?.length).toEqual(lowerCaseResults?.length);
      expect(upperCaseResults).toEqual(lowerCaseResults);
    });
  });

  describe('Complete Category Flow', () => {
    it('should handle full category management workflow', () => {
      const { 
        setCategories,
        addCustomCategory,
        selectCategory,
        toggleCategory
      } = useCategoryStore.getState();
      
      const customCategory = createMockCategory({
        id: 'workflow-test',
        name: 'Test Category',
        icon: '🧪',
        color: '#00FF00',
        isUserCreated: true,
      });

      // Set up initial categories
      act(() => {
        setCategories(mockCategories);
      });

      // Add custom category
      act(() => {
        addCustomCategory(customCategory);
      });

      // Select some categories
      act(() => {
        selectCategory(mockCategories[0].id);
        selectCategory(customCategory.id);
      });

      const finalState = useCategoryStore.getState();
      expect(finalState.categories).toContainEqual(customCategory);
      expect(finalState.customCategories).toContainEqual(customCategory);
      expect(finalState.selectedCategories).toContain(mockCategories[0].id);
      expect(finalState.selectedCategories).toContain(customCategory.id);
    });

    it('should validate category system completeness', () => {
      const { setCategories } = useCategoryStore.getState();
      
      act(() => {
        setCategories(mockCategories);
      });

      const state = useCategoryStore.getState();
      const hasRequiredCategories = state.categories.length > 0;
      const hasBasicCategories = state.categories.some(c => c.name === 'School') &&
                                 state.categories.some(c => c.name === 'Home');
      
      expect(hasRequiredCategories).toBe(true);
      expect(hasBasicCategories).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid category data', () => {
      const { setCategories } = useCategoryStore.getState();
      
      act(() => {
        setCategories([] as any);
      });

      const state = useCategoryStore.getState();
      expect(state.categories).toEqual([]);
    });

    it('should handle selecting non-existent category', () => {
      const { selectCategory } = useCategoryStore.getState();
      
      act(() => {
        selectCategory('non-existent-category');
      });

      const state = useCategoryStore.getState();
      expect(state.selectedCategories).toContain('non-existent-category');
      // Should still work even if category doesn't exist in main list
    });

    it('should handle null/undefined operations gracefully', () => {
      const { 
        addCategory, 
        removeCategory, 
        selectCategory 
      } = useCategoryStore.getState();
      
      act(() => {
        addCategory(null as any);
        removeCategory(undefined as any);
        selectCategory('');
      });

      const state = useCategoryStore.getState();
      // Should not crash and maintain valid state
      expect(Array.isArray(state.categories)).toBe(true);
      expect(Array.isArray(state.selectedCategories)).toBe(true);
    });
  });

  describe('Integration with Mock Data', () => {
    it('should work with helper mock data structure', () => {
      const schoolCategory = mockCategories.find(c => c.name === 'School');
      const homeCategory = mockCategories.find(c => c.name === 'Home');
      const customCategory = mockCategories.find(c => c.isUserCreated);

      expect(schoolCategory).toBeDefined();
      expect(schoolCategory?.icon).toBe('🏫');
      expect(schoolCategory?.color).toBeTruthy();

      expect(homeCategory).toBeDefined();
      expect(homeCategory?.icon).toBe('🏠');

      expect(customCategory).toBeDefined();
      expect(customCategory?.isUserCreated).toBe(true);
    });

    it('should verify category-place relationships', () => {
      const schoolPlaces = mockPlaces.filter(p => p.category === 'school');
      const homePlace = mockPlaces.find(p => p.category === 'home');

      expect(schoolPlaces.length).toBeGreaterThan(0);
      expect(homePlace).toBeDefined();
      expect(homePlace?.name).toBe('Home');
    });
  });

  describe('State Persistence', () => {
    it('should maintain consistent state', () => {
      const testData = {
        categories: mockCategories,
        selectedCategories: [mockCategories[0].id, mockCategories[1].id],
        customCategories: mockCategories.filter(c => c.isUserCreated),
      };

      const { 
        setCategories, 
        setSelectedCategories, 
        setCustomCategories 
      } = useCategoryStore.getState();
      
      act(() => {
        setCategories(testData.categories);
        setSelectedCategories(testData.selectedCategories);
        setCustomCategories(testData.customCategories);
      });

      // Verify state persists across multiple reads
      const state1 = useCategoryStore.getState();
      const state2 = useCategoryStore.getState();
      
      expect(state1.categories).toEqual(state2.categories);
      expect(state1.selectedCategories).toEqual(state2.selectedCategories);
      expect(state1.customCategories).toEqual(state2.customCategories);
    });
  });
});
