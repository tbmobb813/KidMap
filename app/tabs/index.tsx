import React, { useState, useEffect, useMemo } from 'react';
import { Linking, Platform, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Navigation } from 'lucide-react-native';
import Colors from '@/constants/colors';
import SearchWithSuggestions from '@/components/SearchWithSuggestions';
import PlaceCard from '@/components/PlaceCard';
import CategoryButton from '@/components/CategoryButton';
import SafetyPanel from '@/components/SafetyPanel';
import RegionalFunFactCard from '@/components/RegionalFunFactCard';
import UserStatsCard from '@/components/UserStatsCard';
import WeatherCard from '@/components/WeatherCard';
import PhotoCheckInButton from '@/components/PhotoCheckInButton';
import EmptyState from '@/components/EmptyState';
import PullToRefresh from '@/components/PullToRefresh';
import Toast from '@/components/Toast';
import AccessibleButton from '@/components/AccessibleButton';
import { useGeofencing } from '@/hooks/useGeofencing';
import useLocation from '@/hooks/useLocation';
import { useRegionalData } from '@/hooks/useRegionalData';
import { useNavigationStore } from '@/stores/navigationStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
  sendLocalNotification,
  requestNotificationPermissions,
  configureNotificationHandler,
} from '@/utils/notifications';
import { trackScreenView, trackUserAction } from '@/utils/analytics';
import type { SearchSuggestion } from '@/components/SearchWithSuggestions';
import type { PlaceCategory, Place } from '@/types/navigation';

export default function HomeScreen() {
  const router = useRouter();
  const { location } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFunFact, setShowFunFact] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const { favorites, setDestination, addToRecentSearches, recentSearches } = useNavigationStore();
  const { userStats, completeTrip, safetyContacts } = useGamificationStore();
  const { formatters, regionalContent, currentRegion } = useRegionalData();

  useEffect(() => {
    configureNotificationHandler();
    requestNotificationPermissions();
    trackScreenView('home');
  }, []);

  useGeofencing((zoneId, event) => {
    const action = event === 'enter' ? 'entered' : 'exited';
    sendLocalNotification(`Safe Zone ${action}`, `You have ${action} a safe zone (${zoneId}).`);
    const primaryContact = safetyContacts?.find((c) => c.isPrimary);
    if (primaryContact && Platform.OS !== 'web') {
      const message = `Alert: Your child has ${action} safe zone (${zoneId}).`;
      Linking.openURL(`sms:${primaryContact.phone}&body=${encodeURIComponent(message)}`);
    }
  });

  const mockWeather = {
    condition: 'Sunny',
    temperature: 72,
    recommendation: `Perfect weather for exploring ${currentRegion.name}! Don't forget sunscreen.`,
  };

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const result: SearchSuggestion[] = [];

    recentSearches.forEach((place) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        result.push({ id: `recent-${place.id}`, text: place.name, type: 'recent', place });
      }
    });

    favorites.forEach((place) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        result.push({ id: `favorite-${place.id}`, text: place.name, type: 'place', place });
      }
    });

    return result;
  }, [searchQuery, recentSearches, favorites]);

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    addToRecentSearches(place);
    router.push({ pathname: '/route/[id]', params: { id: place.id } });
  };

  const handleCategorySelect = (category: PlaceCategory) => {
    trackUserAction('select_category', { category });
    router.push({ pathname: '/search', params: { category } });
  };

  const handleCurrentLocation = () => {
    const currentPlace: Place = {
      id: 'current-location',
      name: 'Current Location',
      address: 'Your current position',
      category: 'other',
      coordinates: { latitude: location.latitude, longitude: location.longitude },
    };
    trackUserAction('use_current_location');
    handlePlaceSelect(currentPlace);
  };

  const triggerErrorToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const categories: PlaceCategory[] = [
    'park',
    'museum',
    'playground',
    'zoo',
    'aquarium',
    'library',
    'other',
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      setToastVisible(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.place) {
      handlePlaceSelect(suggestion.place);
    } else {
      setToastVisible(true);
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <Toast
        message="Something went wrong! This is a sample error toast."
        type="error"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <AccessibleButton
        title="Show Error Toast"
        onPress={triggerErrorToast}
        style={{ margin: 16 }}
        variant="outline"
      />

      <View style={styles.container}>
        <UserStatsCard stats={userStats} />

        <WeatherCard weather={mockWeather} />

        {showFunFact && <RegionalFunFactCard onDismiss={() => setShowFunFact(false)} />}

        <SafetyPanel currentLocation={location} />

        <View style={styles.searchContainer}>
          <SearchWithSuggestions
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSelectSuggestion={handleSuggestionSelect}
            suggestions={suggestions}
            placeholder={`Where do you want to go in ${currentRegion.name}?`}
          />
          <Pressable style={styles.currentLocationButton} onPress={handleCurrentLocation}>
            <Navigation size={20} color={Colors.primary} />
            <Text style={styles.currentLocationText}>Use my location</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <CategoryButton key={category} category={category} onPress={handleCategorySelect} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Favorites</Text>
        {favorites.length > 0 ? (
          favorites.map((place) => (
            <View key={place.id}>
              <PlaceCard place={place} onPress={handlePlaceSelect} />
              <PhotoCheckInButton
                placeName={place.name}
                placeId={place.id}
                placeLat={place.coordinates.latitude}
                placeLng={place.coordinates.longitude}
              />
            </View>
          ))
        ) : (
          <EmptyState
            icon={MapPin}
            title="No favorites yet"
            description={`Add places you visit often in ${currentRegion.name} to see them here`}
            actionText="Search Places"
            onAction={() => router.push('/search')}
          />
        )}
      </View>
    </PullToRefresh>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
});
