// stores/categoryStore.ts - Category management store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isChildCreated: boolean;
  needsApproval: boolean;
  isApproved: boolean;
  createdBy: 'parent' | 'child';
  createdAt: Date;
  description?: string;
  parentNotes?: string;
}

interface CategoryState {
  categories: Category[];
  pendingCategories: Category[];
  
  // Actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  approveCategory: (id: string, parentNotes?: string) => void;
  rejectCategory: (id: string, reason?: string) => void;
  getApprovedCategories: () => Category[];
  getPendingCategories: () => Category[];
  initializeDefaultCategories: () => void;
}

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  {
    name: 'School',
    icon: '🏫',
    color: '#2563eb',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Schools and educational facilities'
  },
  {
    name: 'Home',
    icon: '🏠',
    color: '#dc2626',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Home and family residences'
  },
  {
    name: 'Food',
    icon: '🍕',
    color: '#ea580c',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Restaurants and food places'
  },
  {
    name: 'Fun',
    icon: '🎮',
    color: '#7c3aed',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Entertainment and fun activities'
  },
  {
    name: 'Shop',
    icon: '🛍️',
    color: '#059669',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Shopping and stores'
  },
  {
    name: 'Health',
    icon: '🏥',
    color: '#dc2626',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Medical and health services'
  },
  {
    name: 'Transport',
    icon: '🚌',
    color: '#0891b2',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Transportation hubs'
  },
  {
    name: 'Friends',
    icon: '👥',
    color: '#dc2626',
    isDefault: true,
    isChildCreated: false,
    needsApproval: false,
    isApproved: true,
    createdBy: 'parent',
    description: 'Friends and social places'
  }
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      pendingCategories: [],

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: Date.now().toString(),
          createdAt: new Date(),
        };

        if (category.needsApproval) {
          set((state) => ({
            pendingCategories: [...state.pendingCategories, newCategory]
          }));
        } else {
          set((state) => ({
            categories: [...state.categories, newCategory]
          }));
        }
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
          )
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter(cat => cat.id !== id && !cat.isDefault),
          pendingCategories: state.pendingCategories.filter(cat => cat.id !== id)
        }));
      },

      approveCategory: (id, parentNotes) => {
        const state = get();
        const category = state.pendingCategories.find(cat => cat.id === id);
        
        if (category) {
          const approvedCategory = {
            ...category,
            isApproved: true,
            needsApproval: false,
            parentNotes
          };

          set({
            categories: [...state.categories, approvedCategory],
            pendingCategories: state.pendingCategories.filter(cat => cat.id !== id)
          });
        }
      },

      rejectCategory: (id, reason) => {
        set((state) => ({
          pendingCategories: state.pendingCategories.filter(cat => cat.id !== id)
        }));
      },

      getApprovedCategories: () => {
        return get().categories.filter(cat => cat.isApproved);
      },

      getPendingCategories: () => {
        return get().pendingCategories;
      },

      initializeDefaultCategories: () => {
        const state = get();
        if (state.categories.length === 0) {
          const defaultCategories = DEFAULT_CATEGORIES.map((cat, index) => ({
            ...cat,
            id: `default-${index}`,
            createdAt: new Date(),
          }));

          set({ categories: defaultCategories });
        }
      },
    }),
    {
      name: 'category-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
