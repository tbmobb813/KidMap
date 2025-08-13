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
		color: '/*TODO theme*/ theme.colors.placeholder /*#4B5563*/',
		fontSize: 12,
	},
});
