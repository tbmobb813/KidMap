// app/route-planner.tsx - Route planning interface for kids
import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Colors from '../src/constants/colors'
import { RouteOption, getKidFriendlyRoutes } from '../src/utils/routePlanner'
import {
  MapPin,
  Clock,
  Shield,
  Star,
  Navigation,
  AlertTriangle,
} from 'lucide-react-native'
import AccessibleButton from '../src/components/AccessibleButton'
import LoadingSpinner from '../src/components/LoadingSpinner'
import useLocation from '../src/hooks/useLocation'
import { useNavigationStore } from '../src/stores/navigationStore'

export default function RoutePlannerScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { location } = useLocation()
  // Update this line to match your navigation store's API.
  // For example, if your store uses a setter named 'setRoute', use that instead.
  // If you need to add 'setActiveRoute' to your store, implement it in the store definition.
  // Use the correct setter or update your store to include setActiveRoute if missing.
  // If your store only has activeRoute and a setter like setActiveRouteId, use that.
  // Example using a generic setter:
  const setActiveRoute = useNavigationStore(
    (state) => state.setActiveRoute || (() => {}),
  )

  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)

  // Parse destination from params
  const destination = params.destination
    ? JSON.parse(params.destination as string)
    : null
  const fromCoords: [number, number] = location
    ? [location.latitude, location.longitude]
    : [0, 0]
  const toCoords: [number, number] = destination
    ? [destination.lat, destination.lng]
    : [0, 0]

  useEffect(() => {
    if (location && destination) {
      loadRoutes()
    }
  }, [location, destination])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const routeOptions = await getKidFriendlyRoutes(fromCoords, toCoords, 10) // Assume age 10
      setRoutes(routeOptions)

      // Auto-select the best route
      if (routeOptions.length > 0) {
        setSelectedRoute(routeOptions[0])
      }
    } catch (error) {
      console.error('Error loading routes:', error)
      Alert.alert('Error', 'Could not load route options. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartNavigation = () => {
    if (!selectedRoute) return

    setActiveRoute(selectedRoute)
    router.push({
      pathname: '/navigation',
      params: {
        routeId: selectedRoute.id,
        route: JSON.stringify(selectedRoute),
      },
    })
  }

  const getSafetyIcon = (level: number) => {
    if (level >= 4) return <Shield size={16} color={Colors.success} />
    if (level >= 3) return <Shield size={16} color={Colors.warning} />
    return <AlertTriangle size={16} color={Colors.error} />
  }

  const getKidFriendlinessStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        color={i < rating ? Colors.warning : Colors.border}
        fill={i < rating ? Colors.warning : 'transparent'}
      />
    ))
  }

  const renderRouteCard = (route: RouteOption) => (
    <Pressable
      key={route.id}
      style={[
        styles.routeCard,
        selectedRoute?.id === route.id && styles.selectedRouteCard,
      ]}
      onPress={() => setSelectedRoute(route)}
    >
      <View style={styles.routeHeader}>
        <View style={styles.routeTitle}>
          <Text style={styles.routeMode}>
            {route.mode === 'walking'
              ? '🚶‍♀️ Walking'
              : route.mode === 'transit'
                ? '🚇 Transit'
                : '🚌 Mixed'}
          </Text>
          <View style={styles.routeRatings}>
            {getSafetyIcon(route.safety)}
            <View style={styles.stars}>
              {getKidFriendlinessStars(route.kidFriendliness)}
            </View>
          </View>
        </View>

        <View style={styles.routeStats}>
          <View style={styles.stat}>
            <Clock size={14} color={Colors.textLight} />
            <Text style={styles.statText}>{route.duration} min</Text>
          </View>
          <View style={styles.stat}>
            <MapPin size={14} color={Colors.textLight} />
            <Text style={styles.statText}>
              {(route.distance / 1000).toFixed(1)} km
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.routeSteps}>
        {route.steps.slice(0, 3).map((step, index) => (
          <View key={step.id} style={styles.step}>
            <View style={styles.stepIcon}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText} numberOfLines={1}>
              {step.instruction}
            </Text>
            <Text style={styles.stepDuration}>{step.duration}m</Text>
          </View>
        ))}
        {route.steps.length > 3 && (
          <Text style={styles.moreSteps}>
            + {route.steps.length - 3} more steps
          </Text>
        )}
      </View>

      <View style={styles.routeFeatures}>
        <View
          style={[
            styles.accessibilityBadge,
            {
              backgroundColor:
                route.accessibility === 'high'
                  ? Colors.success
                  : route.accessibility === 'medium'
                    ? Colors.warning
                    : Colors.error,
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {route.accessibility === 'high'
              ? 'Easy Access'
              : route.accessibility === 'medium'
                ? 'Some Stairs'
                : 'Difficult'}
          </Text>
        </View>
      </View>
    </Pressable>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>
          Finding the best routes for you...
        </Text>
      </View>
    )
  }

  if (!destination) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No destination specified</Text>
        <AccessibleButton
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Route</Text>
        <Text style={styles.headerSubtitle}>Going to {destination.name}</Text>
      </View>

      {/* Routes List */}
      <ScrollView
        style={styles.routesList}
        showsVerticalScrollIndicator={false}
      >
        {routes.length === 0 ? (
          <View style={styles.noRoutes}>
            <MapPin size={48} color={Colors.textLight} />
            <Text style={styles.noRoutesText}>No routes found</Text>
            <Text style={styles.noRoutesSubtext}>
              Try selecting a different destination
            </Text>
          </View>
        ) : (
          routes.map(renderRouteCard)
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <AccessibleButton
          title="Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
        <AccessibleButton
          title="Start Navigation"
          onPress={handleStartNavigation}
          variant="primary"
          style={styles.startButton}
          disabled={!selectedRoute}
          icon={<Navigation size={20} color="#FFFFFF" />}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  routesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  routeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRouteCard: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F4FF',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeTitle: {
    flex: 1,
  },
  routeMode: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  routeRatings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  routeStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  routeSteps: {
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  stepDuration: {
    fontSize: 12,
    color: Colors.textLight,
  },
  moreSteps: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginLeft: 32,
  },
  routeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    flex: 1,
  },
  startButton: {
    flex: 2,
  },
  noRoutes: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noRoutesText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noRoutesSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 24,
  },
})
