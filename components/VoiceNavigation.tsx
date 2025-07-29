import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, Vibration, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, HelpCircle } from 'lucide-react-native';
import { speechEngine, VoiceCommand } from '@/utils/speechEngine';

type VoiceNavigationProps = {
  currentStep?: string;
  currentLocation?: string;
  timeRemaining?: number;
  isNavigationPaused?: boolean;
  onVoiceCommand?: (action: string, context?: any) => void;
  onEmergencyCall?: () => void;
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
};

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  currentStep = 'Walk to Main Street Station',
  currentLocation = 'your current location',
  timeRemaining = 15,
  isNavigationPaused = false,
  onVoiceCommand,
  onEmergencyCall,
  onPauseNavigation,
  onResumeNavigation,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [recognizedText, setRecognizedText] = useState('');
  const [showCommands, setShowCommands] = useState(false);

  // refs to clear timers on unmount
  const listeningTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // available voice commands from speech engine
  const voiceCommands = speechEngine.getAvailableCommands();

  useEffect(() => {
    // Initialize speech engine
    speechEngine.initialize();
    
    return () => {
      // cleanup timers
      if (listeningTimeout.current) {
        clearTimeout(listeningTimeout.current);
      }
      if (speakingTimeout.current) {
        clearTimeout(speakingTimeout.current);
      }
      
      // Stop any ongoing speech
      speechEngine.stopSpeaking();
    };
  }, []);

  // Auto-announce navigation steps when they change
  useEffect(() => {
    if (isVoiceEnabled && currentStep && !isNavigationPaused) {
      handleAutoSpeak();
    }
  }, [currentStep, isVoiceEnabled, isNavigationPaused]);

  const handleAutoSpeak = async () => {
    if (await speechEngine.isSpeaking()) {
      return; // Don't interrupt current speech
    }
    
    await speechEngine.speakInstruction(currentStep, {
      location: currentLocation,
      distance: Math.floor(Math.random() * 100) + 50, // Would come from actual route data
      safety: true,
    });
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    setIsListening(true);
    setRecognizedText('Listening...');
    Vibration.vibrate(100); // Haptic feedback
    
    // Simulate voice recognition (in real app, would use expo-speech-recognition or similar)
    // For demo purposes, we'll simulate recognition with a timeout
    listeningTimeout.current = setTimeout(() => {
      simulateVoiceRecognition();
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
    setRecognizedText('');
    
    if (listeningTimeout.current) {
      clearTimeout(listeningTimeout.current);
      listeningTimeout.current = null;
    }
  };

  // Simulate voice recognition for demo (replace with actual implementation)
  const simulateVoiceRecognition = () => {
    const mockInputs = [
      'where am i',
      'repeat directions', 
      'how much time left',
      'help me',
      'pause navigation'
    ];
    
    const randomInput = mockInputs[Math.floor(Math.random() * mockInputs.length)];
    setRecognizedText(`Heard: "${randomInput}"`);
    processVoiceInput(randomInput);
    
    setTimeout(() => {
      setIsListening(false);
      setRecognizedText('');
    }, 2000);
  };

  const processVoiceInput = async (input: string) => {
    const command = speechEngine.processVoiceInput(input);
    
    if (!command) {
      await speechEngine.speak("I didn't understand that. Try saying 'help' to hear available commands.");
      return;
    }

    // Handle the command based on its action
    switch (command.action) {
      case 'location_status':
        const locationResponse = speechEngine.generateResponse('location_status', {
          location: currentLocation
        });
        await speechEngine.speak(locationResponse);
        break;
        
      case 'repeat_instruction':
        const instructionResponse = speechEngine.generateResponse('repeat_instruction', {
          instruction: currentStep
        });
        await speechEngine.speak(instructionResponse);
        break;
        
      case 'time_estimate':
        const timeResponse = speechEngine.generateResponse('time_estimate', {
          time: timeRemaining
        });
        await speechEngine.speak(timeResponse);
        break;
        
      case 'emergency_contact':
        await speechEngine.speak("I'll help you call for help right now!");
        onEmergencyCall?.();
        break;
        
      case 'pause_navigation':
        if (!isNavigationPaused) {
          await speechEngine.speak("Navigation paused. Take your time!");
          onPauseNavigation?.();
        }
        break;
        
      case 'resume_navigation':
        if (isNavigationPaused) {
          await speechEngine.speak("Let's continue! You're doing great!");
          onResumeNavigation?.();
        }
        break;
        
      case 'adjust_speed':
        speechEngine.adjustSpeechSettings({ rate: 0.6 });
        await speechEngine.speak("I'll speak more slowly now.");
        break;
        
      default:
        await speechEngine.speak("I understand! Let me help you with that.");
        break;
    }
    
    // Notify parent component
    onVoiceCommand?.(command.action, { input, command });
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      await speechEngine.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    
    try {
      await speechEngine.speakInstruction(currentStep, {
        location: currentLocation,
        distance: Math.floor(Math.random() * 100) + 50,
        safety: true,
      });
    } catch (error) {
      console.error('Speech failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    
    if (!isVoiceEnabled) {
      speechEngine.speak("Voice navigation is now on!");
    } else {
      speechEngine.speak("Voice navigation is now off.");
    }
  };

  const showHelp = () => {
    setShowCommands(!showCommands);
    if (!showCommands) {
      speechEngine.speak("Here are the commands you can say: " + voiceCommands.slice(0, 5).join(', '));
    }
  };

  return (
    <View style={styles.container}>
      {/* Voice Control Buttons */}
      <View style={styles.controlsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isVoiceEnabled ? 'Disable voice navigation' : 'Enable voice navigation'}
          style={[styles.toggleButton, !isVoiceEnabled && styles.disabledButton]}
          onPress={toggleVoiceEnabled}
        >
          {isVoiceEnabled ? (
            <Volume2 size={20} color="#FFFFFF" />
          ) : (
            <VolumeX size={20} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isListening ? 'Stop listening' : 'Start voice input'}
          style={[
            styles.voiceButton, 
            isListening && styles.listeningButton,
            !isVoiceEnabled && styles.disabledButton
          ]}
          onPress={handleVoiceToggle}
          disabled={!isVoiceEnabled}
        >
          {isListening ? (
            <MicOff size={24} color="#FFFFFF" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {isListening ? 'Stop' : 'Talk'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSpeaking ? 'Stop speaking' : 'Repeat current instruction'}
          style={[
            styles.speakButton, 
            isSpeaking && styles.speakingButton,
            !isVoiceEnabled && styles.disabledButton
          ]}
          onPress={handleSpeak}
          disabled={!isVoiceEnabled}
        >
          {isSpeaking ? (
            <Pause size={24} color="#FFFFFF" />
          ) : (
            <Play size={24} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {isSpeaking ? 'Stop' : 'Repeat'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show voice commands help"
          style={styles.helpButton}
          onPress={showHelp}
        >
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={[styles.buttonText, styles.helpButtonText]}>Help</Text>
        </Pressable>
      </View>

      {/* Recognition Feedback */}
      {recognizedText && (
        <View style={styles.recognitionContainer}>
          <Text style={styles.recognitionText}>{recognizedText}</Text>
        </View>
      )}

      {/* Navigation Status */}
      {isNavigationPaused && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>🔸 Navigation Paused</Text>
          <Text style={styles.statusSubtext}>Say "continue" or "resume" to keep going</Text>
        </View>
      )}

      {/* Voice Commands Help */}
      {showCommands && (
        <View style={styles.commandsContainer}>
          <Text style={styles.commandsTitle}>Say any of these commands:</Text>
          <View style={styles.commandsList}>
            {voiceCommands.slice(0, 8).map((cmd, index) => (
              <View key={index} style={styles.commandItem}>
                <Text style={styles.commandText}>• "{cmd}"</Text>
              </View>
            ))}
          </View>
          <Text style={styles.commandsFooter}>
            Speak clearly and I'll help you navigate! 🎤
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  voiceButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  listeningButton: {
    backgroundColor: Colors.error,
  },
  speakButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  speakingButton: {
    backgroundColor: Colors.secondary,
  },
  helpButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  disabledButton: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  helpButtonText: {
    color: Colors.primary,
  },
  recognitionContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  recognitionText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
  },
  statusContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F0AD4E',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A6D3B',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#8A6D3B',
    marginTop: 2,
  },
  commandsContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commandsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  commandsList: {
    marginBottom: 12,
  },
  commandItem: {
    marginBottom: 6,
  },
  commandText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  commandsFooter: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default VoiceNavigation;
