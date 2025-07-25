import { isMockLocation, getDeviceInfo } from "@/utils/deviceValidation";
import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Alert, Platform, BackHandler } from "react-native";
import Colors from "@/constants/colors";
import { Camera, MapPin } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigationStore } from "@/stores/navigationStore";
import useLocation from "@/hooks/useLocation";


type PhotoCheckInButtonProps = {
  placeName: string;
  placeId: string;
  placeLat: number;
  placeLng: number;
};

const PhotoCheckInButton: React.FC<PhotoCheckInButtonProps> = ({ placeName, placeId, placeLat, placeLng }) => {

  const [isLoading, setIsLoading] = useState(false);
  const { addPhotoCheckIn } = useNavigationStore();
  const { latitude, longitude, error: locationError } = useLocation();

  // Haversine formula for distance in meters
  function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }


  const handlePhotoCheckIn = async () => {
    // Spoofing prevention: check for mock location (Android)
    if (await isMockLocation()) {
      Alert.alert("Location Spoofing Detected", "Mock location detected. Please disable mock location apps to check in.");
      return;
    }
    // Require location
    if (locationError) {
      Alert.alert("Location Error", "Could not get your location. Please enable location services and try again.");
      return;
    }

    // Use real place coordinates from props
    const distance = getDistanceFromLatLonInMeters(latitude, longitude, placeLat, placeLng);
    const allowedRadius = 100; // meters
    if (distance > allowedRadius) {
      Alert.alert("Too Far From Location", `You must be within ${allowedRadius} meters of the destination to check in. (Currently: ${Math.round(distance)}m)`);
      return;
    }

    // Optionally: Add server-side validation here for extra anti-spoofing (future)
    // await validateCheckInOnServer({ latitude, longitude, deviceInfo: getDeviceInfo(), placeId });

    // Always capture device info for audit
    const deviceInfo = getDeviceInfo();

    if (Platform.OS === 'web') {
      Alert.alert("Photo Check-in", "Camera not available on web. Check-in recorded!");
      addPhotoCheckIn({
        placeId,
        placeName,
        photoUrl: "https://via.placeholder.com/300x200?text=Check-in+Photo",
        timestamp: Date.now(),
        notes: "Checked in successfully!",
        deviceInfo,
      });
      return;
    }

    try {
      setIsLoading(true);

      // Android-specific permission handling
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        if (Platform.OS === 'android') {
          Alert.alert(
            "Camera Permission",
            "Camera permission is required for photo check-ins. Please enable camera access in your device settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Settings", onPress: () => {
                Alert.alert("Enable Camera", "Go to Settings > Apps > KidMap > Permissions > Camera");
              }}
            ]
          );
        } else {
          Alert.alert("Permission needed", "Camera permission is required for photo check-ins");
        }
        return;
      }

      // Android-optimized camera options
      const cameraOptions = Platform.OS === 'android'
        ? {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3] as [number, number],
            quality: 0.6, // Lower quality for Android to prevent memory issues
            exif: false, // Disable EXIF data on Android for privacy
          }
        : {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3] as [number, number],
            quality: 0.7,
          };

      const result = await ImagePicker.launchCameraAsync(cameraOptions);

      if (!result.canceled && result.assets[0]) {
        addPhotoCheckIn({
          placeId,
          placeName,
          photoUrl: result.assets[0].uri,
          timestamp: Date.now(),
          notes: "Safe arrival confirmed!",
          deviceInfo,
        });

        Alert.alert("Check-in Complete!", `You've safely arrived at ${placeName}!`);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Error", "Could not take photo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Pressable 
      style={[styles.container, isLoading && styles.loading]}
      onPress={handlePhotoCheckIn}
      disabled={isLoading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? ("Taking photo for check-in at " + placeName) : ("Photo check-in at " + placeName)}
      accessibilityHint={isLoading ? "Wait for the photo to be taken" : ("Take a photo to check in at " + placeName)}
      accessibilityState={{ disabled: isLoading }}
    >
      <Camera size={20} color="#FFFFFF" />
      <Text style={styles.text}>
        {isLoading ? "Taking Photo..." : "Photo Check-in"}
      </Text>
      <MapPin size={16} color="#FFFFFF" style={styles.locationIcon} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loading: {
    opacity: 0.7,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  locationIcon: {
    marginLeft: 4,
  },
});

export default PhotoCheckInButton;
