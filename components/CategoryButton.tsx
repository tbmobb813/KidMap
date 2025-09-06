import React from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import Colors from "@/constants/colors";
import { PlaceCategory, CustomCategory } from "@/types/navigation";
import { 
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
  Foundation
} from "@expo/vector-icons";

type CategoryButtonProps = {
  category?: PlaceCategory;
  customCategory?: CustomCategory;
  onPress: (category: PlaceCategory | string) => void;
  size?: 'small' | 'medium' | 'large';
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  customCategory,
  onPress,
  size = 'large'
}) => {
  const getIcon = (iconName: string, iconSize: number) => {
    const iconProps = { size: iconSize, color: "#FFF" };

    switch (iconName) {
      case "Home": return <Feather name="home" {...iconProps} />;
      case "GraduationCap": return <FontAwesome5 name="graduation-cap" {...iconProps} />;
      case "BookOpen": return <Feather name="book-open" {...iconProps} />;
      case "Trees": return <MaterialCommunityIcons name="tree" {...iconProps} />;
      case "ShoppingBag": return <Feather name="shopping-bag" {...iconProps} />;
      case "Pizza": return <MaterialCommunityIcons name="pizza" {...iconProps} />;
      case "Users": return <Feather name="users" {...iconProps} />;
      case "Heart": return <Feather name="heart" {...iconProps} />;
      case "Car": return <MaterialCommunityIcons name="car" {...iconProps} />;
      case "Bike": return <MaterialCommunityIcons name="bike" {...iconProps} />;
      case "Bus": return <MaterialCommunityIcons name="bus" {...iconProps} />;
      case "Train": return <MaterialCommunityIcons name="train" {...iconProps} />;
      case "Plane": return <Feather name="airplay" {...iconProps} />;
      case "Hospital": return <MaterialCommunityIcons name="hospital" {...iconProps} />;
      case "Church": return <MaterialCommunityIcons name="church" {...iconProps} />;
      case "Building": return <MaterialCommunityIcons name="office-building" {...iconProps} />;
      case "Gamepad2": return <MaterialCommunityIcons name="gamepad-variant" {...iconProps} />;
      case "Music": return <Feather name="music" {...iconProps} />;
      case "Camera": return <Feather name="camera" {...iconProps} />;
      case "Gift": return <Feather name="gift" {...iconProps} />;
      case "Coffee": return <Feather name="coffee" {...iconProps} />;
      case "Apple": return <FontAwesome5 name="apple" {...iconProps} />;
      case "Dumbbell": return <MaterialCommunityIcons name="dumbbell" {...iconProps} />;
      case "Palette": return <MaterialCommunityIcons name="palette" {...iconProps} />;
      case "Star": return <Feather name="star" {...iconProps} />;
      case "Sun": return <Feather name="sun" {...iconProps} />;
      case "Moon": return <Feather name="moon" {...iconProps} />;
      case "Cloud": return <Feather name="cloud" {...iconProps} />;
      case "Umbrella": return <Feather name="umbrella" {...iconProps} />;
      case "Flower": return <MaterialCommunityIcons name="flower" {...iconProps} />;
      default: return <Feather name="map-pin" {...iconProps} />;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80, iconSize: 24 };
      case 'medium':
        return { width: 100, height: 100, iconSize: 28 };
      case 'large':
        return { width: 120, height: 120, iconSize: 36 };
      default:
        return { width: 120, height: 120, iconSize: 36 };
    }
  };

  const sizeStyles = getSizeStyles();
  
  // Use custom category data if provided, otherwise fall back to default category
  const displayName = customCategory ? customCategory.name : (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Other');
  const iconName = customCategory ? customCategory.icon : getDefaultIcon(category || 'other');
  const backgroundColor = customCategory ? customCategory.color : getDefaultColor(category || 'other');
  const categoryId = customCategory ? customCategory.id : category;

  function getDefaultIcon(cat: PlaceCategory): string {
    switch (cat) {
      case "home": return "Home";
      case "school": return "GraduationCap";
      case "library": return "BookOpen";
      case "park": return "Trees";
      case "store": return "ShoppingBag";
      case "restaurant": return "Pizza";
      case "friend": return "Users";
      case "family": return "Heart";
      default: return "MapPin";
    }
  }

  function getDefaultColor(cat: PlaceCategory): string {
    switch (cat) {
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
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor,
          width: sizeStyles.width,
          height: sizeStyles.height,
        },
        pressed && styles.pressed
      ]}
      onPress={() => onPress(categoryId || 'other')}
      testID={`category-button-${categoryId}`}
    >
      <View style={styles.iconContainer}>
        {getIcon(iconName, sizeStyles.iconSize)}
      </View>
      <Text style={[styles.text, { fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16 }]}>
        {displayName}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    marginBottom: 8,
  },
  text: {
    color: "#FFF",
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CategoryButton;