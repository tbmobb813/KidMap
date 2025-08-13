import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useTheme } from '@/constants/theme';
import { useSafeZoneMonitor } from '@/modules/safety/hooks/useSafeZoneMonitor';


const SafetyDashboard: React.FC = () => {
  const { isMonitoring, getCurrentSafeZoneStatus, events } = useSafeZoneMonitor();
  const theme = useTheme();
  const status = getCurrentSafeZoneStatus();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Safety Dashboard</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text }]}> 
        <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>Monitoring</Text>
        <Text style={[styles.value, { color: isMonitoring ? theme.colors.success : theme.colors.error }]}>{isMonitoring ? 'Active' : 'Inactive'}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text }]}> 
        <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>Safe Zones Inside</Text>
        <Text style={[styles.value, { color: theme.colors.primary }]}>{status?.inside.length ?? 0} / {status?.totalActive ?? 0}</Text>
        {!!status?.inside.length && status.inside.map(z => (
          <Text key={z.id} style={[styles.listItem, { color: theme.colors.textSecondary }]}>• {z.name}</Text>
        ))}
      </View>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text }]}> 
        <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>Recent Events</Text>
        {events.length === 0 && <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>No events yet</Text>}
        {events.slice(0,5).map(e => (
          <Text key={e.id} style={[styles.listItem, { color: theme.colors.textSecondary }]}>{e.type === 'entry' ? '⬤' : '○'} {e.zoneName}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

export default SafetyDashboard;

const styles = StyleSheet.create({
  card: { borderRadius: 12, marginBottom: 16, padding: 16, elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  container: { flex: 1 },
  content: { padding: 16 },
  empty: { fontSize: 12, fontStyle: 'italic' },
  listItem: { fontSize: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  value: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
