import { Bot, Volume2, VolumeX, Sparkles } from 'lucide-react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';

import { useTheme } from '@/constants/theme';
import { track } from '@/telemetry';
import { Place } from '@/types/navigation';

type AIJourneyCompanionProps = {
  currentLocation: { latitude: number; longitude: number };
  destination?: Place;
  isNavigating: boolean;
};

type CompanionMessage = {
  id: string;
  text: string;
  type: 'story' | 'quiz' | 'encouragement' | 'safety';
  timestamp: Date;
};

const AIJourneyCompanion: React.FC<AIJourneyCompanionProps> = ({
  currentLocation: _currentLocation,
  destination,
  isNavigating
}) => {
  const theme = useTheme();
  const [currentMessage, setCurrentMessage] = useState<CompanionMessage | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [companionMood, setCompanionMood] = useState<'happy' | 'excited' | 'curious'>('happy');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
  if (isNavigating && destination) {
      generateJourneyContent();
      startCompanionAnimation();
    }
  }, [isNavigating, destination]);

  const startCompanionAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const generateJourneyContent = useCallback(async () => {
    if (!destination) return;

    try {
  const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are Buddy, a friendly AI companion for kids using a navigation app. Create engaging, educational, and safe content for a journey to ${destination.name}. Keep responses short (1-2 sentences), age-appropriate, and encouraging. Focus on interesting facts, safety reminders, or fun observations about the area.`
            },
            {
              role: 'user',
              content: `I'm traveling to ${destination.name} in ${destination.address}. Tell me something interesting about this area or give me a fun fact to make the journey more exciting!`
            }
          ]
        })
      });

      const data = await response.json();
      
      const newMessage: CompanionMessage = {
        id: Date.now().toString(),
        text: data.completion,
        type: 'story',
        timestamp: new Date()
      };

      setCurrentMessage(newMessage);
      setCompanionMood('excited');
  track({ type: 'ai_companion_interaction', action: 'story_generated', destinationId: destination.id, destinationName: destination.name });
    } catch (error) {
      console.log('AI companion error:', error);
      // Fallback to predefined messages
      const fallbackMessage: CompanionMessage = {
        id: Date.now().toString(),
        text: `Great choice going to ${destination.name}! I bet you'll discover something amazing there. Stay safe and enjoy your adventure! 🌟`,
        type: 'encouragement',
        timestamp: new Date()
      };
      setCurrentMessage(fallbackMessage);
    }
  }, [destination, setCurrentMessage, setCompanionMood]);

  const generateQuiz = async () => {
    if (!destination) return;

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Create a simple, fun quiz question for kids about the area they\'re visiting. Make it educational but easy to understand. Include the answer.'
            },
            {
              role: 'user',
              content: `Create a quiz question about ${destination.name} or the ${destination.category} category in general.`
            }
          ]
        })
      });

      const data = await response.json();
      
      const quizMessage: CompanionMessage = {
        id: Date.now().toString(),
        text: `🧠 Quiz Time! ${data.completion}`,
        type: 'quiz',
        timestamp: new Date()
      };

      setCurrentMessage(quizMessage);
      setCompanionMood('curious');
  track({ type: 'ai_companion_interaction', action: 'quiz', destinationId: destination.id, destinationName: destination.name });
    } catch (error) {
      console.log('Quiz generation error:', error);
    }
  };

  const getMoodEmoji = () => {
    switch (companionMood) {
      case 'excited': return '🤩';
      case 'curious': return '🤔';
      default: return '😊';
    }
  };

  if (!isNavigating || !currentMessage) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.text }] }>
      <Pressable 
        style={styles.companionButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Animated.View 
          style={[styles.avatar, { transform: [{ scale: pulseAnim }], backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.avatarEmoji}>{getMoodEmoji()}</Text>
          <Bot size={16} color={theme.colors.primaryForeground} style={styles.botIcon} />
        </Animated.View>
        
        <View style={styles.messagePreview}>
          <Text style={[styles.companionName, { color: theme.colors.primary }]}>Buddy</Text>
          <Text style={[styles.messageText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {currentMessage.text}
          </Text>
        </View>

        <Pressable 
          style={styles.voiceButton}
          onPress={() => setVoiceEnabled(!voiceEnabled)}
        >
          {voiceEnabled ? (
            <Volume2 size={16} color={theme.colors.primary} />
          ) : (
            <VolumeX size={16} color={theme.colors.textSecondary} />
          )}
        </Pressable>
      </Pressable>

      {isExpanded && (
        <View style={[styles.expandedContent, { borderTopColor: theme.colors.border }] }>
          <Text style={[styles.fullMessage, { color: theme.colors.text }]}>{currentMessage.text}</Text>
          
          <View style={styles.actionButtons}>
            <Pressable style={[styles.actionButton, { backgroundColor: theme.colors.surfaceAlt }]} onPress={generateQuiz}>
              <Sparkles size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Quiz Me!</Text>
            </Pressable>
            
            <Pressable style={[styles.actionButton, { backgroundColor: theme.colors.surfaceAlt }]} onPress={() => { generateJourneyContent(); if (destination) track({ type: 'ai_companion_interaction', action: 'more', destinationId: destination.id, destinationName: destination.name }); }}>
              <Bot size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Tell Me More</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
    width: 48,
  },
  avatarEmoji: {
    fontSize: 20,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  botIcon: { opacity: 0.8 },
  companionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  companionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  container: {
    borderRadius: 16,
    elevation: 4,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  expandedContent: {
    borderTopWidth: 1,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  fullMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  messagePreview: { flex: 1 },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  voiceButton: {
    padding: 8,
  },
});

export default AIJourneyCompanion;
