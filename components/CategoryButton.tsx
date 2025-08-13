import { 
  Home, GraduationCap, BookOpen, Trees, ShoppingBag, Pizza, Users, Heart, MapPin,
  Car, Bike, Bus, Train, Plane, Hospital, Church, Building, Gamepad2, Music,
  Camera, Gift, Coffee, Apple, Dumbbell, Palette, Star, Sun, Moon, Cloud,
  Umbrella, Flower
} from "lucide-react-native";
import React, { useEffect } from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";

import { useTheme } from '@/constants/theme';
import { PlaceCategory, CustomCategory } from "@/types/navigation";
import { auditTouchTarget } from "@/utils/touchTargetAudit";

type CategoryButtonProps = {
  category?: PlaceCategory;
  customCategory?: CustomCategory;
  onPress: (category: PlaceCategory | string) => void;
  size?: 'small' | 'medium' | 'large';
};

const CategoryButtonComponent: React.FC<CategoryButtonProps> = ({ 
  category, 
  customCategory, 
  onPress, 
  size = 'large' 
}) => {
  const theme = useTheme();
  const getIcon = (iconName: string, iconSize: number) => {
  const iconProps = { size: iconSize, color: theme.colors.primaryForeground };
    
    switch (iconName) {
      case "Home": return <Home {...iconProps} />;
      case "GraduationCap": return <GraduationCap {...iconProps} />;
      case "BookOpen": return <BookOpen {...iconProps} />;
      case "Trees": return <Trees {...iconProps} />;
      case "ShoppingBag": return <ShoppingBag {...iconProps} />;
      case "Pizza": return <Pizza {...iconProps} />;
      case "Users": return <Users {...iconProps} />;
      case "Heart": return <Heart {...iconProps} />;
      case "Car": return <Car {...iconProps} />;
      case "Bike": return <Bike {...iconProps} />;
      case "Bus": return <Bus {...iconProps} />;
      case "Train": return <Train {...iconProps} />;
      case "Plane": return <Plane {...iconProps} />;
      case "Hospital": return <Hospital {...iconProps} />;
      case "Church": return <Church {...iconProps} />;
      case "Building": return <Building {...iconProps} />;
      case "Gamepad2": return <Gamepad2 {...iconProps} />;
      case "Music": return <Music {...iconProps} />;
      case "Camera": return <Camera {...iconProps} />;
      case "Gift": return <Gift {...iconProps} />;
      case "Coffee": return <Coffee {...iconProps} />;
      case "Apple": return <Apple {...iconProps} />;
      case "Dumbbell": return <Dumbbell {...iconProps} />;
      case "Palette": return <Palette {...iconProps} />;
      case "Star": return <Star {...iconProps} />;
      case "Sun": return <Sun {...iconProps} />;
      case "Moon": return <Moon {...iconProps} />;
      case "Cloud": return <Cloud {...iconProps} />;
      case "Umbrella": return <Umbrella {...iconProps} />;
      case "Flower": return <Flower {...iconProps} />;
      default: return <MapPin {...iconProps} />;
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
    // Map categories to semantic theme colors to preserve contrast.
    switch (cat) {
      case 'home': return theme.colors.primary;
      case 'school': return theme.colors.warning; // visually distinct
      case 'library': return theme.colors.info;   // reuse info color
      case 'park': return theme.colors.success;
      case 'store': return theme.colors.secondary;
      case 'restaurant': return theme.colors.error;
      case 'friend': return theme.colors.focus;
      case 'family': return theme.colors.secondary;
      default: return theme.colors.primary;
    }
  }

  useEffect(() => {
    auditTouchTarget({ name: 'CategoryButton', width: sizeStyles.width, height: sizeStyles.height, hitSlop: 8 });
  }, [sizeStyles.width, sizeStyles.height]);

  return (
  <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${displayName} category button`}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        {
      backgroundColor,
          width: sizeStyles.width,
          height: sizeStyles.height,
      borderWidth: 2,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.text,
        },
        pressed && styles.pressed
      ]}
      onPress={() => onPress(categoryId || 'other')}
      testID={`category-button-${categoryId}`}
    >
      <View style={styles.iconContainer}>
        {getIcon(iconName, sizeStyles.iconSize)}
      </View>
    <Text style={[styles.text, { fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16, color: theme.colors.primaryForeground }]}>
        {displayName}
      </Text>
    </Pressable>
  );
};

const CategoryButton = React.memo(CategoryButtonComponent, (prev, next) => {
  return prev.customCategory === next.customCategory && prev.category === next.category && prev.size === next.size;
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 20,
    elevation: 6,
    justifyContent: 'center',
    margin: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  iconContainer: {
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CategoryButton;
