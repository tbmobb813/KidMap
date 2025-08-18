
import { Cloud, Sun, CloudRain, Users, Clock, Zap, MapPin } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';

import { useTheme } from '@/constants/theme';
import { Place } from '@/types/navigation';

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy';
type CrowdLevel = 'low' | 'medium' | 'high';
type RouteType = 'fastest' | 'safest' | 'scenic' | 'covered' | 'quiet';

type SmartSuggestion = {
  id: string;
  type: RouteType;
  title: string;
  description: string;
  estimatedTime: string;
  reason: string;
  icon: React.ComponentType<any>;
  priority: number;
};

type SmartRouteSuggestionsProps = {
  destination: Place;
  _currentLocation: { latitude: number; longitude: number };
  weather?: WeatherCondition;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  onSelectRoute: (suggestion: SmartSuggestion) => void;
};

function generateSmartSuggestions(
  destination: Place,
  weather: WeatherCondition,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
  crowdLevel: CrowdLevel
): SmartSuggestion[] {
  const baseSuggestions: SmartSuggestion[] = [];

  // Weather-based suggestions
  if (weather === 'rainy' || weather === 'stormy') {
    baseSuggestions.push({
      id: 'covered-route',
      type: 'covered',
      title: 'Covered Route',
      description: 'Stay dry with covered walkways and indoor passages',
      estimatedTime: '12 min',
      reason: 'Rainy weather detected',
      icon: CloudRain,
      priority: 1
    });
  }

  // Time-based suggestions
  if (timeOfDay === 'morning') {
    baseSuggestions.push({
      id: 'scenic-route',
      type: 'scenic',
      title: 'Scenic Morning Route',
      description: 'Beautiful morning views through the park',
      estimatedTime: '15 min',
      reason: 'Perfect morning weather',
      icon: Sun,
      priority: 2
    });
  }

  if (timeOfDay === 'evening' || timeOfDay === 'night') {
    baseSuggestions.push({
      id: 'safest-route',
      type: 'safest',
      title: 'Well-Lit Safe Route',
      description: 'Well-lit streets with good visibility',
      estimatedTime: '10 min',
      reason: 'Evening safety priority',
      icon: Zap,
      priority: 1
    });
  }

  // Crowd-based suggestions
  if (crowdLevel === 'high') {
    baseSuggestions.push({
      id: 'quiet-route',
      type: 'quiet',
      title: 'Quiet Alternative',
      description: 'Less crowded side streets',
      estimatedTime: '11 min',
      reason: 'Avoiding busy areas',
      icon: MapPin,
      priority: 2
    });
  }

  // Always include fastest route
  baseSuggestions.push({
    id: 'fastest-route',
    type: 'fastest',
    title: 'Fastest Route',
    description: 'Direct path to your destination',
    estimatedTime: '8 min',
    reason: 'Shortest travel time',
    icon: Clock,
    priority: 3
  });

  // Sort by priority and take top 3
  return baseSuggestions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
}

const SmartRouteSuggestions: React.FC<SmartRouteSuggestionsProps> = ({
  destination,
  _currentLocation,
  weather = 'sunny',
  timeOfDay,
  onSelectRoute
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>('medium');

  useEffect(() => {
    setSuggestions(generateSmartSuggestions(destination, weather, timeOfDay, crowdLevel));
  }, [destination, weather, timeOfDay, crowdLevel]);

  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny': return Sun;
      case 'cloudy': return Cloud;
      case 'rainy': return CloudRain;
      default: return Sun;
    }
  };

  const getCrowdColor = () => {
    switch (crowdLevel) {
  case 'low': return '#4CAF50';
  case 'medium': return '#FF9800';
  case 'high': return '#F44336';
    }
  };

  const simulateCrowdLevel = () => {
    // Simulate crowd level based on time of day
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19) {
      setCrowdLevel('high'); // Rush hours
    } else if (hour >= 10 && hour <= 16) {
      setCrowdLevel('medium'); // Daytime
    } else {
      setCrowdLevel('low'); // Early morning/night
    }
  };

  useEffect(() => {
    simulateCrowdLevel();
    const interval = setInterval(simulateCrowdLevel, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const theme = useTheme();
  const styles = React.useMemo(() => StyleSheet.create({
    conditionItem: { alignItems: 'center', flexDirection: 'row', gap: 4 },
    conditionText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
    conditions: { flexDirection: 'row', gap: 16 },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      elevation: 4,
      margin: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    estimatedTime: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
    header: { marginBottom: 16 },
    iconContainer: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 16, height: 32, justifyContent: 'center', marginRight: 8, width: 32 },
    reason: { color: theme.colors.textSecondary, fontSize: 10, fontStyle: 'italic' },
    smartTip: { alignItems: 'center', backgroundColor: theme.colors.secondary, borderRadius: 8, flexDirection: 'row', gap: 8, padding: 12 },
    smartTipText: { color: theme.colors.secondaryForeground || '#06260F', flex: 1, fontSize: 12, fontWeight: '500' },
    suggestionCard: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderRadius: 12, borderWidth: 1, marginRight: 12, padding: 16, width: 200 },
    suggestionDescription: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 16, marginBottom: 12 },
    suggestionFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    suggestionHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: 8 },
    suggestionTitle: { color: theme.colors.text, flex: 1, fontSize: 14, fontWeight: '600' },
    suggestionsScroll: { marginBottom: 16 },
    title: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
    iconBg: { backgroundColor: theme.colors.primary },
  }), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Route Suggestions</Text>
        <View style={styles.conditions}>
          <View style={styles.conditionItem}>
            {React.createElement(getWeatherIcon(), { size: 16, color: theme.colors.primary })}
            <Text style={styles.conditionText}>{weather}</Text>
          </View>
          <View style={styles.conditionItem}>
            <Users size={16} color={getCrowdColor()} />
            <Text style={[styles.conditionText, { color: getCrowdColor() }]}>
              {crowdLevel} traffic
            </Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            style={styles.suggestionCard}
            onPress={() => onSelectRoute(suggestion)}
          >
            <View style={styles.suggestionHeader}>
              <View style={styles.iconContainer}>
                <suggestion.icon size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            </View>
            
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            
            <View style={styles.suggestionFooter}>
              <Text style={styles.estimatedTime}>{suggestion.estimatedTime}</Text>
              <Text style={styles.reason}>{suggestion.reason}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.smartTip}>
  <Zap size={16} color={theme.colors.secondary} />
        <Text style={styles.smartTipText}>
          Routes adapt based on weather, time, and crowd levels for the best experience!
        </Text>
      </View>
    </View>
  );
};

// Removed legacy StyleSheet in favor of theme-driven memoized styles

export default SmartRouteSuggestions;
