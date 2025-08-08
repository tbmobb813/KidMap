import React, { useState } from "react";
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

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      Alert.alert("Voice stopped", "No longer listening for commands");
    } else {
      setIsListening(true);
      Alert.alert("Voice activated", "Say 'help' for available commands");
      
      // Simulate stopping after 5 seconds
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
    }
  };

  const handleSpeak = () => {
    setIsSpeaking(true);
    Alert.alert("Speaking", `"${currentStep}"`);
    
    // Simulate speaking duration
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepContainer}>
        <Text style={styles.stepText}>{currentStep}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <Pressable
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

      {isListening && (
        <View style={styles.commandsContainer}>
          <Text style={styles.commandsTitle}>Voice Commands:</Text>
          <Text style={styles.commandText}>• "Where am I?"</Text>
          <Text style={styles.commandText}>• "Repeat directions"</Text>
          <Text style={styles.commandText}>• "Call for help"</Text>
          <Text style={styles.commandText}>• "How much time left?"</Text>
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
