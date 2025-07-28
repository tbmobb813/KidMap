import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchRoute, TravelMode, RouteResult } from '@/utils/api';
import Colors from '@/constants/colors';
import DirectionStep from '@/components/DirectionStep';
import MapPlaceholder from '@/components/MapPlaceholder';
import { useNavigationStore } from '@/stores/navigationStore';
import { Clock, Navigation, MapPin } from 'lucide-react-native';
import VoiceNavigation from '@/components/VoiceNavigation';
import FunFactCard from '@/components/FunFactCard';
import { getRandomFunFact } from '@/mocks/funFacts';
import LoadingSpinner from '@/components/LoadingSpinner';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function RouteDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { origin, destination } = useNavigationStore();

  // Enhanced mode selector & fetch state
  const [mode, setMode] = useState<TravelMode>('walking');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination) return;
    // Use AbortController for cancellation
    const abortController = new AbortController();

    async function loadRoute() {
      setLoading(true);
      setError(null);
      try {
        // Pass the abort signal to fetchRoute (ensure fetchRoute supports cancellation)
        const result = await fetchRoute(origin.location, destination.location, mode, abortController.signal);
        if (result) {
          setRouteResult(result);
        } else {
          setError('Unable to load route');
        }
      } catch (err: any) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching route:', err);
          setError(err.message || 'An error occurred while fetching the route.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadRoute();

    return () => {
      abortController.abort();
    };
  }, [origin, destination, mode]);

  const displayDistance = routeResult?.distance ?? 0;
  const displayDuration = routeResult?.duration ?? 0;

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {(['walking', 'cycling', 'transit'] as TravelMode[]).map((m) => (
          <Pressable
            key={m}
            style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && !routeResult && (
        <MapPlaceholder message="No route available. Try a different mode or location." />
      )}

      {/* Header - Distance & Duration */}
      {routeResult && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Distance: {displayDistance} m</Text>
          <Text style={styles.headerText}>Duration: {Math.round(displayDuration / 60)} min</Text>
        </View>
      )}

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: origin.location[0],
          longitude: origin.location[1],
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {routeResult && (
          <>
            <Polyline
              coordinates={routeResult.steps.flatMap((s) => [
                { latitude: s.startLocation[0], longitude: s.startLocation[1] },
                { latitude: s.endLocation[0], longitude: s.endLocation[1] },
              ])}
              strokeColor={Colors.primary}
              strokeWidth={4}
            />
            <Marker
              coordinate={{
                latitude: origin.location[0],
                longitude: origin.location[1],
              }}
              title="Start"
            />
            <Marker
              coordinate={{
                latitude: destination.location[0],
                longitude: destination.location[1],
              }}
              title="End"
            />
          </>
        )}
      </MapView>

      {/* Route Steps */}
      {routeResult && (
        <ScrollView>
          {routeResult.legs.flatMap((leg) =>
            leg.steps.map((step, idx) => (
              <DirectionStep key={`${leg.summary}-${idx}`} step={step} />
            ))
          )}
        </ScrollView>
      )}

      {/* Optional integration for VoiceNavigation and FunFactCard can go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  modeTextActive: {
    color: '#fff',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginVertical: 12,
  },
  routeTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  routeTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
  },
  routeTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  routeTypeButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  routeTypeButtonTextActive: {
    color: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  routeSummary: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  originPin: {
    backgroundColor: Colors.primary,
  },
  destinationPin: {
    backgroundColor: Colors.secondary,
  },
  locationText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  locationConnector: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 13,
    marginBottom: 8,
  },
  timeInfo: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  duration: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  tipContainer: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTextLarge: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: Colors.text,
    fontWeight: '500',
    fontSize: 16,
  },
  map: { flex: 1, marginBottom: 16 },
});
