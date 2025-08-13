import { WifiOff } from "lucide-react-native";
import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/constants/theme";

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Simulate network status checking
  useEffect(() => {
    // In a real app, you'd use NetInfo or similar
    const checkConnection = () => {
      // Mock offline detection
      setIsOnline(Math.random() > 0.1); // 90% chance of being online
    };

    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color={theme.colors.warning} />
      <Text style={styles.text}>Offline Mode - Limited features available</Text>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.warning,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    color: theme.colors.onWarning,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default OfflineIndicator;
