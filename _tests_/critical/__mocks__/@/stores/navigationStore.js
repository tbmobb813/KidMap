/* eslint-env jest */
// Mock for @/stores/navigationStore
const { fn } = require('jest-mock');

const mockStoreState = {
    favorites: [],
    currentLocation: null,
    destination: null,
    isNavigating: false,
    addToFavorites: fn(),
    removeFromFavorites: fn(),
    setDestination: fn(),
    setCurrentLocation: fn(),
    startNavigation: fn(),
    stopNavigation: fn()
};

const mockUseNavigationStore = fn().mockReturnValue(mockStoreState);

// Add getState method for persistence tests
mockUseNavigationStore.getState = fn().mockReturnValue(mockStoreState);

module.exports = {
    useNavigationStore: mockUseNavigationStore,
    __mockUseNavigationStore: mockUseNavigationStore,
};