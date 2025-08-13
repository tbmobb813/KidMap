import { useLocalSearchParams } from "expo-router";
import { MapPin } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";

import PlaceCard from "@/components/PlaceCard";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/constants/theme";
import { favoriteLocations, recentSearches } from "@/mocks/places";
import { nav } from '@/shared/navigation/nav';
import { useNavigationStore } from "@/stores/navigationStore";
import { Place, PlaceCategory } from "@/types/navigation";

// Mock search results based on query or category
const getMockSearchResults = (query: string, category?: PlaceCategory): Place[] => {
  // Combine favorites and recent searches for the mock data pool
  const allPlaces = [...favoriteLocations, ...recentSearches];
  
  if (category) {
    return allPlaces.filter(place => place.category === category);
  }
  
  if (!query.trim()) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  return allPlaces.filter(
    place => 
      place.name.toLowerCase().includes(lowerQuery) || 
      place.address.toLowerCase().includes(lowerQuery)
  );
};

export default function SearchScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const category = params.category as PlaceCategory;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  
  const { 
    recentSearches: storedRecentSearches,
    setDestination,
    addToRecentSearches
  } = useNavigationStore();

  useEffect(() => {
    // If category is provided, search by category
    if (category) {
      setSearchResults(getMockSearchResults("", category));
    }
  }, [category]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setSearchResults(getMockSearchResults(text, category));
  };

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    addToRecentSearches(place);
  nav.back();
  };

  return (
  <View style={[styles.container,{ backgroundColor: theme.colors.background }] }>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => {
            setSearchQuery("");
            setSearchResults([]);
          }}
          placeholder={
            category 
              ? `Search ${category} places...` 
              : "Search for a place..."
          }
        />
      </View>

      {searchQuery.length === 0 && !category && storedRecentSearches.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {storedRecentSearches.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              onPress={handlePlaceSelect}
            />
          ))}
        </>
      )}

      {searchResults.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            {category 
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Places` 
              : "Search Results"}
          </Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaceCard place={item} onPress={handlePlaceSelect} />
            )}
            contentContainerStyle={styles.resultsList}
          />
        </>
      ) : (
        searchQuery.length > 0 && (
          <View style={styles.emptyStateContainer}>
            <MapPin size={40} color={theme.colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              No places found for &quot;{searchQuery}&quot;
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyStateContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  resultsList: {
    paddingBottom: 16,
  },
  searchContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
});
