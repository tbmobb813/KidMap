import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Route } from "@/types/navigation";
import Colors from "@/constants/colors";
import { Clock, ArrowRight } from "lucide-react-native";
import TransitStepIndicator from "./TransitStepIndicator";

type RouteCardProps = {
  route: Route | null | undefined;
  onPress: (route: Route) => void;
  isSelected?: boolean;
};

const RouteCardComponent: React.FC<RouteCardProps> = ({ route, onPress, isSelected = false }) => {
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
      accessibilityLabel={`Route option, duration ${durationLabel}`}
      accessibilityState={{ selected: isSelected }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(route)}
      disabled={!route}
      testID={`route-card-${route.id}`}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.duration}>{durationLabel}</Text>
        <View style={styles.timeRow}>
          <Clock size={14} color={Colors.textLight} style={styles.clockIcon} />
          <Text style={styles.timeText}>
            {departure} - {arrival}
          </Text>
        </View>
      </View>

      <View style={styles.stepsContainer}>
        {steps.length === 0 && (
          <Text style={styles.emptySteps}>No steps</Text>
        )}
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepRow}>
            <TransitStepIndicator step={step} />
            {index < steps.length - 1 && (
              <ArrowRight size={14} color={Colors.textLight} style={styles.arrowIcon} />
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
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unavailable: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  unavailableText: {
    color: Colors.textLight,
    fontSize: 14,
    fontStyle: 'italic'
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: "#EAEAEA",
  },
  timeContainer: {
    marginBottom: 12,
  },
  duration: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  emptySteps: {
    fontSize: 12,
    color: Colors.textLight,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
});

export default RouteCard;
