import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeZoneMonitor } from '../hooks/useSafeZoneMonitor';
import { useParentalStore } from '../stores/parentalStore';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';
import Colors from '@/constants/colors';

type SafetyPanelProps = {
	currentLocation?: { latitude: number; longitude: number } | null;
	currentPlace?: { id: string; name: string } | undefined;
};

const SafetyPanel: React.FC<SafetyPanelProps> = ({ currentLocation, currentPlace }) => {
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
			showToast(`${verb} ${latest.zoneName}`, latest.type === 'entry' ? 'success' : 'warning');
		}
	}, [events, settings.safeZoneAlerts, showToast]);

	const insideCount = status?.inside.length ?? 0;
	const activeCount = status?.totalActive ?? 0;

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={styles.title}>Safety</Text>
				<Pressable
					accessibilityLabel={isMonitoring ? 'Stop monitoring safe zones' : 'Start monitoring safe zones'}
					style={[styles.monitorButton, isMonitoring ? styles.stopBtn : styles.startBtn]}
					onPress={isMonitoring ? stopMonitoring : startMonitoring}
				>
					<Text style={styles.monitorBtnText}>{isMonitoring ? 'Stop' : 'Start'}</Text>
				</Pressable>
			</View>
			<View style={styles.row}>
				<Text style={styles.label}>Destination:</Text>
				<Text style={styles.value}>{currentPlace ? currentPlace.name : 'None'}</Text>
			</View>
			{currentLocation && (
				<View style={styles.row}>
					<Text style={styles.label}>Location:</Text>
					<Text style={styles.value}>
						{currentLocation.latitude.toFixed(3)}, {currentLocation.longitude.toFixed(3)}
					</Text>
				</View>
			)}
			<View style={styles.row}>
				<Text style={styles.label}>Zones Inside:</Text>
				<Text style={styles.value}>{insideCount}/{activeCount}</Text>
			</View>
			{!!status?.inside.length && (
				<View style={styles.zoneList}>
					{status.inside.map(z => (
						<Text key={z.id} style={styles.zoneItem}>• {z.name}</Text>
					))}
				</View>
			)}
			{!!events.length && (
				<View style={styles.eventContainer}>
					<Text style={styles.eventsTitle}>Recent Events</Text>
					{events.slice(0,3).map(e => (
						<Text key={e.id} style={styles.eventItem}>{e.type === 'entry' ? '⬤' : '○'} {e.zoneName}</Text>
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
		padding: 12,
		backgroundColor: Colors.card,
		borderRadius: 12,
		marginBottom: 16,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	title: {
		fontSize: 16,
		fontWeight: '700',
		color: Colors.text,
	},
	row: {
		flexDirection: 'row',
		marginTop: 4,
	},
	label: {
		fontSize: 12,
		color: Colors.textLight,
		width: 90,
	},
	value: {
		fontSize: 12,
		color: Colors.text,
		flex: 1,
	},
	zoneList: {
		marginTop: 8,
	},
	zoneItem: {
		fontSize: 12,
		color: Colors.primary,
	},
	eventContainer: {
		marginTop: 10,
		borderTopWidth: 1,
		borderTopColor: Colors.border,
		paddingTop: 8,
	},
	eventsTitle: {
		fontSize: 12,
		fontWeight: '600',
		color: Colors.text,
		marginBottom: 4,
	},
	eventItem: {
		fontSize: 11,
		color: Colors.textLight,
	},
	monitorButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	startBtn: { backgroundColor: Colors.primary },
	stopBtn: { backgroundColor: Colors.error },
	monitorBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
});
