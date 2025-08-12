import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '@/app/tabs/index';

// Mock navigation store with favorites
jest.mock('@/stores/navigationStore', () => ({
  useNavigationStore: () => ({
    favorites: [
      { id: 'f1', name: 'Fav One', address: 'Addr 1', category: 'park', coordinates: { latitude: 0, longitude: 0 } },
      { id: 'f2', name: 'Fav Two', address: 'Addr 2', category: 'school', coordinates: { latitude: 0, longitude: 0 } },
      { id: 'f3', name: 'Fav Three', address: 'Addr 3', category: 'home', coordinates: { latitude: 0, longitude: 0 } },
    ],
    setDestination: () => {},
    addToRecentSearches: () => {},
    recentSearches: [],
  })
}));

// Mock other dependent hooks/stores/components to keep test minimal
jest.mock('@/hooks/useLocation', () => () => ({ location: { latitude:0, longitude:0 }, hasLocation: true }));
jest.mock('@/stores/gamificationStore', () => ({ useGamificationStore: () => ({ userStats: {}, completeTrip: () => {} }) }));
jest.mock('@/hooks/useRegionalData', () => ({ useRegionalData: () => ({ formatters: {}, regionalContent: { popularPlaces: [] }, currentRegion: { name: 'Region', coordinates: { latitude:0, longitude:0 } } }) }));
jest.mock('@/stores/categoryStore', () => ({ useCategoryStore: () => ({ getApprovedCategories: () => [] }) }));
jest.mock('@/modules/safety/components/SafeZoneIndicator', () => ({ SafeZoneIndicator: () => null }));
jest.mock('@/components/UserStatsCard', () => () => null);
jest.mock('@/components/RegionalFunFactCard', () => () => null);
jest.mock('@/components/WeatherCard', () => () => null);
jest.mock('@/components/AIJourneyCompanion', () => () => null);
jest.mock('@/components/VirtualPetCompanion', () => () => null);
jest.mock('@/components/SmartRouteSuggestions', () => () => null);
jest.mock('@/modules/safety/components/SafetyPanel', () => () => null);
jest.mock('@/components/SearchWithSuggestions', () => () => null);
jest.mock('@/components/CategoryButton', () => () => null);
jest.mock('@/components/PlaceCard', () => ({ place }: any) => <>{place.name}<div testID={`place-card-${place.id}`}></div></>);
// Mock nav & analytics to avoid side-effects
jest.mock('@/shared/navigation/nav', () => ({ nav: { push: () => {}, back: () => {} } }));
jest.mock('@/utils/analytics', () => ({ trackScreenView: () => {}, trackUserAction: () => {} }));
jest.mock('@/components/EmptyState', () => () => null);
jest.mock('@/components/PullToRefresh', () => ({ children }: any) => children);

describe('Favorites list virtualization', () => {
  it('renders favorites via FlatList', async () => {
    const { getByTestId, queryByTestId } = render(<HomeScreen />);
    const list = getByTestId('favorites-list');
    expect(list).toBeTruthy();
    await waitFor(() => {
      expect(queryByTestId('place-card-f2')).toBeTruthy();
    });
  });
});
