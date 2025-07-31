import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import Colors from '@/constants/colors';
import TransitStepIndicator from './TransitStepIndicator';
import { Clock, MapPin, RefreshCw, Bell } from 'lucide-react-native';

export type LiveArrival = {
  id: string;
  line: string;
  color: string;
  destination: string;
  arrivalTime: number; // minutes
  platform?: string;
  type: 'subway' | 'train' | 'bus';
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
  lastUpdated = 'Just now',
  onRefresh,
  isRefreshing = false,
}) => {
  const [alertedArrivals, setAlertedArrivals] = useState<Set<string>>(new Set());

  // Alert for trains arriving soon
  useEffect(() => {
    arrivals.forEach((arrival) => {
      if (arrival.arrivalTime <= 1 && !alertedArrivals.has(arrival.id)) {
        setAlertedArrivals((prev) => new Set([...prev, arrival.id]));
      }
    });
  }, [arrivals]);

  const getArrivalTimeColor = (minutes: number) => {
    if (minutes === 0) return Colors.error;
    if (minutes <= 2) return Colors.warning;
    return Colors.primary;
  };

  const getArrivalTimeText = (minutes: number) => {
    if (minutes === 0) return 'Arriving';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  };

  const renderArrival = ({ item }: { item: LiveArrival }) => (
    <View style={[styles.arrivalItem, item.arrivalTime <= 1 && styles.urgentArrival]}>
      <TransitStepIndicator
        step={{
          id: item.id,
          type: item.type,
          line: item.line,
          color: item.color,
          from: '',
          to: '',
          duration: 0,
        }}
        size="medium"
      />
      <View style={styles.arrivalInfo}>
        <Text style={styles.destinationText} numberOfLines={1}>
          {item.destination}
        </Text>
        {item.platform && <Text style={styles.platformText}>Platform {item.platform}</Text>}
      </View>
      <View style={styles.timeContainer}>
        {item.arrivalTime <= 1 && (
          <Bell size={14} color={Colors.warning} style={styles.alertIcon} />
        )}
        <Text style={[styles.arrivalTime, { color: getArrivalTimeColor(item.arrivalTime) }]}>
          {getArrivalTimeText(item.arrivalTime)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stationInfo}>
          <MapPin size={20} color={Colors.primary} style={styles.stationIcon} />
          <Text style={styles.stationName}>{stationName}</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.updateInfo}>
            <Clock size={14} color={Colors.textLight} />
            <Text style={styles.updateText}>{lastUpdated}</Text>
          </View>
          {onRefresh && (
            <Pressable style={styles.refreshButton} onPress={onRefresh} disabled={isRefreshing}>
              <RefreshCw
                size={16}
                color={Colors.primary}
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
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.arrivalsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No arrivals scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stationIcon: {
    marginRight: 8,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
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
  arrivalsList: {
    gap: 8,
  },
  arrivalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  urgentArrival: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  arrivalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  destinationText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  platformText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertIcon: {
    // Alert icon styles
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});

export default LiveArrivalsCard;
