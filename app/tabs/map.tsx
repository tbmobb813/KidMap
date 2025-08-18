import { Navigation, MapPin, Search } from "lucide-react-native";
import React, { useEffect, useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Dimensions, Platform, FlatList, ListRenderItem } from "react-native";

import FeatureErrorBoundary from "@/components/FeatureErrorBoundary";
import LoadingSpinner from '@/components/LoadingSpinner';
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteCard from "@/components/RouteCard";
import TravelModeSelector from "@/components/TravelModeSelector";
import { useTheme } from "@/constants/theme";
import useLocation from "@/hooks/useLocation";
import { useRoutePrefetch } from '@/hooks/useRoutePrefetch';
import { useRoutesQuery } from '@/hooks/useRoutesQuery';
import SafetyPanel from "@/modules/safety/components/SafetyPanel";
import { nav } from "@/shared/navigation/nav";
import { useNavigationStore } from "@/stores/navigationStore";
import { Route } from "@/types/navigation";
import { mark, measure } from "@/utils/performanceMarks";

const { height: screenHeight } = Dimensions.get('window');

export default function MapScreen() {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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

  // Kick off background prefetch of alternate travel mode routes
  useRoutePrefetch();

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
  }, [hasLocation, location.latitude, location.longitude, origin, setOrigin]);

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

  const listHeader = useMemo(() => {
    // styles object stable due to memo in parent, safe to ignore exhaustive deps
    return <>
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
              <Search size={16} color={theme.colors.textSecondary} style={styles.searchIcon} />
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
          <MapPin size={40} color={theme.colors.textSecondary} />
          <Text style={styles.emptyStateText}>Select a destination to see available routes</Text>
          <Pressable style={styles.searchButton} onPress={handleSearchPress}>
            <Text style={styles.searchButtonText}>Search Places</Text>
          </Pressable>
        </View>
      )}
    </>;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, selectedTravelMode, setTravelMode, handleSearchPress, routesToShow.length, isFetching]);

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
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  destinationPin: {
    backgroundColor: theme.colors.secondary,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    padding: 32,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: 24,
    marginTop: 16,
    textAlign: "center",
  },
  listContent: {
    minHeight: screenHeight,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 8,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    paddingVertical: 8,
  },
  locationBar: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 16,
    padding: 16,
  },
  locationButton: {
    justifyContent: "center",
    paddingVertical: 8,
  },
  locationConnector: {
    backgroundColor: theme.colors.border,
    height: 24,
    width: 2,
  },
  locationPin: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  locationPins: {
    alignItems: "center",
    marginRight: 16,
  },
  locationText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  locationTexts: {
    flex: 1,
  },
  mapContainer: {
    height: Platform.select({
      web: Math.min(screenHeight * 0.4, 400),
      default: Math.min(screenHeight * 0.35, 300),
    }),
    minHeight: 250,
  },
  noRoutesText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  originPin: {
    backgroundColor: theme.colors.primary,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  routesContainer: {
    gap: 12,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  searchIcon: {
    position: "absolute",
    right: 0,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
});
