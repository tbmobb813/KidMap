import { Home, School, BookOpen, Trees, Store, Utensils, Users, Heart, MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useTheme } from "@/constants/theme";
import { Place } from "@/types/navigation";

type PlaceCardProps = {
  place: Place;
  onPress: (place: Place) => void;
};

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress }) => {
  const theme = useTheme();
  const getIcon = () => {
    switch (place.category) {
      case "home":
        return <Home size={24} color={theme.colors.primary} />;
      case "school":
        return <School size={24} color={theme.colors.primary} />;
      case "library":
        return <BookOpen size={24} color={theme.colors.primary} />;
      case "park":
        return <Trees size={24} color={theme.colors.primary} />;
      case "store":
        return <Store size={24} color={theme.colors.primary} />;
      case "restaurant":
        return <Utensils size={24} color={theme.colors.primary} />;
      case "friend":
        return <Users size={24} color={theme.colors.primary} />;
      case "family":
        return <Heart size={24} color={theme.colors.primary} />;
      default:
        return <MapPin size={24} color={theme.colors.primary} />;
    }
  };

  return (
  <Pressable 
      accessibilityRole="button"
      accessibilityLabel={`Place ${place.name}`}
      accessibilityHint="Shows details for this place"
      hitSlop={8}
      style={({ pressed }) => [
    styles.container,
    { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text },
    pressed && [{ backgroundColor: theme.colors.surfaceAlt }, styles.pressed]
      ]}
      onPress={() => onPress(place)}
      testID={`place-card-${place.id}`}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.textContainer}>
    <Text style={[styles.name, { color: theme.colors.text }]}>{place.name}</Text>
    <Text style={[styles.address, { color: theme.colors.textSecondary }]} numberOfLines={1}>{place.address}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  address: {
    fontSize: 14,
  },
  container: {
    alignItems: "center",
    borderRadius: 12,
    elevation: 2,
    flexDirection: "row",
    marginBottom: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: 'transparent',
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginRight: 16,
    width: 48,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
});

export default PlaceCard;
