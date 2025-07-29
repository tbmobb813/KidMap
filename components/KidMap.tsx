import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng, Region } from 'react-native-maps';
import { RouteResult } from '@/utils/api';
import { TransitStation } from '@/utils/transitApi';
import Colors from '@/constants/colors';
import polyline from '@mapbox/polyline';

const { width, height } = Dimensions.get('window');

interface KidMapProps {
  initialRegion?: Region;
  userLocation?: LatLng;
  destination?: LatLng;
  route?: RouteResult;
  nearbyStations?: TransitStation[];
  onRegionChange?: (region: Region) => void;
  onMarkerPress?: (location: LatLng) => void;
  showUserLocation?: boolean;
  followUserLocation?: boolean;
}

const KidMap: React.FC<KidMapProps> = ({
  initialRegion,
  userLocation,
  destination,
  route,
  nearbyStations = [],
  onRegionChange,
  onMarkerPress,
  showUserLocation = true,
  followUserLocation = false,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region>(
    initialRegion || {
      latitude: 40.7589, // NYC default
      longitude: -73.9851,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );

  // Update region when user location changes
  useEffect(() => {
    if (userLocation && followUserLocation && mapRef.current) {
      const newRegion = {
        ...mapRegion,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
      setMapRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, [userLocation, followUserLocation]);

  // Fit map to show route
  useEffect(() => {
    if (route && mapRef.current) {
      const coordinates = route.steps.flatMap(step => [
        step.startLocation,
        step.endLocation,
      ]);
      
      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [route]);

  const handleRegionChange = (region: Region) => {
    setMapRegion(region);
    onRegionChange?.(region);
  };

  const decodePolyline = (encoded: string): LatLng[] => {
    // Use @mapbox/polyline for robust decoding
    return polyline.decode(encoded).map(([latitude, longitude]) => ({
      latitude,
      longitude,
    }));
  };

  const routeCoordinates = route ? decodePolyline(route.overview_polyline) : [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={mapRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        mapType="standard"
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor={Colors.primary}
            identifier="user-location"
          />
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor={Colors.secondary}
            identifier="destination"
            onPress={() => onMarkerPress?.(destination)}
          />
        )}

        {/* Transit stations */}
        {nearbyStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={station.location}
            title={station.name}
            description={`Routes: ${station.routes.join(', ')}`}
            pinColor={Colors.accent}
            identifier={`station-${station.id}`}
            onPress={() => onMarkerPress?.(station.location)}
          />
        ))}

        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.primary}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Route step markers */}
        {route?.steps.map((step, index) => {
          if (step.transitDetails) {
            return (
              <Marker
                key={`step-${index}`}
                coordinate={step.startLocation}
                title={step.transitDetails.line}
                description={`${step.transitDetails.agency} - ${step.transitDetails.vehicle}`}
                pinColor={step.transitDetails.color || Colors.accent}
                identifier={`step-${index}`}
              />
            );
          }
          return null;
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
});

export default KidMap;
