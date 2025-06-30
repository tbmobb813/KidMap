import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import SearchBar from "@/components/SearchBar";
import PlaceCard from "@/components/PlaceCard";
import CategoryButton from "@/components/CategoryButton";
import { useNavigationStore } from "@/stores/navigationStore";
import { PlaceCategory, Place } from "@/types/navigation";
import { MapPin, Navigation } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";

const categories: PlaceCategory[] = [
  "home", "school", "park", "library", "store", "restaurant", "friend", "family"
];

export default function HomeScreen() {
  const router = useRouter();
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { 
    favorites, 
    setDestination,
    addToRecentSearches
  } = useNavigationStore();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push("/search");
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setDestination(place);
    addToRecentSearches(place);
    router.push("/map");
  };

  const handleCategorySelect = (category: PlaceCategory) => {
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
    
    handlePlaceSelect(currentPlace);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
          placeholder="Where do you want to go?"
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
          <PlaceCard
            key={place.id}
            place={place}
            onPress={handlePlaceSelect}
          />
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <MapPin size={40} color={Colors.textLight} />
          <Text style={styles.emptyStateText}>
            You don't have any favorite places yet
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  searchContainer: {
    marginBottom: 24,
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
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
  },
});
