// components/SafetyErrorBoundary.tsx - Specialized error boundary for safety-critical components
import React from 'react'
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native'
import Colors from '@/constants/colors'
import { Shield, AlertTriangle, RefreshCw, Phone } from 'lucide-react-native'

type SafetyErrorBoundaryState = {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

type SafetyErrorBoundaryProps = {
  children: React.ReactNode
  componentName: string
  fallbackMessage?: string
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class SafetyErrorBoundary extends React.Component<
  SafetyErrorBoundaryProps,
  SafetyErrorBoundaryState
> {
  constructor(props: SafetyErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<SafetyErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for safety-critical components
    console.error(
      `Safety component error in ${this.props.componentName}:`,
      error,
      errorInfo,
    )

    // Store error info for debugging
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // For safety-critical errors, consider notifying parents/guardians
    this.handleSafetyCriticalError(error)
  }

  handleSafetyCriticalError = (error: Error) => {
    // In a real implementation, this could send alerts to parents
    console.warn('Safety-critical component failure:', error.message)

    // Could integrate with notification system
    // sendEmergencyNotification('Safety system error detected');
  }

  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleEmergencyContact = () => {
    Alert.alert(
      'Emergency Contact',
      'Would you like to contact your emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, this would call the emergency contact
            console.log('Emergency contact called')
          },
        },
      ],
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Shield size={48} color={Colors.error} />
          <Text style={styles.title}>Safety Feature Unavailable</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ||
              `The ${this.props.componentName} safety feature encountered an error and needs to restart.`}
          </Text>

          {/* Error details for debugging */}
          {__DEV__ && this.state.error && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>{this.state.error.message}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable style={styles.retryButton} onPress={this.retry}>
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Restart Safety Feature</Text>
            </Pressable>

            <Pressable
              style={styles.emergencyButton}
              onPress={this.handleEmergencyContact}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Emergency Contact</Text>
            </Pressable>
          </View>

          <Text style={styles.helpText}>
            If this problem continues, please contact your parent or guardian.
          </Text>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: Colors.text.primaryLight,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  debugInfo: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontFamily: 'monospace',
  },
})

export default SafetyErrorBoundary
