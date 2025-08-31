import { CheckCircle, Clock, MapPin, XCircle } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/constants/theme";
import { useNavigationStore } from "@/stores/navigationStore";
import { tint } from "@/utils/color/color";
import { formatDistance, getLocationAccuracyDescription } from "@/utils/location/locationUtils";

const PhotoCheckInHistory: React.FC = () => {
  const { photoCheckIns } = useNavigationStore();

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  if (photoCheckIns.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MapPin size={40} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No check-ins yet</Text>
        <Text style={styles.emptySubtext}>
          Take a photo check-in when you arrive at your destination!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Photo Check-in History</Text>
      
      {photoCheckIns.map((checkIn) => (
        <View key={checkIn.id} style={styles.checkInCard}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.placeName}>{checkIn.placeName}</Text>
              <View style={styles.timestampRow}>
                <Clock size={14} color={theme.colors.textSecondary} />
                <Text style={styles.timestamp}>
                  {formatTimestamp(checkIn.timestamp)}
                </Text>
              </View>
            </View>
            
            {checkIn.isLocationVerified !== undefined && (
              <View style={[
                styles.verificationBadge,
                checkIn.isLocationVerified ? styles.verifiedBadge : styles.unverifiedBadge
              ]}>
                {checkIn.isLocationVerified ? (
                  <CheckCircle size={16} color={theme.colors.success} />
                ) : (
                  <XCircle size={16} color={theme.colors.error} />
                )}
                <Text style={[
                  styles.verificationText,
                  checkIn.isLocationVerified ? styles.verifiedText : styles.unverifiedText
                ]}>
                  {checkIn.isLocationVerified ? "Verified" : "Unverified"}
                </Text>
              </View>
            )}
          </View>

          <Image source={{ uri: checkIn.photoUrl }} style={styles.photo} />
          
          {checkIn.notes && (
            <Text style={styles.notes}>{checkIn.notes}</Text>
          )}
          
          {checkIn.distanceFromPlace !== undefined && (
            <View style={styles.locationInfo}>
              <MapPin size={14} color={theme.colors.textSecondary} />
              <Text style={styles.locationText}>
                {getLocationAccuracyDescription(checkIn.distanceFromPlace)} 
                ({formatDistance(checkIn.distanceFromPlace)} from destination)
              </Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};
const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  checkInCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  emptySubtext: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  headerLeft: {
    flex: 1,
  },
  locationInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  locationText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  notes: {
    color: theme.colors.text,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 8,
  },
  photo: {
    borderRadius: 8,
    height: 200,
    marginBottom: 12,
    width: "100%",
  },
  placeName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  timestamp: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  timestampRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  unverifiedBadge: {
    backgroundColor: tint(theme.colors.error),
  },
  unverifiedText: {
    color: theme.colors.error,
  },
  verificationBadge: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedBadge: {
    backgroundColor: tint(theme.colors.success),
  },
  verifiedText: {
    color: theme.colors.success,
  },
});

export default PhotoCheckInHistory;
