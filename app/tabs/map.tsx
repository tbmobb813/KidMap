import React, { useEffect, useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Dimensions, Platform, FlatList, ListRenderItem } from "react-native";
import { nav } from "@/shared/navigation/nav";
import Colors from "@/constants/colors";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteCard from "@/components/RouteCard";
import SafetyPanel from "@/modules/safety/components/SafetyPanel";
import FeatureErrorBoundary from "@/components/FeatureErrorBoundary";
import TravelModeSelector from "@/components/TravelModeSelector";
import { useNavigationStore } from "@/stores/navigationStore";
import { useRoutesQuery } from '@/hooks/useRoutesQuery';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Route } from "@/types/navigation";
import { Navigation, MapPin, Search } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";
import { mark, measure } from "@/utils/performanceMarks";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MapScreen() {
  const { location, hasLocation } = useLocation();
  
  const { 
    origin,
    destination,
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

  const routesToShow = destination ? queryRoutes : [];
  const firstPaintDone = useRef(false);

  useEffect(() => {
    if (!firstPaintDone.current && destination && routesToShow.length > 0) {
      firstPaintDone.current = true;
      const keyId = `${origin?.id || 'origin'}->${destination.id}:${selectedTravelMode}`;
      mark(`routes_first_paint:${keyId}`);
      measure(`routes_time_to_first_paint:${keyId}`, `routes_fetch_start:${keyId}`, `routes_first_paint:${keyId}`);
    }
  }, [routesToShow.length, destination, origin?.id, selectedTravelMode]);

  const handleRouteSelect = useCallback((route: Route) => {
    selectRoute(route);
    nav.push("/route/:id", { id: route.id });
  }, [selectRoute]);

  const handleSearchPress = useCallback(() => {
    nav.push("/search");
  }, []);

  const renderRoute: ListRenderItem<Route> = useCallback(({ item }) => (
    <RouteCard
      route={item}
      onPress={handleRouteSelect}
      isSelected={selectedRoute?.id === item.id}
    />
  ), [handleRouteSelect, selectedRoute?.id]);

  const listHeader = useMemo(() => (
    <>
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
          currentPlace={destination ? { id: destination.id, name: destination.name } : undefined}
        />
      </FeatureErrorBoundary>
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
          <Pressable style={styles.locationButton} onPress={handleSearchPress}>
            <Text style={[styles.locationText, !destination && styles.placeholderText]} numberOfLines={1}>
              {destination?.name || "Where to?"}
            </Text>
            {!destination && (
              <Search size={16} color={Colors.textLight} style={styles.searchIcon} />
            )}
          </Pressable>
        </View>
      </View>
      {destination && (
        <>
          <TravelModeSelector selectedMode={selectedTravelMode} onModeChange={setTravelMode} />
          <Text style={styles.sectionTitle}>Available Routes</Text>
          {isFetching && routesToShow.length === 0 && (
            <View style={styles.loadingContainer}><LoadingSpinner size="small" /></View>
          )}
          {!isFetching && routesToShow.length === 0 && (
            <Text style={styles.noRoutesText}>No routes found. Try a different travel mode.</Text>
          )}
        </>
      )}
      {!destination && (
        <View style={styles.emptyStateContainer}>
          <MapPin size={40} color={Colors.textLight} />
          <Text style={styles.emptyStateText}>Select a destination to see available routes</Text>
          <Pressable style={styles.searchButton} onPress={handleSearchPress}>
            <Text style={styles.searchButtonText}>Search Places</Text>
          </Pressable>
        </View>
      )}
    </>
  ), [destination, location, origin, selectedTravelMode, setTravelMode, handleSearchPress, routesToShow.length, isFetching]);

  return (
    <FlatList
      data={destination ? routesToShow : []}
      keyExtractor={(item) => item.id}
      renderItem={renderRoute}
      ListHeaderComponent={listHeader}
      contentContainerStyle={styles.listContent}
      style={styles.container}
      testID="routes-list"
      initialNumToRender={5}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 32,
    minHeight: screenHeight,
    paddingHorizontal: 16,
  },
  mapContainer: {
    height: Platform.select({
      web: Math.min(screenHeight * 0.4, 400),
      default: Math.min(screenHeight * 0.35, 300),
    }),
    minHeight: 250,
  },
  routesContainer: {
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 8,
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
