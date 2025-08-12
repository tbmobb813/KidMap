import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type SafetyPanelProps = {
	currentLocation?: { latitude: number; longitude: number } | null;
	currentPlace?: { id: string; name: string } | undefined;
};

const SafetyPanel: React.FC<SafetyPanelProps> = ({ currentLocation, currentPlace }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Safety</Text>
			{currentPlace ? (
				<Text style={styles.text}>Destination: {currentPlace.name}</Text>
			) : (
				<Text style={styles.text}>No destination selected</Text>
			)}
			{currentLocation ? (
				<Text style={styles.text}>
					Location: {currentLocation.latitude.toFixed(3)}, {currentLocation.longitude.toFixed(3)}
				</Text>
			) : null}
		</View>
	);
};

export default SafetyPanel;

const styles = StyleSheet.create({
	container: {
		padding: 12,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
	},
	text: {
		fontSize: 14,
	},
});
