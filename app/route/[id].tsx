import { useLocalSearchParams } from "expo-router";
import { Clock, Navigation, MapPin } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";

import DirectionStep from "@/components/DirectionStep";
import FeatureErrorBoundary from "@/components/FeatureErrorBoundary";
import FunFactCard from "@/components/FunFactCard";
import MapPlaceholder from "@/components/MapPlaceholder";
import VoiceNavigation from "@/components/VoiceNavigation";
import { useTheme } from "@/constants/theme";
import useLocation from "@/hooks/useLocation";
import { useRoutesQuery } from '@/hooks/useRoutesQuery';
import { getRandomFunFact } from "@/mocks/funFacts";
import SafetyPanel from "@/modules/safety/components/SafetyPanel";
import { nav } from '@/shared/navigation/nav';
import { useNavigationStore } from "@/stores/navigationStore";

export default function RouteDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const { location } = useLocation();

  const {
    origin,
    destination,
    selectedRoute
  } = useNavigationStore();
  const { data: queriedRoutes = [] } = useRoutesQuery(origin, destination, origin && destination ? 'transit' : 'transit', { travelMode: 'transit', avoidHighways: false, avoidTolls: false, accessibilityMode: false });

  // Narrow to string id (expo-router param can be string | string[] | undefined)
  const routeId = Array.isArray(id) ? id[0] : id;

  // Resolve the route deterministically
  const route = useMemo(() => {
    if (!routeId) return null;
    if (selectedRoute && selectedRoute.id === routeId) return selectedRoute;
    return queriedRoutes.find(r => r.id === routeId) || null;
  }, [routeId, selectedRoute, queriedRoutes]);

  // (S3-3) VoiceNavigation now handles formatting & sequencing internally

  const [showFunFact, setShowFunFact] = useState(true);
  const [currentFunFact] = useState(getRandomFunFact("subway"));

  // Unified guard ensures no unsafe property access below
  if (!route || !origin || !destination) {
    return (
    <View style={[styles.errorContainer,{ backgroundColor: theme.colors.background }] }>
        <Text style={styles.errorText}>Route not found</Text>
        <Pressable 
      style={[styles.backButton,{ backgroundColor: theme.colors.primary }] }
          onPress={() => nav.back()}
        >
      <Text style={[styles.backButtonText,{ color: theme.colors.primaryForeground }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
  <ScrollView style={[styles.container,{ backgroundColor: theme.colors.background }] }>
      <MapPlaceholder
        message={`Map showing route from ${origin.name} to ${destination.name}`}
      />

  <VoiceNavigation steps={route.steps} />

      <FeatureErrorBoundary>
        <SafetyPanel 
          currentLocation={location} 
          currentPlace={destination ? {
            id: destination.id,
            name: destination.name
          } : undefined}
        />
      </FeatureErrorBoundary>

      {showFunFact && (
        <FunFactCard 
          fact={currentFunFact}
          location="Transit System"
          onDismiss={() => setShowFunFact(false)}
        />
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.routeSummary}>
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={[styles.locationPin,{ backgroundColor: theme.colors.primary }]}>
                <Navigation size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.locationText} numberOfLines={1}>
                {origin.name}
              </Text>
            </View>
            
            <View style={styles.locationConnector} />
            
            <View style={styles.locationRow}>
              <View style={[styles.locationPin,{ backgroundColor: theme.colors.secondary }]}>
                <MapPin size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.locationText} numberOfLines={1}>
                {destination.name}
              </Text>
            </View>
          </View>
          
          <View style={[styles.timeInfo,{ borderTopColor: theme.colors.border }] }>
            <Text style={[styles.duration,{ color: theme.colors.text }]}>{route.totalDuration} min</Text>
            <View style={styles.timeRow}>
              <Clock size={14} color={theme.colors.textSecondary} style={styles.clockIcon} />
              <Text style={[styles.timeText,{ color: theme.colors.textSecondary }] }>
                {route.departureTime} - {route.arrivalTime}
              </Text>
            </View>
          </View>
        </View>
        
  <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Step by Step Directions</Text>
        
        <View style={styles.stepsContainer}>
          {route.steps.map((step, index) => (
            <DirectionStep
              key={step.id}
              step={step}
              isLast={index === route.steps.length - 1}
            />
          ))}
        </View>
        
        <View style={[styles.tipContainer,{ borderLeftColor: theme.colors.primary }] }>
          <Text style={[styles.tipTitle,{ color: theme.colors.primary }]}>Kid-Friendly Tip</Text>
          <Text style={[styles.tipText,{ color: theme.colors.text }] }>
            Remember to stay with an adult and keep your phone with you at all times!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  clockIcon: {
    marginRight: 4,
  },
  container: { flex: 1 },
  contentContainer: {
    padding: 16,
  },
  destinationPin: {},
  duration: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  errorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 24,
  },
  locationConnector: {
    height: 24,
    marginBottom: 8,
    marginLeft: 13,
    width: 2,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationPin: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    marginRight: 12,
    width: 28,
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  originPin: {},
  routeSummary: {
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  timeInfo: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  timeRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  timeText: {
    fontSize: 14,
  },
  tipContainer: {
    borderLeftWidth: 4,
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
});
