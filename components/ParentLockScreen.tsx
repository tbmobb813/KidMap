import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'

const PIN_KEY = 'parent_pin'

const ParentLockScreen: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState('')
  const [mode, setMode] = useState<'enter' | 'set'>('enter')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricError, setBiometricError] = useState('')

  React.useEffect(() => {
    ;(async () => {
      const storedPin = await AsyncStorage.getItem(PIN_KEY)
      if (!storedPin) setMode('set')
      const available = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setBiometricAvailable(!!(available && enrolled))
    })()
  }, [])

  const handleUnlock = async () => {
    const storedPin = await AsyncStorage.getItem(PIN_KEY)
    if (pin === storedPin) {
      setPin('')
      onUnlock()
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.')
      setPin('')
    }
  }

  const handleSetPin = async () => {
    if (newPin.length < 4) {
      Alert.alert('PIN too short', 'PIN must be at least 4 digits.')
      return
    }
    if (newPin !== confirmPin) {
      Alert.alert('PINs do not match', 'Please re-enter your PIN.')
      return
    }
    await AsyncStorage.setItem(PIN_KEY, newPin)
    setMode('enter')
    setNewPin('')
    setConfirmPin('')
    Alert.alert('PIN Set', 'Your parent PIN has been set.')
  }

  const handleBiometricUnlock = async () => {
    setBiometricError('')
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to unlock Parent Mode',
        fallbackLabel: 'Use PIN',
      })
      if (result.success) {
        onUnlock()
      } else if (result.error) {
        setBiometricError(result.error)
      }
    } catch (e) {
      setBiometricError('Biometric authentication failed.')
    }
  }

  if (mode === 'set') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Set Parent PIN</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new PIN"
          keyboardType="number-pad"
          secureTextEntry
          value={newPin}
          onChangeText={setNewPin}
          maxLength={8}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm new PIN"
          keyboardType="number-pad"
          secureTextEntry
          value={confirmPin}
          onChangeText={setConfirmPin}
          maxLength={8}
        />
        <TouchableOpacity style={styles.button} onPress={handleSetPin}>
          <Text style={styles.buttonText}>Set PIN</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Parent PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        keyboardType="number-pad"
        secureTextEntry
        value={pin}
        onChangeText={setPin}
        maxLength={8}
      />
      <TouchableOpacity style={styles.button} onPress={handleUnlock}>
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
      {biometricAvailable && (
        <TouchableOpacity style={styles.button} onPress={handleBiometricUnlock}>
          <Text style={styles.buttonText}>Unlock with Biometrics</Text>
        </TouchableOpacity>
      )}
      {!!biometricError && (
        <Text style={styles.errorText}>{biometricError}</Text>
      )}
      <TouchableOpacity style={styles.link} onPress={() => setMode('set')}>
        <Text style={styles.linkText}>Reset PIN</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2D3A4B',
  },
  input: {
    width: 220,
    height: 48,
    borderWidth: 1,
    borderColor: '#D0D6E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4F8EF7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    color: '#4F8EF7',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
})

export default ParentLockScreen
