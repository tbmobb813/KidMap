import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteCard from "@/components/RouteCard";
import { useNavigationStore } from "@/stores/navigationStore";
import { Route } from "@/types/navigation";
import { fetchRoute, TravelMode } from "@/utils/api";
import { Navigation, MapPin, Search } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function MapScreen() {
  const router = useRouter();
  const { location } = useLocation();

  const {
    origin,
    destination,
    availableRoutes,
    selectedRoute,
    setOrigin,
    setDestination,
    selectRoute,
    clearRoute,
  } = useNavigationStore();

  const [travelMode, setTravelMode] = useState<TravelMode>("walking");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin && location) {
      setOrigin({
        id: "current-location",
        name: "Current Location",
        address: "Your current position",
        category: "other",
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }
  }, [location, origin]);

  useEffect(() => {
    const fetchAndSetRoute = async () => {
      if (origin && destination) {
        setLoadingRoute(true);
        setRouteError(null);
        try {
          const from: [number, number] = [
            origin.coordinates.longitude,
            origin.coordinates.latitude,
          ];
          const to: [number, number] = [
            destination.coordinates.longitude,
            destination.coordinates.latitude,
          ];
          const routeResult = await fetchRoute(from, to, travelMode);

          if (routeResult) {
            const newRoute: Route = {
              id: `${travelMode}-${Date.now()}`,
              steps: [
                {
                  id: "main",
                  type:
                    travelMode === "walking" || travelMode === "cycling"
                      ? "walk"
                      : "bus",
                  from: origin.name,
                  to: destination.name,
                  duration: Math.round(routeResult.duration / 60),
                  departureTime: "",
                  arrivalTime: "",
                },
              ],
              totalDuration: Math.round(routeResult.duration / 60),
              departureTime: "",
              arrivalTime: "",
            };
            selectRoute(newRoute);
          } else {
            setRouteError("No route found.");
          }
        } catch (e) {
          setRouteError("Failed to fetch route.");
        } finally {
          setLoadingRoute(false);
        }
      }
    };
    fetchAndSetRoute();
  }, [origin, destination, travelMode]);

  const handleRouteSelect = (route: Route) => {
    selectRoute(route);
    router.push(`/route/${route.id}`);
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

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
                style={[styles.locationText, !destination && styles.placeholderText]}
                numberOfLines={1}
              >
                {destination?.name || "Where to?"}
              </Text>
              {!destination && (
                <Search
                  size={16}
                  color={Colors.textLight}
                  style={styles.searchIcon}
                />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.modeSelectorContainer}>
          {(["walking", "cycling", "transit", "driving"] as TravelMode[]).map(
            (mode) => (
              <Pressable
                key={mode}
                style={[styles.modeButton, travelMode === mode && styles.modeButtonActive]}
                onPress={() => setTravelMode(mode)}
              >
                <Text
                  style={[styles.modeButtonText, travelMode === mode && styles.modeButtonTextActive]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </Pressable>
            )
          )}
        </View>

        {destination ? (
          <>
            <Text style={styles.sectionTitle}>Route</Text>
            {loadingRoute ? (
              <Text style={styles.loadingText}>Loading route...</Text>
            ) : routeError ? (
              <Text style={styles.errorText}>{routeError}</Text>
            ) : selectedRoute ? (
              <RouteCard
                key={selectedRoute.id}
                route={selectedRoute}
                onPress={handleRouteSelect}
                isSelected={true}
              />
            ) : null}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <MapPin size={40} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>
              Select a destination to see available routes
            </Text>
            <Pressable style={styles.searchButton} onPress={handleSearchPress}>
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
  modeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  modeButton: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeButtonText: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  loadingText: {
    color: Colors.textLight,
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
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
