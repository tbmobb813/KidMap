import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";

type LocationData = {
  latitude: number;
  longitude: number;
  error: string | null;
};

export default function useLocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: 40.7128,
    longitude: -74.0060,
    error: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Skip for web since location permissions are handled differently
        if (Platform.OS !== "web") {
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          if (status !== "granted") {
            setLocation(prev => ({
              ...prev,
              error: "Permission to access location was denied"
            }));
            setLoading(false);
            return;
          }
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          error: null,
        });
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          error: "Could not get your location"
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, loading };
}
