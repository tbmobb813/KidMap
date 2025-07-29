// components/RouteIntegration.tsx - Integration component for multi-modal routing
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { 
  Navigation,
  Route as RouteIcon,
  MapPin,
  Settings,
  Clock,
  Star
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { AccessibleButton } from './AccessibleButton';
import { MultiModalRoutePlanning } from './MultiModalRoutePlanning';
import { TransportModeSelector } from './TransportModeSelector';
import { RouteOption } from '../utils/routePlanner';
import { TravelMode } from '../utils/api';

interface RouteIntegrationProps {
  /**
   * Origin coordinates [lat, lng]
   */
  from: [number, number];
  
  /**
   * Destination coordinates [lat, lng]
   */
  to: [number, number];
  
  /**
   * Origin address string
   */
  fromAddress: string;
  
  /**
   * Destination address string
   */
  toAddress: string;
  
  /**
   * Child's age for age-appropriate recommendations
   */
  childAge?: number;
  
  /**
   * Whether adult supervision is available
   */
  parentSupervision?: boolean;
  
  /**
   * Callback when a route is selected
   */
  onRouteSelected: (route: RouteOption) => void;
  
  /**
   * Callback when route planning is cancelled
   */
  onCancel?: () => void;
  
  /**
   * Initial display mode
   */
  initialMode?: 'summary' | 'planning' | 'modeSelector';
}

export const RouteIntegration: React.FC<RouteIntegrationProps> = ({
  from,
  to,
  fromAddress,
  toAddress,
  childAge = 10,
  parentSupervision = true,
  onRouteSelected,
  onCancel,
  initialMode = 'summary'
}) => {
  const [currentMode, setCurrentMode] = useState<'summary' | 'planning' | 'modeSelector'>(initialMode);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [quickModes, setQuickModes] = useState<TravelMode[]>(['walking', 'transit']);

  /**
   * Handle quick route request
   */
  const handleQuickRoute = useCallback(async (mode: TravelMode) => {
    try {
      // This would use the route planner to get a quick route of the specified mode
      const { RoutePlanner } = await import('../utils/routePlanner');
      
      const routes = await RoutePlanner.getRouteOptions(from, to, {
        preferredModes: [mode],
        childAge,
        parentSupervision,
      });

      if (routes.length > 0) {
        const bestRoute = routes[0];
        setSelectedRoute(bestRoute);
        onRouteSelected(bestRoute);
      } else {
        Alert.alert(
          'No Route Found',
          `Couldn't find a ${mode} route. Try multi-modal planning for more options.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Plan Route', onPress: () => setCurrentMode('planning') }
          ]
        );
      }
    } catch (error) {
      console.error('Error getting quick route:', error);
      Alert.alert('Route Error', 'Failed to find route. Please try again.');
    }
  }, [from, to, childAge, parentSupervision, onRouteSelected]);

  /**
   * Handle route selection from multi-modal planner
   */
  const handleRoutePlanningSelection = useCallback((route: RouteOption) => {
    setSelectedRoute(route);
    setCurrentMode('summary');
    onRouteSelected(route);
  }, [onRouteSelected]);

  /**
   * Handle transport mode selection
   */
  const handleModeSelection = useCallback((modes: TravelMode[]) => {
    setQuickModes(modes);
    setCurrentMode('summary');
  }, []);

  /**
   * Render route summary with quick actions
   */
  const renderRouteSummary = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Navigation size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Plan Your Journey</Text>
          <View style={styles.routeInfo}>
            <MapPin size={14} color={Colors.text.secondary} />
            <Text style={styles.routeText} numberOfLines={1}>
              {fromAddress}
            </Text>
          </View>
          <View style={styles.routeInfo}>
            <MapPin size={14} color={Colors.text.secondary} />
            <Text style={styles.routeText} numberOfLines={1}>
              {toAddress}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setCurrentMode('modeSelector')}
          style={styles.settingsButton}
          accessibilityLabel="Transportation settings"
        >
          <Settings size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {selectedRoute && (
        <View style={styles.selectedRouteCard}>
          <View style={styles.selectedRouteHeader}>
            <Text style={styles.selectedRouteTitle}>Current Route</Text>
            <View style={styles.selectedRouteMetrics}>
              <Clock size={16} color={Colors.success} />
              <Text style={styles.selectedRouteTime}>{selectedRoute.duration} min</Text>
              <View style={styles.routeRating}>
                <Star size={12} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.routeRatingText}>{selectedRoute.kidFriendliness}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.selectedRouteMode}>
            {formatTravelMode(selectedRoute.mode)} Route
          </Text>
          {selectedRoute.recommendation && selectedRoute.recommendation.reasons.length > 0 && (
            <Text style={styles.selectedRouteReason}>
              {selectedRoute.recommendation.reasons[0]}
            </Text>
          )}
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Routes</Text>
        <View style={styles.quickButtons}>
          {quickModes.map(mode => (
            <AccessibleButton
              key={mode}
              title={formatTravelMode(mode)}
              onPress={() => handleQuickRoute(mode)}
              style={[styles.quickButton, { backgroundColor: getModeColor(mode) }]}
              textStyle={styles.quickButtonText}
              leftIcon={getModeIcon(mode)}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <AccessibleButton
          title="Plan Multi-Modal Route"
          onPress={() => setCurrentMode('planning')}
          style={styles.planButton}
          textStyle={styles.planButtonText}
          leftIcon={<RouteIcon size={16} color={Colors.primary} />}
        />
        
        {onCancel && (
          <AccessibleButton
            title="Cancel"
            onPress={onCancel}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
        )}
      </View>
    </View>
  );

  /**
   * Render based on current mode
   */
  switch (currentMode) {
    case 'planning':
      return (
        <MultiModalRoutePlanning
          from={from}
          to={to}
          fromAddress={fromAddress}
          toAddress={toAddress}
          childAge={childAge}
          parentSupervision={parentSupervision}
          onRouteSelected={handleRoutePlanningSelection}
          onClose={() => setCurrentMode('summary')}
        />
      );

    case 'modeSelector':
      return (
        <TransportModeSelector
          onSelectionChange={handleModeSelection}
          childAge={childAge}
          weatherCondition="sunny" // Would be fetched from weather service
          onClose={() => setCurrentMode('summary')}
          initialSelection={quickModes}
        />
      );

    default:
      return renderRouteSummary();
  }
};

// Helper functions
const formatTravelMode = (mode: TravelMode): string => {
  const modes = {
    walking: 'Walk',
    bicycling: 'Bike',
    transit: 'Transit',
    driving: 'Drive'
  };
  return modes[mode] || mode;
};

const getModeColor = (mode: TravelMode): string => {
  const colors = {
    walking: Colors.success,
    bicycling: Colors.primary,
    transit: Colors.warning,
    driving: Colors.error
  };
  return colors[mode] || Colors.gray;
};

const getModeIcon = (mode: TravelMode) => {
  // In a real implementation, these would be proper icons
  return <Navigation size={16} color={Colors.white} />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  selectedRouteCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  selectedRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedRouteTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  selectedRouteMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedRouteTime: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  routeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeRatingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 2,
  },
  selectedRouteMode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  selectedRouteReason: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonText: {
    color: Colors.white,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  actions: {
    gap: 8,
  },
  planButton: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  planButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: Colors.background,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
  },
});
