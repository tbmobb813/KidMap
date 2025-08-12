import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function IndexPage() {
  console.log('Index page is rendering - Platform:', Platform.OS);
  console.log('Current time:', new Date().toISOString());
  
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Text style={styles.title}>🎉 KidMap is Working!</Text>
        <Text style={styles.text}>Platform: {Platform.OS}</Text>
        <Text style={styles.text}>Time: {new Date().toLocaleTimeString()}</Text>
        <Text style={styles.text}>If you can see this, the app is loading correctly!</Text>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 30,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 15,
    textAlign: 'center',
  },
});
