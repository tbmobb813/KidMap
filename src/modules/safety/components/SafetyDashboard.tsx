import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeZoneMonitor } from '../hooks/useSafeZoneMonitor';
import Colors from '@/constants/colors';

const SafetyDashboard: React.FC = () => {
  const { isMonitoring, getCurrentSafeZoneStatus, events } = useSafeZoneMonitor();
  const status = getCurrentSafeZoneStatus();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Safety Dashboard</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monitoring</Text>
        <Text style={styles.value}>{isMonitoring ? 'Active' : 'Inactive'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Safe Zones Inside</Text>
        <Text style={styles.value}>{status?.inside.length ?? 0} / {status?.totalActive ?? 0}</Text>
        {!!status?.inside.length && status.inside.map(z => (
          <Text key={z.id} style={styles.listItem}>• {z.name}</Text>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Events</Text>
        {events.length === 0 && <Text style={styles.empty}>No events yet</Text>}
        {events.slice(0,5).map(e => (
          <Text key={e.id} style={styles.listItem}>{e.type === 'entry' ? '⬤' : '○'} {e.zoneName}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

export default SafetyDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  card: { backgroundColor: Colors.card, padding: 16, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  value: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  listItem: { fontSize: 12, color: Colors.textLight },
  empty: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic' },
});
