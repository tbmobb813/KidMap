import { ArrowLeft, ArrowRight, Mic, MicOff, Volume2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Toast from './Toast';

import { VOICE_NAV_A11Y } from '@/constants/a11yLabels';
import { useTheme } from "@/constants/theme";
import { useToast } from '@/hooks/useToast';
import { useNavigationStore } from '@/stores/navigationStore';
import { TransitStep } from '@/types/navigation';
import { announce } from '@/utils/accessibility/accessibility';

type VoiceNavigationProps = {
  /** Legacy single step string (fallback if steps not provided) */
  currentStep?: string;
  /** Full list of transit steps to enable step-by-step voice navigation */
  steps?: TransitStep[];
  /** Initial index into steps (default 0) */
  initialIndex?: number;
  onVoiceCommand?: (command: string) => void;
};

const VoiceNavigation: React.FC<VoiceNavigationProps> = ({ 
  currentStep = "Walk to Main Street Station",
  steps,
  initialIndex = 0,
  onVoiceCommand: _onVoiceCommand 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stepIndex, setStepIndex] = useState(initialIndex);
  const { toast, showToast, hideToast } = useToast();
  const { accessibilitySettings } = useNavigationStore();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Format an instruction for a given step
  const formatStepInstruction = (step: TransitStep): string => {
    const verb = step.type === 'walk' ? 'Walk' : step.type === 'bike' ? 'Bike' : step.type === 'car' ? 'Drive' : step.type === 'train' || step.type === 'subway' ? 'Take' : step.type === 'bus' ? 'Take' : 'Go';
    const from = step.from || 'start';
    const to = step.to || 'destination';
    return `${verb} from ${from} to ${to}`;
  };

  const activeInstruction = useMemo(() => {
    if (steps && steps.length > 0 && steps[stepIndex]) {
      return formatStepInstruction(steps[stepIndex]);
    }
    return currentStep;
  }, [steps, stepIndex, currentStep]);

  // Announce automatically when step changes if voiceDescriptions enabled
  useEffect(() => {
    // Guard in case accessibilitySettings is undefined in some test setups
    const voiceEnabled = accessibilitySettings?.voiceDescriptions;
    if (voiceEnabled && steps && steps.length > 0) {
      announce(activeInstruction, { politeness: 'polite' });
    }
  }, [activeInstruction, accessibilitySettings?.voiceDescriptions, steps]);

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      showToast('No longer listening for commands', 'info');
    } else {
      setIsListening(true);
      showToast("Voice activated — say 'help' for commands", 'success');
      
      // Simulate stopping after 5 seconds
      setTimeout(() => {
        setIsListening(false);
      }, 5000);
    }
  };

  const handleSpeak = () => {
    setIsSpeaking(true);
    const phrase = `"${activeInstruction}"`;
    showToast(phrase, 'info');
    // Always (re)announce repeat regardless of dedupe
    if (accessibilitySettings.voiceDescriptions) {
      announce(activeInstruction, { politeness: 'assertive', dedupe: false });
    }
    setTimeout(() => { setIsSpeaking(false); }, 2000);
  };

  const handlePrev = () => {
    if (!steps) return;
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (!steps) return;
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepContainer}>
        <Text style={styles.stepText} testID="voice-active-instruction">{activeInstruction}</Text>
        {steps && steps.length > 0 && (
          <Text style={styles.stepMeta} accessibilityLabel={VOICE_NAV_A11Y.stepMeta(stepIndex + 1, steps.length)}>{`Step ${stepIndex + 1}/${steps.length}`}</Text>
        )}
      </View>

      <View style={styles.controlsContainer}>
        {steps && steps.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={VOICE_NAV_A11Y.controlsPrevious(stepIndex === 0)}
            accessibilityState={{ disabled: stepIndex === 0 }}
            hitSlop={8}
            style={[styles.navButton, stepIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrev}
            disabled={stepIndex === 0}
            testID="voice-prev"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Prev</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isListening ? VOICE_NAV_A11Y.stopListening : VOICE_NAV_A11Y.activateCommands}
          accessibilityState={{ selected: isListening }}
          hitSlop={8}
          style={[
            styles.voiceButton,
            isListening && styles.listeningButton
          ]}
          onPress={handleVoiceToggle}
          testID="voice-toggle"
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
          accessibilityLabel={isSpeaking ? VOICE_NAV_A11Y.repeating : VOICE_NAV_A11Y.repeatCurrent}
          accessibilityState={{ busy: isSpeaking }}
          hitSlop={8}
          style={[
            styles.speakButton,
            isSpeaking && styles.speakingButton
          ]}
          onPress={handleSpeak}
          testID="voice-repeat"
        >
          <Volume2 size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            {isSpeaking ? "Speaking..." : "Repeat"}
          </Text>
        </Pressable>

        {steps && steps.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={VOICE_NAV_A11Y.controlsNext(stepIndex === steps.length - 1)}
            accessibilityState={{ disabled: stepIndex === steps.length - 1 }}
            hitSlop={8}
            style={[styles.navButton, stepIndex === steps.length - 1 && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={stepIndex === steps.length - 1}
            testID="voice-next"
          >
            <ArrowRight size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        )}
      </View>

      {isListening && (
        <View style={styles.commandsContainer}>
          <Text style={styles.commandsTitle}>Voice Commands:</Text>
          <Text style={styles.commandText}>• &quot;Where am I?&quot;</Text>
          <Text style={styles.commandText}>• &quot;Repeat directions&quot;</Text>
          <Text style={styles.commandText}>• &quot;Call for help&quot;</Text>
          <Text style={styles.commandText}>• &quot;How much time left?&quot;</Text>
          <Toast 
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onHide={hideToast}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  commandText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  commandsContainer: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  commandsTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  controlsContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-around",
  },
  listeningButton: {
    backgroundColor: theme.colors.error,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  navButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  speakButton: {
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    flex: 1,
    gap: 4,
    padding: 12,
  },
  speakingButton: {
    backgroundColor: theme.colors.warning,
  },
  stepContainer: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  stepMeta: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center'
  },
  stepText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  voiceButton: {
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    flex: 1,
    gap: 4,
    padding: 12,
  },
});

export default VoiceNavigation;
