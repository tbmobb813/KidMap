import { Clock } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import TransitStepIndicator from "./TransitStepIndicator";

import { useTheme } from "@/constants/theme";
import { TransitStep } from "@/types/navigation";

type DirectionStepProps = {
  step: TransitStep | null | undefined;
  isLast: boolean;
};

const DirectionStep: React.FC<DirectionStepProps> = ({ step, isLast }) => {
  const theme = useTheme();
  // Defensive guards & fallbacks to avoid runtime crashes on malformed data
  if (!step) {
    return (
      <View style={styles.container} accessible accessibilityRole="summary" accessibilityLabel="Unavailable step">
        <View style={styles.leftColumn}>
          <View style={[styles.placeholderIndicator, { backgroundColor: theme.colors.border }]} />
          {!isLast && <View style={styles.connector} />}
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.stepType}>Step unavailable</Text>
          <Text style={styles.locationText}>Data missing</Text>
        </View>
      </View>
    );
  }

  const typeLabel = step.type
    ? step.type.charAt(0).toUpperCase() + step.type.slice(1)
    : "Step";
  const durationLabel = Number.isFinite(step.duration) ? `${step.duration} min` : "--";
  const fromText = step.from || "Unknown start";
  const toText = step.to || "Unknown destination";

  return (
    <View style={styles.container} accessibilityRole="summary" accessibilityLabel={`${typeLabel} step from ${fromText} to ${toText}`}>
      <View style={styles.leftColumn}>
        <TransitStepIndicator step={step as TransitStep} size="large" />
        {!isLast && <View style={styles.connector} />}
      </View>

      <View style={styles.rightColumn}>
        <View style={styles.headerRow}>
          <Text style={[styles.stepType, { color: theme.colors.text }]}> 
            {typeLabel}
            {step.line && ` Line ${step.line}`}
          </Text>
          <Text style={[styles.duration, { color: theme.colors.primary }]}>{durationLabel}</Text>
        </View>

        <View style={[styles.locationContainer, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text, borderColor: theme.colors.border }]}> 
          <View style={styles.locationRow}>
            <Text style={[styles.locationLabel, { color: theme.colors.textSecondary }]}>From:</Text>
            <Text style={[styles.locationText, { color: theme.colors.text }]}>{fromText}</Text>
          </View>

            <View style={styles.locationRow}>
            <Text style={[styles.locationLabel, { color: theme.colors.textSecondary }]}>To:</Text>
            <Text style={[styles.locationText, { color: theme.colors.text }]}>{toText}</Text>
          </View>
        </View>

        {step.departureTime && step.arrivalTime && (
          <View style={styles.timeContainer}>
            <Clock size={14} color={theme.colors.textSecondary} style={styles.clockIcon} />
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {step.departureTime} - {step.arrivalTime}
            </Text>
            {step.stops !== undefined && (
              <Text style={[styles.stopsText, { color: theme.colors.textSecondary }]}>
                {step.stops} {step.stops === 1 ? "stop" : "stops"}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  clockIcon: {
    marginRight: 4,
  },
  connector: {
    backgroundColor: '#000', // will be overridden dynamically where needed in future (kept simple)
    flex: 1,
    marginBottom: -8,
    marginTop: 8,
    width: 2,
  },
  container: {
    flexDirection: "row",
    marginBottom: 16,
  },
  duration: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leftColumn: {
    alignItems: "center",
    marginRight: 16,
  },
  locationContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  locationLabel: {
    fontSize: 14,
    width: 50,
  },
  locationRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  placeholderIndicator: {
    borderRadius: 20,
    height: 40,
    opacity: 0.5,
    width: 40,
  },
  rightColumn: {
    flex: 1,
  },
  stepType: {
    fontSize: 16,
    fontWeight: "600",
  },
  stopsText: {
    fontSize: 14,
  },
  timeContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  timeText: {
    fontSize: 14,
    marginRight: 8,
  },
});

export default DirectionStep;
