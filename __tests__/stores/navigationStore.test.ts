// __tests__/stores/navigationStore.test.ts - Navigation store tests
import { act } from '@testing-library/react-native';
import { useNavigationStore } from '@/stores/navigationStore';
import { 
  mockPlaces, 
  mockRoutes, 
  createMockPlace, 
  createMockRoute
} from '../helpers/mockTripData';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => 
  require('../helpers/mockAsyncStorage').createAsyncStorageMock()
);

// Mock API calls
jest.mock('@/utils/api', () => ({
  fetchRoute: jest.fn(),
  geocodeAddress: jest.fn(),
  reverseGeocode: jest.fn(),
}));

describe('Navigation Store', () => {
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
      const testOrigin = mockPlaces[0];
      const { setOrigin } = useNavigationStore.getState();
      
      act(() => {
        setOrigin(testOrigin);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.origin).toEqual(testOrigin);
    });

    it('should set and get destination', () => {
      const testDestination = mockPlaces[1];
      const { setDestination } = useNavigationStore.getState();
      
      act(() => {
        setDestination(testDestination);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.destination).toEqual(testDestination);
    });

    it('should clear origin and destination', () => {
      const { setOrigin, setDestination, clearRoute } = useNavigationStore.getState();
      
      // Set some values first
      act(() => {
        setOrigin(mockPlaces[0]);
        setDestination(mockPlaces[1]);
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
        setOrigin(mockPlaces[0]);
        setDestination(mockPlaces[1]);
        findRoutes();
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.availableRoutes.length).toBeGreaterThan(0);
      expect(updatedState.selectedRoute).toBeTruthy();
    });

    it('should select a route', () => {
      const { setOrigin, setDestination, findRoutes, selectRoute } = useNavigationStore.getState();
      
      act(() => {
        setOrigin(mockPlaces[0]);
        setDestination(mockPlaces[1]);
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

    it('should clear routes', () => {
      const { setOrigin, setDestination, findRoutes, clearRoute } = useNavigationStore.getState();
      
      // Set some routes first
      act(() => {
        setOrigin(mockPlaces[0]);
        setDestination(mockPlaces[1]);
        findRoutes();
      });

      // Clear them
      act(() => {
        clearRoute();
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.availableRoutes).toEqual([]);
      expect(updatedState.selectedRoute).toBeNull();
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
      const testPlace = mockPlaces[0];
      
      act(() => {
        addToRecentSearches(testPlace);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.recentSearches).toContainEqual(testPlace);
      expect(updatedState.recentSearches[0]).toEqual(testPlace);
    });

    it('should clear recent searches', () => {
      const { addToRecentSearches, clearRecentSearches } = useNavigationStore.getState();
      
      // Add some searches first
      act(() => {
        addToRecentSearches(mockPlaces[0]);
        addToRecentSearches(mockPlaces[1]);
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

    it('should limit recent searches to 5 items', () => {
      const { addToRecentSearches } = useNavigationStore.getState();
      
      // Add 6 places
      act(() => {
        for (let i = 0; i < 6; i++) {
          const place = createMockPlace({
            id: `place-${i}`,
            name: `Place ${i}`,
          });
          addToRecentSearches(place);
        }
      });

      const state = useNavigationStore.getState();
      expect(state.recentSearches).toHaveLength(5);
      expect(state.recentSearches[0].name).toBe('Place 5'); // Most recent first
    });
  });

  describe('Favorites Management', () => {
    it('should add to favorites', () => {
      const { addToFavorites } = useNavigationStore.getState();
      const testPlace = mockPlaces[0];
      
      act(() => {
        addToFavorites(testPlace);
      });

      const updatedState = useNavigationStore.getState();
      const addedPlace = updatedState.favorites.find(p => p.id === testPlace.id);
      expect(addedPlace).toBeTruthy();
      expect(addedPlace?.isFavorite).toBe(true);
    });

    it('should not add duplicate favorites', () => {
      const { addToFavorites } = useNavigationStore.getState();
      const testPlace = mockPlaces[0];
      
      act(() => {
        addToFavorites(testPlace);
        addToFavorites(testPlace); // Try to add again
      });

      const updatedState = useNavigationStore.getState();
      const favoritesWithSameId = updatedState.favorites.filter(p => p.id === testPlace.id);
      expect(favoritesWithSameId).toHaveLength(1);
    });

    it('should remove from favorites', () => {
      const { addToFavorites, removeFromFavorites } = useNavigationStore.getState();
      const testPlace = mockPlaces[0];
      
      // Add to favorites first
      act(() => {
        addToFavorites(testPlace);
      });

      let state = useNavigationStore.getState();
      expect(state.favorites.some(p => p.id === testPlace.id)).toBe(true);

      // Remove from favorites
      act(() => {
        removeFromFavorites(testPlace.id);
      });

      state = useNavigationStore.getState();
      expect(state.favorites.some(p => p.id === testPlace.id)).toBe(false);
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

  describe('Photo Check-ins', () => {
    it('should add photo check-in', () => {
      const { addPhotoCheckIn } = useNavigationStore.getState();
      const checkIn = {
        placeId: mockPlaces[0].id,
        placeName: mockPlaces[0].name,
        photoUrl: 'file://test-photo.jpg',
        timestamp: new Date(),
        location: { latitude: 40.7589, longitude: -73.9851 },
      };
      
      act(() => {
        addPhotoCheckIn(checkIn);
      });

      const updatedState = useNavigationStore.getState();
      expect(updatedState.photoCheckIns).toHaveLength(1);
      expect(updatedState.photoCheckIns[0].placeId).toBe(checkIn.placeId);
      expect(updatedState.photoCheckIns[0].id).toBeTruthy(); // Should have generated ID
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

  describe('Complete Navigation Flow', () => {
    it('should handle complete navigation setup', () => {
      const { 
        setOrigin, 
        setDestination, 
        findRoutes,
        selectRoute,
        setWeatherInfo
      } = useNavigationStore.getState();
      
      const origin = mockPlaces[0];
      const destination = mockPlaces[1];
      const weather = { temperature: 20, condition: 'cloudy', humidity: 70 };

      // Set up complete navigation
      act(() => {
        setOrigin(origin);
        setDestination(destination);
        findRoutes();
        setWeatherInfo(weather);
      });

      let state = useNavigationStore.getState();
      const route = state.availableRoutes[0];

      act(() => {
        selectRoute(route);
      });

      const finalState = useNavigationStore.getState();
      expect(finalState.origin).toEqual(origin);
      expect(finalState.destination).toEqual(destination);
      expect(finalState.selectedRoute).toEqual(route);
      expect(finalState.weatherInfo).toEqual(weather);
    });
  });

  describe('State Persistence', () => {
    it('should maintain state consistency', () => {
      const testData = {
        origin: mockPlaces[0],
        destination: mockPlaces[1],
      };

      const { setOrigin, setDestination } = useNavigationStore.getState();
      
      act(() => {
        setOrigin(testData.origin);
        setDestination(testData.destination);
      });

      // Verify state persists across multiple reads
      const state1 = useNavigationStore.getState();
      const state2 = useNavigationStore.getState();
      
      expect(state1.origin).toEqual(state2.origin);
      expect(state1.destination).toEqual(state2.destination);
    });
  });
});
