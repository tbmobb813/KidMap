// screens/ParentLockScreen.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useParentalControlStore } from '@/stores/parentalControlStore'

const ParentLockScreen: React.FC = () => {
  const { isLocked, unlockScreen } = useParentalControlStore()
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Don't render if not locked
  if (!isLocked) {
    return null
  }

  const handleUnlock = async () => {
    setIsLoading(true)

    try {
      // For now, we'll use a simple PIN check
      // In a real app, this would validate against stored PIN or use biometric auth
      if (pin === '1234' || pin.length >= 4) {
        unlockScreen()
        setPin('')
      } else {
        Alert.alert(
          'Invalid PIN',
          'Please enter the correct PIN to unlock parental controls.',
        )
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to unlock. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit)
    }
  }

  const handleClearPin = () => {
    setPin('')
  }

  const renderPinDots = () => {
    return (
      <View style={styles.pinContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[styles.pinDot, index < pin.length && styles.pinDotFilled]}
          />
        ))}
      </View>
    )
  }

  const renderNumberPad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'clear']

    return (
      <View style={styles.numberPad}>
        {numbers.map((num, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.numberButton, num === '' && styles.emptyButton]}
            onPress={() => {
              if (num === 'clear') {
                handleClearPin()
              } else if (num !== '') {
                handlePinInput(num.toString())
              }
            }}
            disabled={num === '' || isLoading}
          >
            <Text style={styles.numberButtonText}>
              {num === 'clear' ? '⌫' : num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Parent Verification</Text>
          <Text style={styles.subtitle}>
            Enter your PIN to access parental controls
          </Text>
        </View>

        {/* PIN Input Display */}
        {renderPinDots()}

        {/* Number Pad */}
        {renderNumberPad()}

        {/* Alternative unlock method */}
        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={() => {
            Alert.alert(
              'Alternative Unlock',
              'In a full implementation, this would use biometric authentication or recovery options.',
            )
          }}
        >
          <Text style={styles.alternativeButtonText}>
            Use Biometric Authentication
          </Text>
        </TouchableOpacity>

        {/* Manual unlock button for testing */}
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlock}
          disabled={isLoading || pin.length === 0}
        >
          <Text style={styles.unlockButtonText}>
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 300,
    marginBottom: 30,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  alternativeButton: {
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  alternativeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  unlockButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    opacity: 1,
  },
  unlockButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default ParentLockScreen
