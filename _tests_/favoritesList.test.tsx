import { waitFor } from '@testing-library/react-native';
import React from 'react';

import { render } from './testUtils';

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
jest.mock('@/components/UserStatsCard', () => {
  const C = () => null; C.displayName = 'MockUserStatsCard'; return C;
});
jest.mock('@/components/RegionalFunFactCard', () => {
  const C = () => null; C.displayName = 'MockRegionalFunFactCard'; return C;
});
jest.mock('@/components/WeatherCard', () => { const C = () => null; C.displayName = 'MockWeatherCard'; return C; });
jest.mock('@/components/AIJourneyCompanion', () => { const C = () => null; C.displayName = 'MockAIJourneyCompanion'; return C; });
jest.mock('@/components/VirtualPetCompanion', () => { const C = () => null; C.displayName = 'MockVirtualPetCompanion'; return C; });
jest.mock('@/components/SmartRouteSuggestions', () => { const C = () => null; C.displayName = 'MockSmartRouteSuggestions'; return C; });
jest.mock('@/modules/safety/components/SafetyPanel', () => { const C = () => null; C.displayName = 'MockSafetyPanel'; return C; });
jest.mock('@/components/SearchWithSuggestions', () => { const C = () => null; C.displayName = 'MockSearchWithSuggestions'; return C; });
jest.mock('@/components/CategoryButton', () => { const C = () => null; C.displayName = 'MockCategoryButton'; return C; });
jest.mock('@/components/PlaceCard', () => {
  const C = ({ place }: any) => {
    const ReactNative = require('react-native');
    const View = ReactNative.View; const Text = ReactNative.Text;
    return <View testID={`place-card-${place.id}`}><Text>{place.name}</Text></View>;
  };
  C.displayName = 'MockPlaceCard';
  return C;
});
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
    }, { timeout: 10000 });
  });
});
