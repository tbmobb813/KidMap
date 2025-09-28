import { Bike, Car, MapPin, Train } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TRAVEL_MODE_A11Y } from '@/constants/a11yLabels';
import { useTheme } from "@/constants/theme";
import { TravelMode } from "@/types/navigation";
import { tint } from "@/utils/color/color";

type TravelModeSelectorProps = {
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
};

const TravelModeSelector: React.FC<TravelModeSelectorProps> = ({ selectedMode, onModeChange }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const modes: { mode: TravelMode; icon: React.ReactNode; label: string }[] = [
    { mode: "transit", icon: <Train size={20} />, label: "Transit" },
    { mode: "walking", icon: <MapPin size={20} />, label: "Walk" },
    { mode: "biking", icon: <Bike size={20} />, label: "Bike" },
    { mode: "driving", icon: <Car size={20} />, label: "Drive" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Travel Mode</Text>
      <View style={styles.modesContainer}>
        {modes.map(({ mode, icon, label }) => {
          const isSelected = selectedMode === mode;
          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={TRAVEL_MODE_A11Y.forLabel(label)}
              accessibilityState={{ selected: isSelected }}
              hitSlop={6}
              style={[styles.modeButton, isSelected && styles.selectedMode]}
              onPress={() => onModeChange(mode)}
              testID={`travel-mode-${mode}`}
            >
              <View style={[styles.iconContainer, isSelected && styles.selectedIcon]}>
                {React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
                  color: isSelected ? theme.colors.primaryForeground : theme.colors.textSecondary,
                })}
              </View>
              <Text style={[styles.modeLabel, isSelected && styles.selectedLabel]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 4,
  },
  modeButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  modeLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  modesContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  selectedIcon: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 4,
  },
  selectedLabel: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  selectedMode: {
    backgroundColor: tint(theme.colors.primary),
    borderColor: theme.colors.primary,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});

export default TravelModeSelector;
