// app/tabs/safety.tsx - Safety tab integration
import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import SafetyDashboard from '../../src/components/SafetyDashboard'
import SafetyErrorBoundary from '../../src/components/SafetyErrorBoundary'

export default function SafetyScreen() {
  return (
    <View style={styles.container}>
      <SafetyErrorBoundary
        componentName="Safety Dashboard"
        fallbackMessage="The main safety dashboard encountered an error. Your safety features may be temporarily unavailable."
      >
        <SafetyDashboard
          visible={true}
          onClose={() => {
            // In a full implementation, this might navigate back
            // For now, it's always visible in this tab
          }}
        />
      </SafetyErrorBoundary>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
