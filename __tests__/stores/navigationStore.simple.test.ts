// __tests__/stores/navigationStore.simple.test.ts - Simple navigation store tests
import { act } from '@testing-library/react-native';
import { useNavigationStore } from '@/stores/navigationStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

const mockPlace = {
  id: 'test-place-1',
  name: 'Test Place',
  address: '123 Test St',
  coordinates: { latitude: 40.7589, longitude: -73.9851 },
  category: 'test',
  rating: 4.5,
  description: 'A test place',
  isFavorite: false,
};

const mockDestination = {
  id: 'test-place-2',
  name: 'Test Destination',
  address: '456 Test Ave',
  coordinates: { latitude: 40.7831, longitude: -73.9712 },
  category: 'test',
  rating: 4.0,
  description: 'A test destination',
  isFavorite: false,
};

describe('Navigation Store - Simple Tests', () => {
  beforeEach(() => {
    // Reset store state
    const store = useNavigationStore.getState();
    act(() => {
      store.clearRoute();
      store.setOrigin(null);
      store.setDestination(null);
    });
  });

  describe('Origin and Destination Management', () => {
    it('should set and get origin', () => {
      const { setOrigin } = useNavigationStore.getState();
      
      act(() => {
        setOrigin(mockPlace);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.origin).toEqual(mockPlace);
    });

    it('should set and get destination', () => {
      const { setDestination } = useNavigationStore.getState();
      
      act(() => {
        setDestination(mockDestination);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.destination).toEqual(mockDestination);
    });

    it('should clear origin and destination', () => {
      const { setOrigin, setDestination, clearRoute } = useNavigationStore.getState();
      
      // Set some values first
      act(() => {
        setOrigin(mockPlace);
        setDestination(mockDestination);
      });

      // Clear them
      act(() => {
        clearRoute();
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.origin).toBeNull();
      expect(updatedState.destination).toBeNull();
    });
  });

  describe('Route Management', () => {
    it('should find routes when origin and destination are set', () => {
      const { setOrigin, setDestination, findRoutes } = useNavigationStore.getState();
      
      act(() => {
        setOrigin(mockPlace);
        setDestination(mockDestination);
        findRoutes();
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.availableRoutes.length).toBeGreaterThan(0);
      expect(updatedState.selectedRoute).toBeTruthy();
    });

    it('should not find routes without origin and destination', () => {
      const { findRoutes } = useNavigationStore.getState();
      
      act(() => {
        findRoutes();
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.availableRoutes).toEqual([]);
      expect(updatedState.selectedRoute).toBeNull();
    });

    it('should select a route', () => {
      const { setOrigin, setDestination, findRoutes, selectRoute } = useNavigationStore.getState();
      
      act(() => {
        setOrigin(mockPlace);
        setDestination(mockDestination);
        findRoutes();
      });

      const state = useNavigationStore.getState();
      const testRoute = state.availableRoutes[0];

      act(() => {
        selectRoute(testRoute);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.selectedRoute).toEqual(testRoute);
    });
  });

  describe('Search Management', () => {
    it('should set search query', () => {
      const { setSearchQuery } = useNavigationStore.getState();
      const testQuery = 'coffee shop';
      
      act(() => {
        setSearchQuery(testQuery);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.searchQuery).toBe(testQuery);
    });

    it('should add to recent searches', () => {
      const { addToRecentSearches } = useNavigationStore.getState();
      
      act(() => {
        addToRecentSearches(mockPlace);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.recentSearches).toContainEqual(mockPlace);
      expect(updatedState.recentSearches[0]).toEqual(mockPlace);
    });

    it('should clear recent searches', () => {
      const { addToRecentSearches, clearRecentSearches } = useNavigationStore.getState();
      
      // Add some searches first
      act(() => {
        addToRecentSearches(mockPlace);
        addToRecentSearches(mockDestination);
      });

      let state = useNavigationStore.getState();
      expect(state.recentSearches.length).toBe(2);

      // Clear them
      act(() => {
        clearRecentSearches();
      });

      state = useNavigationStore.getState();
      expect(state.recentSearches).toEqual([]);
    });
  });

  describe('Favorites Management', () => {
    it('should add to favorites', () => {
      const { addToFavorites } = useNavigationStore.getState();
      
      act(() => {
        addToFavorites(mockPlace);
      });

      const updatedState = useNavigationStore.getState();
      const addedPlace = updatedState.favorites.find(p => p.id === mockPlace.id);
      expect(addedPlace).toBeTruthy();
      expect(addedPlace?.isFavorite).toBe(true);
    });

    it('should not add duplicate favorites', () => {
      const { addToFavorites } = useNavigationStore.getState();
      
      act(() => {
        addToFavorites(mockPlace);
        addToFavorites(mockPlace); // Try to add again
      });

      const updatedState = useNavigationStore.getState();
      const favoritesWithSameId = updatedState.favorites.filter(p => p.id === mockPlace.id);
      expect(favoritesWithSameId).toHaveLength(1);
    });

    it('should remove from favorites', () => {
      const { addToFavorites, removeFromFavorites } = useNavigationStore.getState();
      
      // Add to favorites first
      act(() => {
        addToFavorites(mockPlace);
      });

      let state = useNavigationStore.getState();
      expect(state.favorites.some(p => p.id === mockPlace.id)).toBe(true);

      // Remove from favorites
      act(() => {
        removeFromFavorites(mockPlace.id);
      });

      state = useNavigationStore.getState();
      expect(state.favorites.some(p => p.id === mockPlace.id)).toBe(false);
    });
  });

  describe('Accessibility Settings', () => {
    it('should update accessibility settings', () => {
      const { updateAccessibilitySettings } = useNavigationStore.getState();
      
      act(() => {
        updateAccessibilitySettings({
          largeText: true,
          highContrast: true,
        });
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.accessibilitySettings.largeText).toBe(true);
      expect(updatedState.accessibilitySettings.highContrast).toBe(true);
      expect(updatedState.accessibilitySettings.voiceDescriptions).toBe(false); // Should remain unchanged
    });
  });

  describe('Weather Info', () => {
    it('should set weather information', () => {
      const { setWeatherInfo } = useNavigationStore.getState();
      const weatherInfo = {
        temperature: 22,
        condition: 'sunny',
        humidity: 65,
      };
      
      act(() => {
        setWeatherInfo(weatherInfo);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.weatherInfo).toEqual(weatherInfo);
    });
  });
});
