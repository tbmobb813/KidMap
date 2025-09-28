import { Bell, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { LiveArrival } from "./LiveArrivalsCard";
import TransitStepIndicator from "./TransitStepIndicator";

import { ARRIVAL_ALERT_A11Y } from '@/constants/a11yLabels';
import { useTheme } from "@/constants/theme";

type ArrivalAlertProps = {
  arrival: LiveArrival;
  onDismiss: () => void;
};

const ArrivalAlert: React.FC<ArrivalAlertProps> = ({ arrival, onDismiss }) => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceAlt, borderLeftColor: theme.colors.warning, shadowColor: theme.colors.text }]}> 
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Bell size={20} color={theme.colors.warning} />
        </View>
        <View style={styles.alertInfo}>
          <View style={styles.trainInfo}>
            <TransitStepIndicator
              step={{
                id: arrival.id,
                type: arrival.type,
                line: arrival.line,
                color: arrival.color,
                from: "",
                to: "",
                duration: 0
              }}
              size="small"
            />
            <Text style={[styles.alertText, { color: theme.colors.text }]}>
              Line {arrival.line} to {arrival.destination} is arriving now!
            </Text>
          </View>
          {arrival.platform && (
            <Text style={[styles.platformText, { color: theme.colors.textSecondary }]}>
              Platform {arrival.platform}
            </Text>
          )}
        </View>
        <Pressable style={styles.dismissButton} onPress={onDismiss} accessibilityLabel={ARRIVAL_ALERT_A11Y.dismiss}>
          <X size={16} color={theme.colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertInfo: { flex: 1 },
  alertText: { flex: 1, fontSize: 14, fontWeight: "600", marginLeft: 8 },
  container: {
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 3,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    padding: 16,
  },
  dismissButton: {
    padding: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  platformText: { fontSize: 12, marginLeft: 32 },
  trainInfo: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 4,
  },
});

export default ArrivalAlert;
