import { Clock, MapPin, RefreshCw, Bell } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";

import TransitStepIndicator from "./TransitStepIndicator";

import { useTheme } from "@/constants/theme";

export type LiveArrival = {
  id: string;
  line: string;
  color: string;
  destination: string;
  arrivalTime: number; // minutes
  platform?: string;
  type: "subway" | "train" | "bus";
};

type LiveArrivalsCardProps = {
  stationName: string;
  arrivals: LiveArrival[];
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

const LiveArrivalsCard: React.FC<LiveArrivalsCardProps> = ({
  stationName,
  arrivals,
  lastUpdated = "Just now",
  onRefresh,
  isRefreshing = false
}) => {
  const theme = useTheme();
  const [alertedArrivals, setAlertedArrivals] = useState<Set<string>>(new Set());

  // Alert for trains arriving soon
  useEffect(() => {
    arrivals.forEach(arrival => {
      if (arrival.arrivalTime <= 1 && !alertedArrivals.has(arrival.id)) {
        setAlertedArrivals(prev => new Set([...prev, arrival.id]));
      }
    });
  }, [arrivals]);

  const getArrivalTimeColor = (minutes: number) => {
    if (minutes === 0) return theme.colors.error;
    if (minutes <= 2) return theme.colors.warning;
    return theme.colors.primary;
  };

  const getArrivalTimeText = (minutes: number) => {
    if (minutes === 0) return "Arriving";
    if (minutes === 1) return "1 min";
    return `${minutes} min`;
  };

  const renderArrival = ({ item }: { item: LiveArrival }) => (
    <View style={[
      styles.arrivalItem,
      item.arrivalTime <= 1 && [styles.urgentArrival, { borderLeftColor: theme.colors.warning, backgroundColor: theme.colors.surfaceAlt }]
    ]}>
      <TransitStepIndicator 
        step={{
          id: item.id,
          type: item.type,
          line: item.line,
          color: item.color,
          from: "",
          to: "",
          duration: 0
        }}
        size="medium"
      />
      <View style={styles.arrivalInfo}>
        <Text style={[styles.destinationText, { color: theme.colors.text }]} numberOfLines={1}>
          {item.destination}
        </Text>
        {item.platform && (
          <Text style={[styles.platformText, { color: theme.colors.textSecondary }]}>Platform {item.platform}</Text>
        )}
      </View>
      <View style={styles.timeContainer}>
        {item.arrivalTime <= 1 && (
          <Bell size={14} color={theme.colors.warning} style={styles.alertIcon} />
        )}
        <Text style={[
          styles.arrivalTime,
          { color: getArrivalTimeColor(item.arrivalTime) }
        ]}>
          {getArrivalTimeText(item.arrivalTime)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text }]}> 
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}> 
        <View style={styles.stationInfo}>
          <MapPin size={20} color={theme.colors.primary} style={styles.stationIcon} />
          <Text style={[styles.stationName, { color: theme.colors.text }]}>{stationName}</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.updateInfo}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.updateText, { color: theme.colors.textSecondary }]}>{lastUpdated}</Text>
          </View>
          {onRefresh && (
            <Pressable 
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw 
                size={16} 
                color={theme.colors.primary} 
                style={[styles.refreshIcon, isRefreshing && styles.spinning]}
              />
            </Pressable>
          )}
        </View>
      </View>

      {arrivals.length > 0 ? (
        <FlatList
          data={arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime)}
          renderItem={renderArrival}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.arrivalsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No arrivals scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  alertIcon: {
    // Alert icon styles
  },
  arrivalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  arrivalItem: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 50,
    textAlign: "right",
  },
  arrivalsList: {
    gap: 8,
  },
  container: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  destinationText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  platformText: {
    fontSize: 12,
    fontWeight: "500",
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    // Add spinning animation styles if needed
  },
  spinning: {
    // Animation styles for spinning refresh icon
  },
  stationIcon: {
    marginRight: 8,
  },
  stationInfo: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  stationName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  timeContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  updateInfo: {
    alignItems: "center",
    flexDirection: "row",
  },
  updateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  urgentArrival: {
  borderLeftWidth: 3,
  },
});

export default LiveArrivalsCard;
