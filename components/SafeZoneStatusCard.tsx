import { Shield, MapPin, Clock, AlertTriangle } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Ensure consistent alias import for jest.mock interception
import { useSafeZoneMonitor } from '@/modules/safety/hooks/useSafeZoneMonitor';
import { useParentalStore } from '@/modules/safety/stores/parentalStore';
import type { SafeZone } from '@/modules/safety/types/parental';

export const SafeZoneStatusCard: React.FC = () => {
  const { isMonitoring, getCurrentSafeZoneStatus, startMonitoring, stopMonitoring } = useSafeZoneMonitor();
  const { settings, safeZones } = useParentalStore();
  
  const status = getCurrentSafeZoneStatus();
  const activeSafeZones = safeZones.filter(zone => zone.isActive);

  if (!settings.safeZoneAlerts || activeSafeZones.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Shield size={24} color="/*TODO theme*/ theme.colors.placeholder /*#9CA3AF*/" />
          <Text style={styles.title}>Safe Zones</Text>
        </View>
        <Text style={styles.subtitle}>
          {activeSafeZones.length === 0 
            ? 'No safe zones configured' 
            : 'Safe zone alerts are disabled'
          }
        </Text>
      </View>
    );
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Shield 
          size={24} 
          color={isMonitoring ? '/*TODO theme*/ theme.colors.placeholder /*#10B981*/' : '/*TODO theme*/ theme.colors.placeholder /*#F59E0B*/'} 
        />
        <Text style={styles.title}>Safe Zone Status</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isMonitoring ? '/*TODO theme*/ theme.colors.placeholder /*#10B981*/' : '/*TODO theme*/ theme.colors.placeholder /*#F59E0B*/' }
        ]}>
          <Text style={styles.statusText}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {status && (
        <View style={styles.content}>
          <View style={styles.locationInfo}>
            <MapPin size={16} color="/*TODO theme*/ theme.colors.placeholder /*#6B7280*/" />
            <Text style={styles.locationText}>
              Current location tracked
            </Text>
            <Clock size={16} color="/*TODO theme*/ theme.colors.placeholder /*#6B7280*/" />
            <Text style={styles.timeText}>
              {formatTime(status.currentLocation.timestamp)}
            </Text>
          </View>

          <View style={styles.zoneStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{status.inside.length}</Text>
              <Text style={styles.statLabel}>Inside Safe Zones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{status.outside.length}</Text>
              <Text style={styles.statLabel}>Outside Safe Zones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{status.totalActive}</Text>
              <Text style={styles.statLabel}>Total Active</Text>
            </View>
          </View>

          {status.inside.length > 0 && (
            <View style={styles.insideZones}>
              <Text style={styles.sectionTitle}>Currently Inside:</Text>
              {status.inside.map((zone: SafeZone) => (
                <View key={zone.id} style={styles.zoneItem}>
                  <View style={[styles.zoneDot, { backgroundColor: '/*TODO theme*/ theme.colors.placeholder /*#10B981*/' }]} />
                  <Text style={styles.zoneName}>{zone.name}</Text>
                </View>
              ))}
            </View>
          )}

          {status.outside.length > 0 && status.inside.length === 0 && (
            <View style={styles.outsideWarning}>
              <AlertTriangle size={16} color="/*TODO theme*/ theme.colors.placeholder /*#F59E0B*/" />
              <Text style={styles.warningText}>
                Not currently in any safe zone
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: isMonitoring ? '/*TODO theme*/ theme.colors.placeholder /*#EF4444*/' : '/*TODO theme*/ theme.colors.placeholder /*#10B981*/' }
          ]}
          onPress={isMonitoring ? stopMonitoring : startMonitoring}
        >
          <Text style={styles.controlButtonText}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/',
    borderRadius: 16,
    elevation: 4,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    shadowColor: '/*TODO theme*/ theme.colors.placeholder /*#000*/',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    marginBottom: 16,
  },
  controlButton: {
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  controlButtonText: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    borderTopColor: '/*TODO theme*/ theme.colors.placeholder /*#E5E7EB*/',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  insideZones: {
    marginBottom: 16,
  },
  locationInfo: {
    alignItems: 'center',
    backgroundColor: '/*TODO theme*/ theme.colors.placeholder /*#F9FAFB*/',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  locationText: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#374151*/',
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  outsideWarning: {
    alignItems: 'center',
    backgroundColor: '/*TODO theme*/ theme.colors.placeholder /*#FEF3C7*/',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  sectionTitle: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#374151*/',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#6B7280*/',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  statNumber: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#1F2937*/',
    fontSize: 24,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#6B7280*/',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  timeText: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#6B7280*/',
    fontSize: 12,
    marginLeft: 4,
  },
  title: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#1F2937*/',
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  warningText: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#92400E*/',
    fontSize: 14,
    marginLeft: 8,
  },
  zoneDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  zoneItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 4,
  },
  zoneName: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#374151*/',
    fontSize: 14,
  },
  zoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
});
