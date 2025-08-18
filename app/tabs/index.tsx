import { MapPin, Navigation } from "lucide-react-native";
import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";

import AIJourneyCompanion from "@/components/AIJourneyCompanion";
import CategoryButton from "@/components/CategoryButton";
import EmptyState from "@/components/EmptyState";
import FeatureErrorBoundary from "@/components/FeatureErrorBoundary";
import PlaceCard from "@/components/PlaceCard";
import PullToRefresh from "@/components/PullToRefresh";
import RegionalFunFactCard from "@/components/RegionalFunFactCard";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import SmartRouteSuggestions from "@/components/SmartRouteSuggestions";
import UserStatsCard from "@/components/UserStatsCard";
import VirtualPetCompanion from "@/components/VirtualPetCompanion";
import WeatherCard from "@/components/WeatherCard";
import Colors from "@/constants/colors";
import useLocation from "@/hooks/useLocation";
import { useRegionalData } from "@/hooks/useRegionalData";
import SafetyPanel from "@/modules/safety/components/SafetyPanel";
import { SafeZoneIndicator } from "@/modules/safety/components/SafeZoneIndicator";
import { nav } from "@/shared/navigation/nav";
import { useCategoryStore } from "@/stores/categoryStore";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useNavigationStore } from "@/stores/navigationStore";
import { PlaceCategory, Place } from "@/types/navigation";
import { trackScreenView, trackUserAction } from "@/utils/analytics";

type SearchSuggestion = {
  id: string;
  text: string;
  type: "recent" | "popular" | "place";
  place?: Place;
};

export default function HomeScreen() {
  const { location, hasLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFunFact, setShowFunFact] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>(undefined);
  const [showPetCompanion, setShowPetCompanion] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Place | undefined>(undefined);
  
  const { 
    favorites, 
    setDestination,
    addToRecentSearches,
    recentSearches
  } = useNavigationStore();

  const { userStats, completeTrip } = useGamificationStore();
  const { regionalContent, currentRegion } = useRegionalData();
  const { getApprovedCategories } = useCategoryStore();
  
  const approvedCategories = getApprovedCategories();

  useEffect(() => {
    trackScreenView('home');
  }, []);

  // Mock weather data with regional formatting
  const mockWeather = {
    condition: "Sunny",
    temperature: 72,
    recommendation: `Perfect weather for exploring ${currentRegion.name}! Don't forget sunscreen.`
  };

  // Generate search suggestions
  const suggestions: SearchSuggestion[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const searchSuggestions: SearchSuggestion[] = [];
    
    // Add recent searches
    recentSearches.forEach(place => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchSuggestions.push({
          id: `recent-${place.id}`,
          text: place.name,
          type: "recent",
          place,
        });
      }
    });
    
    // Add favorites
    favorites.forEach(place => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchSuggestions.push({
          id: `favorite-${place.id}`,
          text: place.name,
          type: "place",
          place,
        });
      }
    });
    
    // Add regional popular places
    regionalContent.popularPlaces.forEach((place, index) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchSuggestions.push({
          id: `popular-${index}`,
          text: place.name,
          type: "popular",
          place: {
            id: `popular-${index}`,
            name: place.name,
            address: place.description,
            category: place.category as PlaceCategory,
            coordinates: {
              latitude: currentRegion.coordinates.latitude + (Math.random() - 0.5) * 0.01,
              longitude: currentRegion.coordinates.longitude + (Math.random() - 0.5) * 0.01,
            }
          },
        });
      }
    });
    
    return searchSuggestions;
  }, [searchQuery, recentSearches, favorites, regionalContent.popularPlaces, currentRegion]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    trackUserAction('pull_to_refresh', { screen: 'home' });
  };

  nav.push("/search");

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    setSelectedDestination(place);
    setIsNavigating(true);
    addToRecentSearches(place);
    completeTrip("Current Location", place.name);
    trackUserAction('select_place', { place_name: place.name, place_category: place.category });
  nav.push("/map");
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.place) {
      handlePlaceSelect(suggestion.place);
    }
  };

  const handleCategorySelect = (categoryId: PlaceCategory | string) => {
    trackUserAction('select_category', { category: categoryId });
  nav.push("/search", { category: String(categoryId) });
  };

  const handleCurrentLocation = () => {
    if (!hasLocation) return; // Guard against unavailable location
    const currentPlace = {
      id: "current-location",
      name: "Current Location",
      address: "Your current position",
      category: "other" as PlaceCategory,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    };
    trackUserAction('use_current_location');
    handlePlaceSelect(currentPlace);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <View style={styles.container}>
        <UserStatsCard 
          stats={userStats} 
          onPetClick={() => setShowPetCompanion(true)}
        />
        
        <SafeZoneIndicator />
        
        <WeatherCard weather={mockWeather} />
        
        {showFunFact && (
          <RegionalFunFactCard 
            onDismiss={() => setShowFunFact(false)}
          />
        )}

        <AIJourneyCompanion 
          currentLocation={location}
          destination={selectedDestination}
          isNavigating={isNavigating}
        />

        {selectedDestination && (
          <SmartRouteSuggestions
            destination={selectedDestination}
            _currentLocation={location}
            timeOfDay={new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            onSelectRoute={(suggestion) => {
              console.log('Selected route:', suggestion);
              trackUserAction('select_smart_route', { route_type: suggestion.type });
            }}
          />
        )}

        <FeatureErrorBoundary>
          <SafetyPanel 
            currentLocation={location} 
            currentPlace={selectedPlace ? {
              id: selectedPlace.id,
              name: selectedPlace.name
            } : undefined}
          />
        </FeatureErrorBoundary>

        <View style={styles.searchContainer}>
          <SearchWithSuggestions
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSelectSuggestion={handleSuggestionSelect}
            suggestions={suggestions}
            placeholder={`Where do you want to go in ${currentRegion.name}?`}
          />
          <Pressable 
            style={styles.currentLocationButton}
            onPress={handleCurrentLocation}
          >
            <Navigation size={20} color={Colors.primary} />
            <Text style={styles.currentLocationText}>Use my location</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {approvedCategories.map((category) => (
            <CategoryButton
              key={category.id}
              customCategory={category}
              onPress={handleCategorySelect}
              size="large"
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Favorites</Text>
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                onPress={(selectedPlace) => {
                  setSelectedPlace(selectedPlace);
                  handlePlaceSelect(selectedPlace);
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.favoriteSeparator} />}
            initialNumToRender={6}
            windowSize={8}
            removeClippedSubviews
            contentContainerStyle={styles.favoritesListContent}
            testID="favorites-list"
          />
        ) : (
          <EmptyState
            icon={MapPin}
            title="No favorites yet"
            description={`Add places you visit often in ${currentRegion.name} to see them here`}
            actionText="Search Places"
            onAction={() => nav.push("/search")}
          />
        )}

        <VirtualPetCompanion 
          visible={showPetCompanion}
          onClose={() => setShowPetCompanion(false)}
        />
      </View>
    </PullToRefresh>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  currentLocationButton: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
    paddingVertical: 8,
  },
  currentLocationText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  favoriteSeparator: {
    height: 12,
  },
  favoritesListContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});
