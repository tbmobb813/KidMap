// components/TransportModeSelector.tsx - Multi-modal transport selection for KidMap
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { 
  Footprints, 
  Bike, 
  Bus, 
  Train, 
  MapPin, 
  Clock, 
  Shield,
  Users,
  Battery,
  Sun,
  Moon
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { TravelMode } from '@/utils/api';

export interface TransportMode {
  id: TravelMode | 'combined';
  name: string;
  icon: React.ReactNode;
  description: string;
  kidFriendly: number; // 1-5 rating
  safety: number; // 1-5 rating
  speed: number; // 1-5 rating
  cost: number; // 1-5 rating (lower is cheaper)
  independence: number; // 1-5 rating (how much supervision needed)
  weatherDependent: boolean;
  ageRecommendation: string;
  pros: string[];
  cons: string[];
  color: string;
}

const transportModes: TransportMode[] = [
  {
    id: 'walking',
    name: 'Walking',
    icon: <Footprints size={24} color="#FFFFFF" />,
    description: 'Walk the whole way - great exercise!',
    kidFriendly: 5,
    safety: 4,
    speed: 2,
    cost: 5, // Free
    independence: 4,
    weatherDependent: true,
    ageRecommendation: '5+ years',
    pros: ['Great exercise', 'No cost', 'Explore neighborhood', 'Build confidence'],
    cons: ['Takes longer', 'Weather dependent', 'Can be tiring'],
    color: '#4CAF50'
  },
  {
    id: 'bicycling',
    name: 'Biking',
    icon: <Bike size={24} color="#FFFFFF" />,
    description: 'Bike there - fun and fast!',
    kidFriendly: 4,
    safety: 3,
    speed: 4,
    cost: 4, // Bike maintenance
    independence: 3,
    weatherDependent: true,
    ageRecommendation: '8+ years',
    pros: ['Fun and fast', 'Good exercise', 'Environmentally friendly', 'Builds skills'],
    cons: ['Need bike', 'Weather dependent', 'Requires supervision', 'Traffic awareness needed'],
    color: '#FF9800'
  },
  {
    id: 'transit',
    name: 'Public Transit',
    icon: <Bus size={24} color="#FFFFFF" />,
    description: 'Take the bus or train - meet new people!',
    kidFriendly: 3,
    safety: 3,
    speed: 4,
    cost: 2, // Transit fare
    independence: 2,
    weatherDependent: false,
    ageRecommendation: '10+ years',
    pros: ['Weather protected', 'Faster for long distances', 'Social experience', 'Learn city navigation'],
    cons: ['Costs money', 'Need supervision', 'Fixed schedules', 'Crowds'],
    color: '#2196F3'
  },
  {
    id: 'combined',
    name: 'Mixed Journey',
    icon: <MapPin size={24} color="#FFFFFF" />,
    description: 'Combine walking, biking, and transit for the best route!',
    kidFriendly: 3,
    safety: 3,
    speed: 4,
    cost: 3,
    independence: 2,
    weatherDependent: false,
    ageRecommendation: '12+ years',
    pros: ['Most efficient', 'Flexible options', 'Learn different transport', 'Optimized for conditions'],
    cons: ['More complex', 'Need planning', 'Multiple considerations', 'Requires experience'],
    color: '#9C27B0'
  }
];

interface TransportModeSelectorProps {
  selectedMode: TravelMode | 'combined';
  onModeSelect: (mode: TravelMode | 'combined') => void;
  fromLocation: string;
  toLocation: string;
  estimatedTimes?: {
    walking?: number;
    bicycling?: number;
    transit?: number;
    combined?: number;
  };
  weatherInfo?: {
    condition: 'sunny' | 'rainy' | 'cloudy';
    temperature: number;
  };
  childAge?: number;
  style?: any;
}

export default function TransportModeSelector({
  selectedMode,
  onModeSelect,
  fromLocation,
  toLocation,
  estimatedTimes,
  weatherInfo,
  childAge = 10,
  style
}: TransportModeSelectorProps) {
  const [expandedMode, setExpandedMode] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getRecommendationScore = (mode: TransportMode): number => {
    let score = 0;
    
    // Age appropriateness
    const minAge = parseInt(mode.ageRecommendation);
    if (childAge >= minAge) score += 2;
    else if (childAge >= minAge - 2) score += 1;
    
    // Weather consideration
    if (weatherInfo) {
      if (mode.weatherDependent && weatherInfo.condition === 'rainy') {
        score -= 2;
      } else if (!mode.weatherDependent || weatherInfo.condition === 'sunny') {
        score += 1;
      }
    }
    
    // General kid-friendliness and safety
    score += mode.kidFriendly + mode.safety;
    
    return Math.max(0, score);
  };

  const getRecommendedModes = () => {
    return transportModes
      .map(mode => ({ ...mode, score: getRecommendationScore(mode) }))
      .sort((a, b) => b.score - a.score);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '...';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderModeCard = (mode: TransportMode & { score?: number }) => {
    const isSelected = selectedMode === mode.id;
    const isExpanded = expandedMode === mode.id;
    const estimatedTime = estimatedTimes?.[mode.id as keyof typeof estimatedTimes];
    const isRecommended = mode.score && mode.score >= 6;

    return (
      <TouchableOpacity
        key={mode.id}
        style={[
          styles.modeCard,
          isSelected && styles.selectedCard,
          isRecommended && styles.recommendedCard,
        ]}
        onPress={() => {
          onModeSelect(mode.id);
          setExpandedMode(isExpanded ? null : mode.id);
        }}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.modeHeader}>
          <View style={[styles.modeIcon, { backgroundColor: mode.color }]}>
            {mode.icon}
          </View>
          
          <View style={styles.modeInfo}>
            <View style={styles.modeTitleRow}>
              <Text style={[styles.modeName, isSelected && styles.selectedText]}>
                {mode.name}
              </Text>
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>👍 Best</Text>
                </View>
              )}
            </View>
            <Text style={styles.modeDescription}>{mode.description}</Text>
            
            <View style={styles.modeStats}>
              <View style={styles.statItem}>
                <Clock size={14} color={Colors.textLight} />
                <Text style={styles.statText}>{formatTime(estimatedTime)}</Text>
              </View>
              <View style={styles.statItem}>
                <Shield size={14} color={Colors.textLight} />
                <Text style={styles.statText}>Safety: {mode.safety}/5</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={14} color={Colors.textLight} />
                <Text style={styles.statText}>Age: {mode.ageRecommendation}</Text>
              </View>
            </View>
          </View>

          {weatherInfo && mode.weatherDependent && (
            <View style={styles.weatherIndicator}>
              {weatherInfo.condition === 'sunny' ? (
                <Sun size={16} color="#FFA726" />
              ) : (
                <Text style={styles.weatherWarning}>☔</Text>
              )}
            </View>
          )}
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <Animated.View style={styles.expandedContent}>
            <View style={styles.prosConsContainer}>
              <View style={styles.prosConsColumn}>
                <Text style={styles.prosConsTitle}>👍 Pros:</Text>
                {mode.pros.map((pro, index) => (
                  <Text key={index} style={styles.prosConsItem}>• {pro}</Text>
                ))}
              </View>
              <View style={styles.prosConsColumn}>
                <Text style={styles.prosConsTitle}>👎 Consider:</Text>
                {mode.cons.map((con, index) => (
                  <Text key={index} style={styles.prosConsItem}>• {con}</Text>
                ))}
              </View>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingTitle}>Ratings:</Text>
              <View style={styles.ratingGrid}>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Kid-Friendly</Text>
                  <View style={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <Text key={i} style={[styles.star, i < mode.kidFriendly && styles.activeStar]}>★</Text>
                    ))}
                  </View>
                </View>
                <View style={styles.ratingItem}>
                  <Text style={styles.ratingLabel}>Speed</Text>
                  <View style={styles.ratingStars}>
                    {[...Array(5)].map((_, i) => (
                      <Text key={i} style={[styles.star, i < mode.speed && styles.activeStar]}>★</Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  const recommendedModes = getRecommendedModes();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Journey</Text>
        <Text style={styles.subtitle}>From {fromLocation} to {toLocation}</Text>
        
        {weatherInfo && (
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherText}>
              {weatherInfo.condition === 'sunny' ? '☀️' : '🌧️'} 
              {weatherInfo.temperature}°C - {weatherInfo.condition}
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.modesContainer}
        showsVerticalScrollIndicator={false}
      >
        {recommendedModes.map(renderModeCard)}
      </ScrollView>

      {selectedMode && (
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            Ready to go by {transportModes.find(m => m.id === selectedMode)?.name.toLowerCase()}!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  weatherInfo: {
    backgroundColor: Colors.card,
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  weatherText: {
    fontSize: 12,
    color: Colors.text,
  },
  modesContainer: {
    flex: 1,
    padding: 16,
  },
  modeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight || Colors.card,
  },
  recommendedCard: {
    borderColor: Colors.success,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  selectedText: {
    color: Colors.primary,
  },
  recommendedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
  },
  modeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: Colors.textLight,
  },
  weatherIndicator: {
    marginLeft: 8,
  },
  weatherWarning: {
    fontSize: 16,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  prosConsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  prosConsColumn: {
    flex: 1,
  },
  prosConsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  prosConsItem: {
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 2,
  },
  ratingContainer: {
    marginTop: 8,
  },
  ratingTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  ratingGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingItem: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
    color: Colors.border,
    marginRight: 2,
  },
  activeStar: {
    color: '#FFD700',
  },
  selectionSummary: {
    padding: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
