import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import MapPlaceholder from "@/components/MapPlaceholder";
import RouteCard from "@/components/RouteCard";
import { useNavigationStore } from "@/stores/navigationStore";
import { Route } from "@/types/navigation";
import { Navigation, MapPin, Search } from "lucide-react-native";
import useLocation from "@/hooks/useLocation";

export default function MapScreen() {
  const router = useRouter();
  const { location } = useLocation();
  
  const { 
    origin,
    destination,
    availableRoutes,
    selectedRoute,
    setOrigin,
    findRoutes,
    selectRoute
  } = useNavigationStore();

  useEffect(() => {
    // If no origin is set, use current location
    if (!origin && location) {
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
  }, [location, origin]);

  useEffect(() => {
    // Find routes when both origin and destination are set
    if (origin && destination) {
      findRoutes();
    }
  }, [origin, destination]);

  const handleRouteSelect = (route: Route) => {
    selectRoute(route);
    router.push(`/route/${route.id}`);
  };

  const handleSearchPress = () => {
    router.push("/search");
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.sectionTitle}>Available Routes</Text>
            <ScrollView>
              {availableRoutes.map(route => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onPress={handleRouteSelect}
                  isSelected={selectedRoute?.id === route.id}
                />
              ))}
            </ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    height: 300,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
