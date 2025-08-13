import { MapPin } from "lucide-react-native";
import React, { useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";

import { useTheme } from "@/constants/theme";

type MapPlaceholderProps = {
  message?: string;
};

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ 
  message = "Map will appear here" 
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MapPin size={40} color={theme.colors.primary} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 12,
    height: 300,
    justifyContent: "center",
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 40,
    elevation: 3,
    height: 80,
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 80,
  },
  message: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default MapPlaceholder;
