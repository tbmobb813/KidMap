// app/tabs/safety.tsx - Safety tab integration
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SafetyDashboard from '@/components/SafetyDashboard';

export default function SafetyScreen() {
  return (
    <View style={styles.container}>
      <SafetyDashboard 
        visible={true} 
        onClose={() => {
          // In a full implementation, this might navigate back
          // For now, it's always visible in this tab
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
