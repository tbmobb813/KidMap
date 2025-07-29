// components/ParentAuthentication.tsx - Parent login/authentication screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
  Vibration,
} from 'react-native';
import {
  Shield,
  Lock,
  Fingerprint,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import AccessibleButton from './AccessibleButton';
import { useParentalControlStore } from '../stores/parentalControlStore';
import * as LocalAuthentication from 'expo-local-authentication';

interface ParentAuthenticationProps {
  visible: boolean;
  onAuthenticated: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function ParentAuthentication({
  visible,
  onAuthenticated,
  onCancel,
  title = 'Parent Access Required',
  subtitle = 'Please authenticate to access parental controls'
}: ParentAuthenticationProps) {
  const {
    settings,
    authenticateParent,
    session,
    isSessionValid,
  } = useParentalControlStore();

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric'>('pin');
  
  // Animation values
  const shakeAnimation = new Animated.Value(0);
  const scaleAnimation = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Check if session is already valid
      if (isSessionValid()) {
        onAuthenticated();
        return;
      }

      // Check biometric availability
      checkBiometricAvailability();
      
      // Reset state
      setPin('');
      setAttemptCount(0);
      
      // Auto-trigger biometric if available and preferred
      if (settings.authenticationMethod !== 'pin') {
        setTimeout(() => {
          handleBiometricAuth();
        }, 500);
      }
    } else {
      scaleAnimation.setValue(0);
    }
  }, [visible]);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
      
      if (hasHardware && isEnrolled && settings.authenticationMethod !== 'pin') {
        setAuthMethod('biometric');
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Auto-submit when PIN reaches expected length
      if (newPin.length === (settings.pin?.length || 4)) {
        setTimeout(() => handlePinAuth(newPin), 100);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handlePinAuth = async (pinToCheck?: string) => {
    const pinValue = pinToCheck || pin;
    
    if (pinValue.length === 0) return;

    setIsAuthenticating(true);
    
    try {
      const success = await authenticateParent(pinValue, false);
      
      if (success) {
        // Success animation
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        
        setTimeout(() => {
          onAuthenticated();
          setPin('');
        }, 300);
      } else {
        // Failed authentication
        setAttemptCount(prev => prev + 1);
        setPin('');
        
        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
        
        // Vibrate on error
        Vibration.vibrate(200);
        
        if (attemptCount >= 2) {
          Alert.alert(
            'Authentication Failed',
            'Too many failed attempts. Please try again later or use biometric authentication.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('PIN authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      setAuthMethod('pin');
      return;
    }

    setIsAuthenticating(true);
    
    try {
      const success = await authenticateParent(undefined, true);
      
      if (success) {
        onAuthenticated();
      } else {
        // Fallback to PIN if biometric fails
        setAuthMethod('pin');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setAuthMethod('pin');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const renderPinKeypad = () => (
    <View style={styles.keypad}>
      <View style={styles.keypadRow}>
        {[1, 2, 3].map(num => (
          <TouchableOpacity
            key={num}
            style={styles.keypadButton}
            onPress={() => handlePinDigit(num.toString())}
            accessibilityLabel={`PIN digit ${num}`}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.keypadRow}>
        {[4, 5, 6].map(num => (
          <TouchableOpacity
            key={num}
            style={styles.keypadButton}
            onPress={() => handlePinDigit(num.toString())}
            accessibilityLabel={`PIN digit ${num}`}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.keypadRow}>
        {[7, 8, 9].map(num => (
          <TouchableOpacity
            key={num}
            style={styles.keypadButton}
            onPress={() => handlePinDigit(num.toString())}
            accessibilityLabel={`PIN digit ${num}`}
          >
            <Text style={styles.keypadButtonText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.keypadRow}>
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => setShowPin(!showPin)}
          accessibilityLabel={showPin ? 'Hide PIN' : 'Show PIN'}
        >
          {showPin ? (
            <EyeOff size={24} color={Colors.textLight} />
          ) : (
            <Eye size={24} color={Colors.textLight} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={() => handlePinDigit('0')}
          accessibilityLabel="PIN digit 0"
        >
          <Text style={styles.keypadButtonText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.keypadButton}
          onPress={handlePinDelete}
          accessibilityLabel="Delete PIN digit"
        >
          <Text style={styles.keypadDeleteText}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPinDisplay = () => (
    <View style={styles.pinDisplay}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            {
              backgroundColor: index < pin.length ? Colors.primary : Colors.border,
            },
          ]}
        >
          {showPin && index < pin.length && (
            <Text style={styles.pinDigitText}>{pin[index]}</Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderBiometricPrompt = () => (
    <View style={styles.biometricContainer}>
      <TouchableOpacity
        style={styles.biometricButton}
        onPress={handleBiometricAuth}
        disabled={isAuthenticating}
        accessibilityLabel="Use biometric authentication"
      >
        {isAuthenticating ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <>
            <Fingerprint size={64} color={Colors.primary} />
            <Text style={styles.biometricText}>Tap to use biometric authentication</Text>
          </>
        )}
      </TouchableOpacity>
      
      {settings.authenticationMethod === 'both' && (
        <TouchableOpacity
          style={styles.switchMethodButton}
          onPress={() => setAuthMethod('pin')}
        >
          <Text style={styles.switchMethodText}>Use PIN instead</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: scaleAnimation },
                { translateX: shakeAnimation },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Shield size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCancel}
              accessibilityLabel="Cancel authentication"
            >
              <X size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          {attemptCount > 0 && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.errorText}>
                Invalid PIN. {3 - attemptCount} attempts remaining.
              </Text>
            </View>
          )}

          {authMethod === 'biometric' ? (
            renderBiometricPrompt()
          ) : (
            <View style={styles.pinContainer}>
              <View style={styles.pinHeader}>
                <Lock size={24} color={Colors.primary} />
                <Text style={styles.pinTitle}>Enter Parent PIN</Text>
              </View>
              
              {renderPinDisplay()}
              {renderPinKeypad()}
              
              {settings.authenticationMethod === 'both' && biometricAvailable && (
                <TouchableOpacity
                  style={styles.switchMethodButton}
                  onPress={() => setAuthMethod('biometric')}
                >
                  <Fingerprint size={16} color={Colors.primary} />
                  <Text style={styles.switchMethodText}>Use biometric instead</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isAuthenticating && authMethod === 'pin' && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Authenticating...</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  biometricContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  biometricButton: {
    alignItems: 'center',
    padding: 20,
  },
  biometricText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  pinContainer: {
    alignItems: 'center',
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 8,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDigitText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.background,
  },
  keypad: {
    alignItems: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  keypadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.text,
  },
  keypadDeleteText: {
    fontSize: 20,
    color: Colors.textLight,
  },
  switchMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
  },
  switchMethodText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
  },
});
