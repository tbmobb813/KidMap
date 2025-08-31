import { Heart, MapPin, Star, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/theme';
import { useGamificationStore } from '@/stores/gamificationStore';
import { tint } from '@/utils/color/color';

type PetType = 'dragon' | 'unicorn' | 'robot' | 'phoenix';

type VirtualPet = {
  id: string;
  name: string;
  type: PetType;
  level: number;
  happiness: number;
  energy: number;
  experience: number;
  lastFed: Date;
  evolutionStage: number;
};

type VirtualPetCompanionProps = {
  visible: boolean;
  onClose: () => void;
};

const VirtualPetCompanion: React.FC<VirtualPetCompanionProps> = ({ visible, onClose }) => {
  const { userStats, addPoints } = useGamificationStore();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [pet, setPet] = useState<VirtualPet>({
    id: 'buddy-pet',
    name: 'Explorer',
    type: 'dragon',
    level: Math.floor(userStats.totalPoints / 100) + 1,
    happiness: 85,
    energy: 90,
    experience: userStats.totalPoints % 100,
    lastFed: new Date(),
    evolutionStage: Math.floor(userStats.totalPoints / 500)
  });
  
  const [bounceAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  const startAnimations = React.useCallback(() => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim, glowAnim]);

  useEffect(() => {
    if (visible) {
      startAnimations();
    }
  }, [visible, startAnimations]);

  useEffect(() => {
    // Update pet based on user progress
    setPet(prev => ({
      ...prev,
      level: Math.floor(userStats.totalPoints / 100) + 1,
      experience: userStats.totalPoints % 100,
      evolutionStage: Math.floor(userStats.totalPoints / 500)
    }));
  }, [userStats.totalPoints]);

  const getPetEmoji = (): string => {
    const stage = pet.evolutionStage;
    switch (pet.type) {
      case 'dragon':
        if (stage >= 3) return '🐲'; // Ancient Dragon
        if (stage >= 2) return '🐉'; // Mature Dragon  
        if (stage >= 1) return '🦎'; // Young Dragon
        return '🥚'; // Dragon Egg
      case 'unicorn':
        if (stage >= 3) return '🦄'; // Majestic Unicorn
        if (stage >= 2) return '🐴'; // Magic Horse
        if (stage >= 1) return '🐎'; // Young Unicorn
        return '🥚'; // Unicorn Egg
      case 'robot':
        if (stage >= 3) return '🤖'; // Advanced Robot
        if (stage >= 2) return '⚙️'; // Mechanical Pet
        if (stage >= 1) return '🔧'; // Robot Parts
        return '🥚'; // Robot Egg
      case 'phoenix':
        if (stage >= 3) return '🔥'; // Phoenix Fire
        if (stage >= 2) return '🦅'; // Fire Bird
        if (stage >= 1) return '🐣'; // Phoenix Chick
        return '🥚'; // Phoenix Egg
      default:
        return '🐾';
    }
  };

  const getPetStage = (): string => {
    const stage = pet.evolutionStage;
    if (stage >= 3) return 'Legendary';
    if (stage >= 2) return 'Evolved';
    if (stage >= 1) return 'Growing';
    return 'Baby';
  };

  const feedPet = () => {
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 10),
      energy: Math.min(100, prev.energy + 15),
      lastFed: new Date()
    }));
    addPoints(5);
  };

  const playWithPet = () => {
    setPet(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      energy: Math.max(0, prev.energy - 10)
    }));
    addPoints(10);
  };

  const getHappinessColor = () => {
    if (pet.happiness >= 80) return theme.colors.success;
    if (pet.happiness >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const getEnergyColor = () => {
    if (pet.energy >= 70) return theme.colors.info;
    if (pet.energy >= 40) return theme.colors.warning;
    return theme.colors.error;
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Pet Companion</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.petContainer}>
          <Animated.View 
            style={[
              styles.petAvatar,
              { 
                transform: [{ scale: bounceAnim }],
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }
            ]}
          >
            <Text style={styles.petEmoji}>{getPetEmoji()}</Text>
          </Animated.View>
          
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petStage}>{getPetStage()} {pet.type}</Text>
            <Text style={styles.petLevel}>Level {pet.level}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBar}>
            <View style={styles.statHeader}>
              <Heart size={16} color={getHappinessColor()} />
              <Text style={styles.statLabel}>Happiness</Text>
              <Text style={styles.statValue}>{pet.happiness}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${pet.happiness}%`,
                    backgroundColor: getHappinessColor()
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.statBar}>
            <View style={styles.statHeader}>
              <Zap size={16} color={getEnergyColor()} />
              <Text style={styles.statLabel}>Energy</Text>
              <Text style={styles.statValue}>{pet.energy}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${pet.energy}%`,
                    backgroundColor: getEnergyColor()
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.statBar}>
            <View style={styles.statHeader}>
              <Star size={16} color={theme.colors.secondary} />
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statValue}>{pet.experience}/100</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${pet.experience}%`,
                    backgroundColor: theme.colors.secondary
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={feedPet}>
            <Text style={styles.actionEmoji}>🍎</Text>
            <Text style={styles.actionText}>Feed</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={playWithPet}>
            <Text style={styles.actionEmoji}>🎾</Text>
            <Text style={styles.actionText}>Play</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <MapPin size={16} color={theme.colors.primary} />
            <Text style={styles.actionText}>Adventure</Text>
          </Pressable>
        </View>

        <View style={styles.evolutionHint}>
          <Text style={styles.hintText}>
            {pet.evolutionStage < 3 
              ? `${500 - (userStats.totalPoints % 500)} more points to evolve!`
              : 'Your pet has reached maximum evolution! 🌟'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.border,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 8,
    margin: 20,
    maxWidth: 400,
    padding: 24,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    width: '90%',
  },
  evolutionHint: {
    alignItems: 'center',
    backgroundColor: tint(theme.colors.secondary),
    borderRadius: 8,
    padding: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  hintText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  petAvatar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    elevation: 4,
    height: 80,
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 80,
  },
  petContainer: {
    alignItems: 'center',
    backgroundColor: tint(theme.colors.primary),
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 16,
  },
  petEmoji: {
    fontSize: 40,
  },
  petInfo: {
    flex: 1,
  },
  petLevel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  petName: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  petStage: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressBar: {
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    height: '100%',
  },
  statBar: {
    marginBottom: 16,
  },
  statHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  statLabel: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statValue: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 24,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
});

export default VirtualPetCompanion;
