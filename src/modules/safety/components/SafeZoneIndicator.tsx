import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SafeZoneIndicator: React.FC = () => {
	return (
		<View style={styles.indicator}>
			<Text style={styles.text}>Safe Zones: OK</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	indicator: {
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	text: {
		fontSize: 12,
		color: '#4B5563',
	},
});
