import React, { useState, useEffect, useMemo } from 'react'
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MapPin, Navigation } from 'lucide-react-native'
import Colors from '../../src/constants/colors'
import SearchWithSuggestions from '../../src/components/SearchWithSuggestions'
import PlaceCard from '../../src/components/PlaceCard'
import CategoryButton from '../../src/components/CategoryButton'
import SafetyPanel from '../../src/components/SafetyPanel'
import SafetyErrorBoundary from '../../src/components/SafetyErrorBoundary'
import RegionalFunFactCard from '../../src/components/RegionalFunFactCard'
import UserStatsCard from '../../src/components/UserStatsCard'
import WeatherCard from '../../src/components/WeatherCard'
import PhotoCheckInButton from '../../src/components/PhotoCheckInButton'
import EmptyState from '../../src/components/EmptyState'
import PullToRefresh from '../../src/components/PullToRefresh'
import Toast from '../../src/components/Toast'
import AccessibleButton from '../../src/components/AccessibleButton'
import { useGeofencing } from '../../src/hooks/useGeofencing'
import useLocation from '../../src/hooks/useLocation'
import { useRegionalData } from '../../src/hooks/useRegionalData'
import { useNavigationStore } from '../../src/stores/navigationStore'
import { useGamificationStore } from '../../src/stores/gamificationStore'
import {
  sendLocalNotification,
  requestNotificationPermissions,
  configureNotificationHandler,
} from '../../src/utils/notifications'
import { trackScreenView, trackUserAction } from '../../src/utils/analytics'
import SearchSuggestion from '../../src/components/SearchWithSuggestions'
import type { PlaceCategory, Place } from '../../src/types/navigation'

export default function HomeScreen() {
  const router = useRouter()
  const { location } = useLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFunFact, setShowFunFact] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const { favorites, setDestination, addToRecentSearches, recentSearches } =
    useNavigationStore()
  const { userStats, completeTrip, safetyContacts } = useGamificationStore()
  const { formatters, regionalContent, currentRegion } = useRegionalData()

  useEffect(() => {
    configureNotificationHandler()
    requestNotificationPermissions()
    trackScreenView('home')
  }, [])

  useGeofencing((zoneId, event) => {
    const action = event === 'enter' ? 'entered' : 'exited'
    sendLocalNotification(
      `Safe Zone ${action}`,
      `You have ${action} a safe zone (${zoneId}).`,
    )
    const primaryContact = safetyContacts?.find((c) => c.isPrimary)
    if (primaryContact && Platform.OS !== 'web') {
      const message = `Alert: Your child has ${action} safe zone (${zoneId}).`
      Linking.openURL(
        `sms:${primaryContact.phone}&body=${encodeURIComponent(message)}`,
      )
    }
  })

  const mockWeather = {
    condition: 'Sunny',
    temperature: 72,
    recommendation: `Perfect weather for exploring ${currentRegion.name}! Don't forget sunscreen.`,
  }

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const result: SearchSuggestion[] = []

    recentSearches.forEach((place) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        result.push({
          id: `recent-${place.id}`,
          text: place.name,
          type: 'recent',
          place,
        })
      }
    })

    favorites.forEach((place) => {
      if (place.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        result.push({
          id: `favorite-${place.id}`,
          text: place.name,
          type: 'place',
          place,
        })
      }
    })

    return result
  }, [searchQuery, recentSearches, favorites])

  const handlePlaceSelect = (place: Place) => {
    setDestination(place)
    addToRecentSearches(place)
    router.push({ pathname: '/route/[id]', params: { id: place.id } })
  }

  const handleCategorySelect = (category: PlaceCategory) => {
    trackUserAction('select_category', { category })
    router.push({ pathname: '/search', params: { category } })
  }

  const handleCurrentLocation = () => {
    const currentPlace: Place = {
      id: 'current-location',
      name: 'Current Location',
      address: 'Your current position',
      category: 'other',
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    }
    trackUserAction('use_current_location')
    handlePlaceSelect(currentPlace)
  }

  const triggerErrorToast = () => {
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  const categories: PlaceCategory[] = [
    'park',
    'museum',
    'playground',
    'zoo',
    'aquarium',
    'library',
    'other',
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      setToastVisible(true)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.place) {
      handlePlaceSelect(suggestion.place)
    } else {
      setToastVisible(true)
    }
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <Toast
        message="Something went wrong! This is a sample error toast."
        type="error"
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <AccessibleButton
        title="Show Error Toast"
        onPress={triggerErrorToast}
        style={{ margin: 16 }}
        variant="outline"
      />

      <View style={styles.container}>
        <UserStatsCard stats={userStats} />

        <WeatherCard weather={mockWeather} />

        {showFunFact && (
          <RegionalFunFactCard onDismiss={() => setShowFunFact(false)} />
        )}

        <SafetyErrorBoundary
          componentName="Safety Panel"
          fallbackMessage="The safety panel is temporarily unavailable. Your safety features can still be accessed through the Safety tab."
        >
          <SafetyPanel currentLocation={location} />
        </SafetyErrorBoundary>

        <View style={styles.searchContainer}>
          <SearchWithSuggestions
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSelectSuggestion={handleSuggestionSelect}
            suggestions={suggestions}
            placeholder={`Where do you want to go in ${currentRegion.name}?`}
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
            <View key={place.id}>
              <PlaceCard place={place} onPress={handlePlaceSelect} />
              <PhotoCheckInButton
                placeName={place.name}
                placeId={place.id}
                placeLat={place.coordinates.latitude}
                placeLng={place.coordinates.longitude}
              />
            </View>
          ))
        ) : (
          <EmptyState
            icon={MapPin}
            title="No favorites yet"
            description={`Add places you visit often in ${currentRegion.name} to see them here`}
            actionText="Search Places"
            onAction={() => router.push('/search')}
          />
        )}
      </View>
    </PullToRefresh>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  currentLocationText: {
    marginLeft: 8,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: Colors.text.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
})
