import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '@/constants/colors';
import { Place, Route } from '@/types/navigation';
import MapPlaceholder from './MapPlaceholder';
import { Crosshair } from 'lucide-react-native';

type LatLng = { latitude: number; longitude: number };

type InteractiveMapProps = {
  origin?: Place;
  destination?: Place;
  route?: Route & { geometry?: { coordinates: LatLng[] } };
  onMapReady?: () => void;
  onSelectLocation?: (coords: LatLng) => void;
  testId?: string;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  destination,
  route,
  onMapReady,
  onSelectLocation,
  testId,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setMapReady] = useState<boolean>(false);

  const routeCoords = useMemo<LatLng[] | undefined>(() => {
    if (route?.geometry?.coordinates && route.geometry.coordinates.length > 0) {
      return route.geometry.coordinates;
    }
    if (origin?.coordinates && destination?.coordinates) {
      return [origin.coordinates, destination.coordinates];
    }
    return undefined;
  }, [route?.geometry?.coordinates, origin?.coordinates, destination?.coordinates]);

  const generateMapHTML = useCallback(() => {
    const centerLat = origin?.coordinates?.latitude ?? 40.7128;
    const centerLng = origin?.coordinates?.longitude ?? -74.0060;

    const polylineJs = routeCoords
      ? `const poly = L.polyline(${JSON.stringify(
          routeCoords.map((c) => [c.latitude, c.longitude])
        )}, { color: '${Colors.primary}', weight: 4, opacity: 0.9 }).addTo(map);`
      : '';

    const fitBoundsJs = routeCoords
      ? `try { map.fitBounds(poly.getBounds().pad(0.15)); } catch (e) { console.log('fitBounds error', e); }`
      : '';

    const originMarkerJs = origin
      ? `const originMarker = L.marker([${origin.coordinates.latitude}, ${origin.coordinates.longitude}], { icon: originIcon }).addTo(map).bindPopup(${JSON.stringify(origin.name)});`
      : '';

    const destinationMarkerJs = destination
      ? `const destMarker = L.marker([${destination.coordinates.latitude}, ${destination.coordinates.longitude}], { icon: destinationIcon }).addTo(map).bindPopup(${JSON.stringify(destination.name)});`
      : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body { height: 100%; margin: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', { zoomControl: true }).setView([${centerLat}, ${centerLng}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

        const originIcon = L.divIcon({
          html: '<div style="background: ${Colors.primary}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [26,26], iconAnchor: [13,13]
        });
        const destinationIcon = L.divIcon({
          html: '<div style="background: ${Colors.secondary}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [26,26], iconAnchor: [13,13]
        });

        ${originMarkerJs}
        ${destinationMarkerJs}
        ${polylineJs}
        ${fitBoundsJs}

        map.on('click', function(e) {
          try {
            const payload = JSON.stringify({ type: 'tap', lat: e.latlng.lat, lng: e.latlng.lng });
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(payload);
          } catch (err) { console.log('postMessage error', err); }
        });

        function recenter() {
          try {
            ${routeCoords ? 'map.fitBounds(poly.getBounds().pad(0.15));' : `map.setView([${centerLat}, ${centerLng}], 13);`}
          } catch (e) { console.log('recenter error', e); }
        }

        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data || '{}');
            if (data.type === 'recenter') { recenter(); }
          } catch (e) { console.log('message parse error', e); }
        });

        setTimeout(() => { try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' })); } catch (e) {} }, 500);
      </script>
    </body>
    </html>`;
  }, [origin, destination, routeCoords]);

  const handleMessage = useCallback((event: any) => {
    try {
      const raw: string = event?.nativeEvent?.data ?? '';
      if (!raw) return;
      if (raw === 'mapReady') {
        setMapReady(true);
        onMapReady?.();
        return;
      }
      const data = JSON.parse(raw);
      if (data?.type === 'ready') {
        setMapReady(true);
        onMapReady?.();
        return;
      }
      if (data?.type === 'tap' && typeof data.lat === 'number' && typeof data.lng === 'number') {
        onSelectLocation?.({ latitude: data.lat, longitude: data.lng });
      }
    } catch (e) {
      console.log('InteractiveMap handleMessage error', e);
    }
  }, [onMapReady, onSelectLocation]);

  const sendRecenter = useCallback(() => {
    try {
      webViewRef.current?.postMessage(JSON.stringify({ type: 'recenter' }));
    } catch (e) {
      console.log('recenter postMessage error', e);
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container} testID={testId ?? 'interactive-map-web'}>
        <MapPlaceholder
          message={destination ? `Interactive map: ${origin?.name ?? 'Origin'} → ${destination.name}` : 'Select destination for interactive map'}
        />
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testId ?? 'interactive-map'}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      <Pressable accessibilityRole="button" testID="recenter-button" style={styles.recenterBtn} onPress={sendRecenter}>
        <Crosshair color={Colors.text} size={18} />
        <Text style={styles.recenterLabel}>Recenter</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mapWater },
  webView: { flex: 1 },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  recenterLabel: { color: Colors.text, fontWeight: '600' as const, fontSize: 12 },
});

export default InteractiveMap;