import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

import ErrorBoundary from '@/components/ErrorBoundary';

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
    alignItems: 'center',
    backgroundColor: '/*TODO theme*/ theme.colors.placeholder /*#f0f0f0*/',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#424242*/',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  title: {
    color: '/*TODO theme*/ theme.colors.placeholder /*#2e7d32*/',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
});
