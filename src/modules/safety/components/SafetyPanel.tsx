import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

// Use alias import so Jest tests that mock '@/modules/safety/hooks/useSafeZoneMonitor' catch this module too
import { useParentalStore } from '../stores/parentalStore';

import Toast from '@/components/Toast';
import { useTheme } from '@/constants/theme';
import { useToast } from '@/hooks/useToast';
import { useSafeZoneMonitor } from '@/modules/safety/hooks/useSafeZoneMonitor';
import { track } from '@/telemetry';

type SafetyPanelProps = {
	currentLocation?: { latitude: number; longitude: number } | null;
	currentPlace?: { id: string; name: string } | undefined;
};

const SafetyPanel: React.FC<SafetyPanelProps> = ({ currentLocation, currentPlace }) => {
	const theme = useTheme();
	const { settings } = useParentalStore();
	const { isMonitoring, startMonitoring, stopMonitoring, getCurrentSafeZoneStatus, events } = useSafeZoneMonitor();
	const status = getCurrentSafeZoneStatus();
	const lastEventIdRef = useRef<string | null>(null);
	const { toast, showToast, hideToast } = useToast();

	// Show toast for new entry/exit events if enabled
	useEffect(() => {
		if (!settings.safeZoneAlerts) return;
		const latest = events[0];
		if (latest && latest.id !== lastEventIdRef.current) {
			lastEventIdRef.current = latest.id;
			const verb = latest.type === 'entry' ? 'Entered' : 'Exited';
			// Emit telemetry for entry/exit
			track({ type: latest.type === 'entry' ? 'safe_zone_entry' : 'safe_zone_exit', zoneId: latest.zoneId, zoneName: latest.zoneName });
			showToast(`${verb} ${latest.zoneName}`, latest.type === 'entry' ? 'success' : 'warning');
		}
	}, [events, settings.safeZoneAlerts, showToast]);

	const insideCount = status?.inside.length ?? 0;
	const activeCount = status?.totalActive ?? 0;

	return (
		<View style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text }] }>
			<View style={styles.headerRow}>
				<Text style={[styles.title, { color: theme.colors.text }]}>Safety</Text>
				<Pressable
					accessibilityLabel={isMonitoring ? 'Stop monitoring safe zones' : 'Start monitoring safe zones'}
					style={[styles.monitorButton, { backgroundColor: isMonitoring ? theme.colors.error : theme.colors.primary }]}
					onPress={() => {
						if (isMonitoring) {
							stopMonitoring();
							track({ type: 'safety_monitor_toggled', enabled: false });
						} else {
							startMonitoring();
							track({ type: 'safety_monitor_toggled', enabled: true });
						}
					}}
				>
					<Text style={[styles.monitorBtnText, { color: theme.colors.primaryForeground }]}>{isMonitoring ? 'Stop' : 'Start'}</Text>
				</Pressable>
			</View>
			<View style={styles.row}>
				<Text style={[styles.label, { color: theme.colors.textSecondary }]}>Destination:</Text>
				<Text style={[styles.value, { color: theme.colors.text }]}>{currentPlace ? currentPlace.name : 'None'}</Text>
			</View>
			{currentLocation && (
				<View style={styles.row}>
					<Text style={[styles.label, { color: theme.colors.textSecondary }]}>Location:</Text>
					<Text style={[styles.value, { color: theme.colors.text }]}>
						{currentLocation.latitude.toFixed(3)}, {currentLocation.longitude.toFixed(3)}
					</Text>
				</View>
			)}
			<View style={styles.row}>
				<Text style={[styles.label, { color: theme.colors.textSecondary }]}>Zones Inside:</Text>
				<Text style={[styles.value, { color: theme.colors.text }]}>{insideCount}/{activeCount}</Text>
			</View>
			{!!status?.inside.length && (
				<View style={styles.zoneList}>
					{status.inside.map(z => (
						<Text key={z.id} style={[styles.zoneItem, { color: theme.colors.primary }]}>• {z.name}</Text>
					))}
				</View>
			)}
			{!!events.length && (
				<View style={[styles.eventContainer, { borderTopColor: theme.colors.border }] }>
					<Text style={[styles.eventsTitle, { color: theme.colors.text }]}>Recent Events</Text>
					{events.slice(0,3).map(e => (
						<Text key={e.id} style={[styles.eventItem, { color: theme.colors.textSecondary }]}>{e.type === 'entry' ? '⬤' : '○'} {e.zoneName}</Text>
					))}
				</View>
			)}
			<Toast message={toast.message} type={toast.type} visible={toast.visible} onHide={hideToast} />
		</View>
	);
};

export default SafetyPanel;

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		marginBottom: 16,
		padding: 12,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 3,
	},
	eventContainer: {
		borderTopWidth: 1,
		marginTop: 10,
		paddingTop: 8,
	},
	eventItem: {
		fontSize: 11,
	},
	eventsTitle: {
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 4,
	},
	headerRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	label: {
		fontSize: 12,
		width: 90,
	},
	monitorBtnText: { fontSize: 12, fontWeight: '600' },
	monitorButton: {
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	row: {
		flexDirection: 'row',
		marginTop: 4,
	},
	title: {
		fontSize: 16,
		fontWeight: '700',
	},
	value: {
		flex: 1,
		fontSize: 12,
	},
	zoneItem: {
		fontSize: 12,
	},
	zoneList: {
		marginTop: 8,
	},
});
