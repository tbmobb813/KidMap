import React, { useEffect, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from "react-native";
import { nav } from "@/shared/navigation/nav";
import Colors from "@/constants/colors";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteCard from "@/components/RouteCard";
import SafetyPanel from "@/modules/safety/components/SafetyPanel";
import FeatureErrorBoundary from "@/components/FeatureErrorBoundary";
import TravelModeSelector from "@/components/TravelModeSelector";
import { useNavigationStore } from "@/stores/navigationStore";
import { useRoutesQuery } from '@/src/hooks/useRoutesQuery';
import { Route } from "@/types/navigation";
import { Navigation, MapPin, Search } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MapScreen() {
  const { location, hasLocation } = useLocation();
  
  const { 
    origin,
    destination,
    availableRoutes, // legacy during transition
    selectedRoute,
    selectedTravelMode,
    setOrigin,
    selectRoute,
    setTravelMode
  } = useNavigationStore();

  const { data: queryRoutes = [], isFetching } = useRoutesQuery(origin, destination, selectedTravelMode, { travelMode: selectedTravelMode, avoidHighways: false, avoidTolls: false, accessibilityMode: false });

  useEffect(() => {
    // If no origin is set, use current location
    if (!origin && hasLocation) {
      setOrigin({
        id: "current-location",
        name: "Current Location",
        address: "Your current position",
        category: "other",
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      });
    }
  }, [hasLocation, location.latitude, location.longitude, origin]);

  // Legacy availableRoutes fallback; prefer query data
  const routesToShow = destination ? (queryRoutes.length ? queryRoutes : availableRoutes) : [];

  const handleRouteSelect = useCallback((route: Route) => {
    selectRoute(route);
    nav.push("/route/:id", { id: route.id });
  }, [selectRoute]);

  const handleSearchPress = useCallback(() => {
    nav.push("/search");
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.mapContainer}>
        <MapPlaceholder 
          message={
            destination 
              ? `Map showing route to ${destination.name}` 
              : "Select a destination to see the route"
          } 
        />
      </View>

      <FeatureErrorBoundary>
        <SafetyPanel 
          currentLocation={location} 
          currentPlace={destination ? {
            id: destination.id,
            name: destination.name
          } : undefined}
        />
      </FeatureErrorBoundary>

      <View style={styles.contentContainer}>
        <View style={styles.locationBar}>
          <View style={styles.locationPins}>
            <View style={[styles.locationPin, styles.originPin]}>
              <Navigation size={16} color="#FFFFFF" />
            </View>
            <View style={styles.locationConnector} />
            <View style={[styles.locationPin, styles.destinationPin]}>
              <MapPin size={16} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.locationTexts}>
            <Pressable style={styles.locationButton}>
              <Text style={styles.locationText} numberOfLines={1}>
                {origin?.name || "Select starting point"}
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.locationButton}
              onPress={handleSearchPress}
            >
              <Text 
                style={[
                  styles.locationText, 
                  !destination && styles.placeholderText
                ]} 
                numberOfLines={1}
              >
                {destination?.name || "Where to?"}
              </Text>
              {!destination && (
                <Search size={16} color={Colors.textLight} style={styles.searchIcon} />
              )}
            </Pressable>
          </View>
        </View>

        {destination ? (
          <>
            <TravelModeSelector 
              selectedMode={selectedTravelMode}
              onModeChange={setTravelMode}
            />
            <Text style={styles.sectionTitle}>Available Routes</Text>
            <View style={styles.routesContainer}>
              {isFetching && routesToShow.length === 0 && (
                <Text style={styles.loadingText}>Loading routes...</Text>
              )}
              {!isFetching && routesToShow.length === 0 && (
                <Text style={styles.noRoutesText}>No routes found. Try a different travel mode.</Text>
              )}
              {routesToShow.map((route: Route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onPress={handleRouteSelect}
                  isSelected={selectedRoute?.id === route.id}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <MapPin size={40} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>
              Select a destination to see available routes
            </Text>
            <Pressable 
              style={styles.searchButton}
              onPress={handleSearchPress}
            >
              <Text style={styles.searchButtonText}>Search Places</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: screenHeight,
  },
  mapContainer: {
    height: Platform.select({
      web: Math.min(screenHeight * 0.4, 400),
      default: Math.min(screenHeight * 0.35, 300),
    }),
    minHeight: 250,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
  },
  routesContainer: {
    gap: 12,
  },
  noRoutesText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textLight,
    paddingVertical: 8,
  },
  locationBar: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  locationPins: {
    alignItems: "center",
    marginRight: 16,
  },
  locationPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  originPin: {
    backgroundColor: Colors.primary,
  },
  destinationPin: {
    backgroundColor: Colors.secondary,
  },
  locationConnector: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
  },
  locationTexts: {
    flex: 1,
  },
  locationButton: {
    paddingVertical: 8,
    justifyContent: "center",
  },
  locationText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholderText: {
    color: Colors.textLight,
  },
  searchIcon: {
    position: "absolute",
    right: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 200,
  },
  emptyStateText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
