import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
import Colors from "@/constants/colors";
import { Mic, MicOff, Volume2 } from "lucide-react-native";

type VoiceNavigationProps = {
  currentStep?: string;
  onVoiceCommand?: (command: string) => void;
};

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ 
  currentStep = "Walk to Main Street Station",
  onVoiceCommand 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // refs to clear timers on unmount
  const listeningTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speakingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // list of available voice commands
  const voiceCommands = [
    "Where am I?",
    "Repeat directions",
    "Call for help",
    "How much time left?"
  ];

  useEffect(() => {
    return () => {
      // cleanup any pending timers
      if (listeningTimeout.current) clearTimeout(listeningTimeout.current);
      if (speakingTimeout.current) clearTimeout(speakingTimeout.current);
    };
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      Alert.alert("Voice stopped", "No longer listening for commands");
    } else {
      setIsListening(true);
      Alert.alert("Voice activated", "Say 'help' for available commands");
      
      listeningTimeout.current = setTimeout(() => {
        setIsListening(false);
      }, 5000);
    }
  };

  const handleSpeak = () => {
    setIsSpeaking(true);
    Alert.alert("Speaking", `"${currentStep}"`);
    
    speakingTimeout.current = setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* step display */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepText}>{currentStep}</Text>
      </View>

      {/* controls */}
      <View style={styles.controlsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isListening ? "Stop voice input" : "Start voice input"}
          style={[
            styles.voiceButton,
            isListening && styles.listeningButton
          ]}
          onPress={handleVoiceToggle}
        >
          {isListening ? (
            <MicOff size={24} color="#FFFFFF" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {isListening ? "Stop" : "Voice"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Repeat instructions aloud"
          style={[
            styles.speakButton,
            isSpeaking && styles.speakingButton
          ]}
          onPress={handleSpeak}
        >
          <Volume2 size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            {isSpeaking ? "Speaking..." : "Repeat"}
          </Text>
        </Pressable>
      </View>

      {/* command list */}
      {isListening && (
        <View style={styles.commandsContainer}>
          <Text style={styles.commandsTitle}>Voice Commands:</Text>
          {voiceCommands.map(cmd => (
            <Text key={cmd} style={styles.commandText}>• {cmd}</Text>
          ))}
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
    margin: 16,
  },
  stepContainer: {
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  stepText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 16,
  },
  voiceButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  listeningButton: {
    backgroundColor: Colors.error,
  },
  speakButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  speakingButton: {
    backgroundColor: Colors.warning,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  commandsContainer: {
    marginTop: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
  },
  commandsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  commandText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
});

export default VoiceNavigation;
