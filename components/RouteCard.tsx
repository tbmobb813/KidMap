import { Clock, ArrowRight } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import TransitStepIndicator from "./TransitStepIndicator";

import { ROUTE_A11Y } from '@/constants/a11yLabels';
import { useTheme } from '@/constants/theme';
import { Route } from "@/types/navigation";

type RouteCardProps = {
  route: Route | null | undefined;
  onPress: (route: Route) => void;
  isSelected?: boolean;
};

const RouteCardComponent: React.FC<RouteCardProps> = ({ route, onPress, isSelected = false }) => {
  const theme = useTheme();
  if (!route) {
    return (
      <View style={[styles.container, styles.unavailable]}>
        <Text style={styles.unavailableText}>Route unavailable</Text>
      </View>
    );
  }

  const durationLabel = Number.isFinite(route.totalDuration) ? `${route.totalDuration} min` : '--';
  const departure = route.departureTime || '--';
  const arrival = route.arrivalTime || '--';
  const steps = Array.isArray(route.steps) ? route.steps : [];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ROUTE_A11Y.optionFor(durationLabel)}
      accessibilityHint="Selects this route option"
      accessibilityState={{ selected: isSelected }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text, borderColor: isSelected ? theme.colors.primary : 'transparent' },
        isSelected && styles.selected,
        pressed && [{ backgroundColor: theme.colors.surfaceAlt }, styles.pressed],
      ]}
      onPress={() => onPress(route)}
      disabled={!route}
      testID={`route-card-${route.id}`}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.duration, { color: theme.colors.text }]}>{durationLabel}</Text>
        <View style={styles.timeRow}>
          <Clock size={14} color={theme.colors.textSecondary} style={styles.clockIcon} />
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {departure} - {arrival}
          </Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        {steps.length === 0 && (
          <Text style={[styles.emptySteps, { color: theme.colors.textSecondary }]}>No steps</Text>
        )}
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <TransitStepIndicator step={step} />
            {index < steps.length - 1 && (
              <ArrowRight size={14} color={theme.colors.textSecondary} style={styles.arrowIcon} />
            )}
          </View>
        ))}
      </View>
    </Pressable>
  );
};

const RouteCard = React.memo(RouteCardComponent, (prev, next) => {
  return prev.isSelected === next.isSelected && prev.route === next.route;
});

const styles = StyleSheet.create({
  arrowIcon: {
    marginHorizontal: 4,
  },
  clockIcon: {
    marginRight: 4,
  },
  container: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
  },
  duration: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySteps: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  selected: {},
  stepRow: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: 4,
  },
  stepsContainer: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  timeText: {
    fontSize: 14,
  },
  unavailable: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  unavailableText: {
    fontSize: 14,
    fontStyle: 'italic'
  },
});

export default RouteCard;
