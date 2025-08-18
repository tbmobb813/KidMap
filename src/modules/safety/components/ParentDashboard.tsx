import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

type Props = { onExit: () => void };

const ParentDashboard: React.FC<Props> = ({ onExit }) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Parent Dashboard</Text>
			<Pressable onPress={onExit} style={styles.button}>
				<Text style={styles.buttonText}>Exit</Text>
			</Pressable>
		</View>
	);
};

export default ParentDashboard;

const styles = StyleSheet.create({
	button: { backgroundColor: '#4A80F0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
	buttonText: { color: '#fff', fontWeight: '600' },
	container: { padding: 16 },
	title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
});
