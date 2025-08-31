import { Eye, EyeOff, Lock } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Toast from './Toast';

import { useTheme } from '@/constants/theme';
import { useToast } from '@/hooks/useToast';
import { tint } from '@/utils/color/color';


type PinAuthenticationProps = {
  onAuthenticated: () => void;
  onCancel: () => void;
  isSettingPin?: boolean;
  title?: string;
  subtitle?: string;
};

const PinAuthentication: React.FC<PinAuthenticationProps> = ({
  onAuthenticated,
  onCancel,
  isSettingPin = false,
  title = 'Parent Mode',
  subtitle = 'Enter your PIN to access parental controls',
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const { toast, showToast, hideToast } = useToast();

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      showToast('PIN must be at least 4 digits', 'error');
      return;
    }

    if (isSettingPin) {
      if (step === 'enter') {
        setStep('confirm');
        return;
      }

      if (pin !== confirmPin) {
        showToast('PINs do not match', 'error');
        setPin('');
        setConfirmPin('');
        setStep('enter');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would validate against stored PIN
      // For now, we'll simulate authentication
      await new Promise(resolve => setTimeout(resolve, 500));
      onAuthenticated();
  } catch {
      showToast('Authentication failed', 'error');
      setPin('');
      setConfirmPin('');
      setStep('enter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberPress = (number: string) => {
    if (step === 'enter') {
      if (pin.length < 6) {
        setPin(prev => prev + number);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(prev => prev + number);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'enter') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;
  const currentTitle = step === 'enter' ? title : 'Confirm PIN';
  const currentSubtitle = step === 'enter' ? subtitle : 'Enter your PIN again to confirm';

  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Lock size={32} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>{currentTitle}</Text>
        <Text style={styles.subtitle}>{currentSubtitle}</Text>
      </View>

      <View style={styles.pinContainer}>
        <View style={styles.pinInputContainer}>
          <TextInput
            style={styles.pinInput}
            value={currentPin}
            onChangeText={step === 'enter' ? setPin : setConfirmPin}
            placeholder="Enter PIN"
            secureTextEntry={!showPin}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPin(!showPin)}
          >
            {showPin ? (
              <EyeOff size={20} color={theme.colors.textSecondary} />
            ) : (
              <Eye size={20} color={theme.colors.textSecondary} />
            )}
          </Pressable>
        </View>

        <View style={styles.pinDots}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                index < currentPin.length && styles.pinDotFilled,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['', '0', '⌫'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => (
              <Pressable
                key={keyIndex}
                style={[
                  styles.keypadButton,
                  key === '' && styles.keypadButtonEmpty,
                ]}
                onPress={() => {
                  if (key === '⌫') {
                    handleBackspace();
                  } else if (key !== '') {
                    handleNumberPress(key);
                  }
                }}
                disabled={key === ''}
              >
                <Text style={styles.keypadButtonText}>{key}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.submitButton]}
          onPress={handlePinSubmit}
          disabled={isLoading || currentPin.length < 4}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Verifying...' : step === 'confirm' ? 'Confirm' : 'Submit'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
      <Toast 
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
  },
  actions: {
    gap: 12,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  eyeButton: {
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: tint(theme.colors.primary),
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  keypad: {
    marginBottom: 40,
  },
  keypadButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 30,
    elevation: 2,
    height: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 60,
  },
  keypadButtonEmpty: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  keypadButtonText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    marginBottom: 16,
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pinDot: {
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  pinDotFilled: {
    backgroundColor: theme.colors.primary,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 12,
  },
  pinInput: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 4,
  },
  pinInputContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
});

export default PinAuthentication;
