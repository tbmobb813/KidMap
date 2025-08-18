import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/constants/theme";


export const SafeZoneIndicator: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={styles.indicator}>
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        Safe Zones: OK
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 12,
  },
});
