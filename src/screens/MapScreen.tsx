import React, { useEffect, useRef } from 'react'
import { StyleSheet, View, Button, Platform, Dimensions } from 'react-native'
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import { useNavigationStore } from '@/stores/navigationStore'
import useLocation from '@/hooks/useLocation'

const { width, height } = Dimensions.get('window')

export default function MapScreen() {
  const mapRef = useRef<MapView>(null)
  const { location } = useLocation()

  const {
    origin,
    destination,
    availableRoutes,
    selectedRoute,
    setOrigin,
    setDestination,
    selectRoute,
    clearRoute,
  } = useNavigationStore()

  // Center map on user location when available
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
    }
  }, [location])

  const renderMarkers = () => {
    return (
      <>
        {origin && (
          <Marker coordinate={origin} title="Origin" pinColor="green" />
        )}
        {destination && (
          <Marker coordinate={destination} title="Destination" pinColor="red" />
        )}
      </>
    )
  }

  const renderRoute = () => {
    const route = selectedRoute || availableRoutes?.[0]
    if (!route) return null

    return (
      <Polyline
        coordinates={route.coordinates}
        strokeColor="#007AFF"
        strokeWidth={4}
      />
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >
        {renderMarkers()}
        {renderRoute()}
      </MapView>

      {selectedRoute && (
        <View style={styles.buttonContainer}>
          <Button title="Clear Route" onPress={clearRoute} color="#FF3B30" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.9)' : '#fff',
    padding: 8,
    borderRadius: 8,
    elevation: 5,
  },
})
