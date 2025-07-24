import React from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import Colors from "@/constants/colors";
import { PlaceCategory } from "@/types/navigation";
import { Home, School, BookOpen, Trees, Store, Utensils, Users, Heart, MapPin } from "lucide-react-native";

type CategoryButtonProps = {
  category: PlaceCategory;
  onPress: (category: PlaceCategory) => void;
};

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, onPress }) => {
  const getIcon = () => {
    switch (category) {
      case "home":
        return <Home size={24} color="#FFF" />;
      case "school":
        return <School size={24} color="#FFF" />;
      case "library":
        return <BookOpen size={24} color="#FFF" />;
      case "park":
        return <Trees size={24} color="#FFF" />;
      case "store":
        return <Store size={24} color="#FFF" />;
      case "restaurant":
        return <Utensils size={24} color="#FFF" />;
      case "friend":
        return <Users size={24} color="#FFF" />;
      case "family":
        return <Heart size={24} color="#FFF" />;
      default:
        return <MapPin size={24} color="#FFF" />;
    }
  };

  const getCategoryName = () => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getBackgroundColor = () => {
    switch (category) {
      case "home": return Colors.primary;
      case "school": return "#FF9500";
      case "library": return "#9C27B0";
      case "park": return Colors.secondary;
      case "store": return "#4285F4";
      case "restaurant": return "#FF6B6B";
      case "friend": return "#00BCD4";
      case "family": return "#FF4081";
      default: return Colors.primary;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: getBackgroundColor() },
        pressed && styles.pressed
      ]}
      onPress={() => onPress(category)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Category: ${getCategoryName()}`}
      accessibilityHint={`Show places in the ${getCategoryName()} category`}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <Text style={styles.text}>{getCategoryName()}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    marginBottom: 8,
  },
  text: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CategoryButton;
