/**
 * HomeScreen (main tab) for KidMap app.
 * Displays search, categories, fun facts, weather, and user stats.
 * Uses modular components for each section.
 */
import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import PlaceCard from "@/components/PlaceCard";
import CategoryButton from "@/components/CategoryButton";
import SafetyPanel from "@/components/SafetyPanel";
import RegionalFunFactCard from "@/components/RegionalFunFactCard";
import UserStatsCard from "@/components/UserStatsCard";
import WeatherCard from "@/components/WeatherCard";
import PhotoCheckInButton from "@/components/PhotoCheckInButton";
import EmptyState from "@/components/EmptyState";
import PullToRefresh from "@/components/PullToRefresh";
import { useNavigationStore } from "@/stores/navigationStore";
import { PlaceCategory, Place } from "@/types/navigation";
import { MapPin, Navigation } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";
import { useGamificationStore } from "@/stores/gamificationStore";
import { useRegionalData } from "@/hooks/useRegionalData";
import { trackScreenView, trackUserAction } from "@/utils/analytics";

/**
 * Type for search suggestions in the search bar.
 */
type SearchSuggestion = {
export default function HomeScreen() {
  const router = useRouter();
  // Get current user location
  const { location } = useLocation();
  // State for search bar
  const [searchQuery, setSearchQuery] = useState("");
  // Show/hide fun fact card
  const [showFunFact, setShowFunFact] = useState(true);
  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);
  // Sample error toast state
  const [toastVisible, setToastVisible] = useState(false);

  const { 
    favorites, 
    setDestination,
    addToRecentSearches,
    recentSearches
  } = useNavigationStore();

  const { userStats, completeTrip } = useGamificationStore();
  const { formatters, regionalContent, currentRegion } = useRegionalData();

  React.useEffect(() => {
    trackScreenView('home');
  }, []);

  // Mock weather data with regional formatting
  const mockWeather = {
    condition: "Sunny",
    temperature: 72,
    recommendation: `Perfect weather for exploring ${currentRegion.name}! Don't forget sunscreen.`
  };

  // Generate search suggestions
  const suggestions: SearchSuggestion[] = React.useMemo(() => {
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
    
    return searchSuggestions;
  }, [searchQuery, recentSearches, favorites]);

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    addToRecentSearches(place);
    router.push({ pathname: "/route/[id]", params: { id: place.id } });
  };

  const handleCategorySelect = (category: PlaceCategory) => {
    trackUserAction('select_category', { category });
    router.push({
      pathname: "/search",
      params: { category }
    });
  };

  const handleCurrentLocation = () => {
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

  // Sample function to trigger an error toast
  const triggerErrorToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      {/* Sample error toast */}
      <Toast
        message="Something went wrong! This is a sample error toast."
        type="error"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
      {/* Button to trigger error toast for demonstration */}
      <AccessibleButton
        title="Show Error Toast"
        onPress={triggerErrorToast}
        style={{ margin: 16 }}
        variant="outline"
      />
      <View style={styles.container}>
    
    return searchSuggestions;
  }, [searchQuery, recentSearches, favorites, regionalContent.popularPlaces, currentRegion]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    trackUserAction('pull_to_refresh', { screen: 'home' });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      trackUserAction('search', { query: searchQuery });
      router.push("/search");
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    addToRecentSearches(place);
    completeTrip("Current Location", place.name);
    trackUserAction('select_place', { place_name: place.name, place_category: place.category });
    router.push("/map");
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.place) {
      handlePlaceSelect(suggestion.place);
    }
  };

  const handleCategorySelect = (category: PlaceCategory) => {
    trackUserAction('select_category', { category });
    router.push({
      pathname: "/search",
      params: { category }
    });
  };

  const handleCurrentLocation = () => {
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
        <UserStatsCard stats={userStats} />
        
        <WeatherCard weather={mockWeather} />
        
        {showFunFact && (
          <RegionalFunFactCard 
            onDismiss={() => setShowFunFact(false)}
          />
        )}

        <SafetyPanel currentLocation={location} />

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
          {categories.map((category) => (
            <CategoryButton
              key={category}
              category={category}
              onPress={handleCategorySelect}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Favorites</Text>
        {favorites.length > 0 ? (
          favorites.map((place) => (
            <View key={place.id}>
              <PlaceCard
                place={place}
                onPress={handlePlaceSelect}
              />
              <PhotoCheckInButton 
                placeName={place.name}
                placeId={place.id}
              />
            </View>
          ))
        ) : (
          <EmptyState
            icon={MapPin}
            title="No favorites yet"
            description={`Add places you visit often in ${currentRegion.name} to see them here`}
            actionText="Search Places"
            onAction={() => router.push("/search")}
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
});
