import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from '@/types/category';

const STORAGE_KEY = 'custom_categories';

export function useCategoryStorage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories from storage
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        setCategories([]);
      }
    } catch (err) {
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save categories to storage
  const saveCategories = useCallback(async (newCategories: Category[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (err) {
      setError('Failed to save categories');
    }
  }, []);

  // Add a new category
  const addCategory = useCallback(
    async (category: Category) => {
      const updated = [...categories, category];
      await saveCategories(updated);
    },
    [categories, saveCategories],
  );

  // Edit a category
  const editCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      const updated = categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat));
      await saveCategories(updated);
    },
    [categories, saveCategories],
  );

  // Delete a category
  const deleteCategory = useCallback(
    async (id: string) => {
      const updated = categories.filter((cat) => cat.id !== id);
      await saveCategories(updated);
    },
    [categories, saveCategories],
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    addCategory,
    editCategory,
    deleteCategory,
    refresh: loadCategories,
  };
}
