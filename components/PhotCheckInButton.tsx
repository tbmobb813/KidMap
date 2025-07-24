import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Alert, Platform, BackHandler } from "react-native";
import Colors from "@/constants/colors";
import { Camera, MapPin } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigationStore } from "@/stores/navigationStore";

type PhotoCheckInButtonProps = {
  placeName: string;
  placeId: string;
};

const PhotoCheckInButton: React.FC<PhotoCheckInButtonProps> = ({ placeName, placeId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addPhotoCheckIn } = useNavigationStore();

  const handlePhotoCheckIn = async () => {
    if (Platform.OS === 'web') {
      Alert.alert("Photo Check-in", "Camera not available on web. Check-in recorded!");
      addPhotoCheckIn({
        placeId,
        placeName,
        photoUrl: "https://via.placeholder.com/300x200?text=Check-in+Photo",
        timestamp: Date.now(),
        notes: "Checked in successfully!"
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
          notes: "Safe arrival confirmed!"
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
      accessibilityLabel={isLoading ? `Taking photo for check-in at ${placeName}` : `Photo check-in at ${placeName}`}
      accessibilityHint={isLoading ? "Wait for the photo to be taken" : `Take a photo to check in at ${placeName}`}
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
