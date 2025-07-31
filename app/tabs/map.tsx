import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import Colors from '@/constants/colors'
import useLocation from '@/hooks/useLocation'
import KidMap from '@/components/KidMap'
import { MapPin, Navigation } from 'lucide-react-native'

export default function MapScreen() {
  const { location, loading } = useLocation()
  const [selectedPlace, setSelectedPlace] = useState<any>(null)

  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place)
  }

  const handleGetDirections = () => {
    if (location && selectedPlace) {
      // This would trigger navigation in a real app
      console.log('Getting directions from', location, 'to', selectedPlace)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    )
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MapPin size={48} color={Colors.textLight} />
          <Text style={styles.errorTitle}>Location Required</Text>
          <Text style={styles.errorText}>
            Please enable location services to use the map
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map</Text>
        {selectedPlace && (
          <Pressable
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <Navigation size={20} color="#FFFFFF" />
            <Text style={styles.directionsText}>Directions</Text>
          </Pressable>
        )}
      </View>

      {/* Map Component */}
      <View style={styles.mapContainer}>
        <KidMap
          userLocation={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          onMarkerPress={(location) => {
            setSelectedPlace({
              name: 'Selected Location',
              address: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
            })
          }}
          showUserLocation={true}
        />
      </View>

      {/* Selected Place Info */}
      {selectedPlace && (
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{selectedPlace.name}</Text>
          <Text style={styles.placeAddress}>{selectedPlace.address}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  directionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  placeInfo: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: Colors.textLight,
  },
})
