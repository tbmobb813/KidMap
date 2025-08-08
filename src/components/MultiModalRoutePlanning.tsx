// components/MultiModalRoutePlanning.tsx - Complete multi-modal route planning interface
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
} from 'react-native'
import {
  MapPin,
  Navigation,
  Clock,
  Route,
  Star,
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Users,
  Cloud,
  Sun,
  CloudRain,
} from 'lucide-react-native'
import Colors from '../constants/colors'
import AccessibleButton from './AccessibleButton'
import TransportModeSelector from './TransportModeSelector'
import {
  MultiModalRoutePlanner,
  MultiModalRouteOptions,
} from '../utils/multiModalRoutePlanner'
import { RouteOption } from '../utils/routePlanner'
import { TravelMode } from '../utils/api'

interface MultiModalRoutePlanningProps {
  from: [number, number]
  to: [number, number]
  fromAddress: string
  toAddress: string
  onRouteSelected: (route: RouteOption) => void
  onClose: () => void
  childAge?: number
  parentSupervision?: boolean
}

export const MultiModalRoutePlanning: React.FC<
  MultiModalRoutePlanningProps
> = ({
  from,
  to,
  fromAddress,
  toAddress,
  onRouteSelected,
  onClose,
  childAge = 10,
  parentSupervision = true,
}) => {
  // State management
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)
  const [showModeSelector, setShowModeSelector] = useState(false)

  // Helper function to get current time of day
  const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  const [routeOptions, setRouteOptions] = useState<
    Partial<MultiModalRouteOptions>
  >({
    childAge,
    parentSupervision,
    timeOfDay: getCurrentTimeOfDay(),
    weatherCondition: 'sunny', // Would be fetched from weather API
    preferredModes: ['walking', 'transit'],
    maxWalkingDistance: 800,
    avoidStairs: false,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

  // Animation values
  const fadeAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(300)

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    // Load initial routes
    loadRoutes()
  }, [])

  useEffect(() => {
    // Reload routes when options change
    if (routes.length > 0) {
      loadRoutes()
    }
  }, [routeOptions])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const multiModalRoutes = await MultiModalRoutePlanner.getMultiModalRoutes(
        from,
        to,
        routeOptions,
      )
      setRoutes(multiModalRoutes)
    } catch (error) {
      console.error('Error loading routes:', error)
      Alert.alert(
        'Route Error',
        'Failed to load route options. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route)
    onRouteSelected(route)
  }

  const handleModeSelection = (modes: TravelMode[]) => {
    setRouteOptions((prev) => ({
      ...prev,
      preferredModes: modes,
    }))
    setShowModeSelector(false)
  }

  const getWeatherIcon = () => {
    switch (routeOptions.weatherCondition) {
      case 'sunny':
        return <Sun size={20} color={Colors.primary} />
      case 'rainy':
        return <CloudRain size={20} color={Colors.primary} />
      default:
        return <Cloud size={20} color={Colors.primary} />
    }
  }

  const renderRouteCard = (route: RouteOption) => {
    const isExpanded = expandedRoute === route.id
    const safetyColor =
      route.safety >= 4
        ? Colors.success
        : route.safety >= 3
          ? Colors.warning
          : Colors.error
    const kidFriendlinessColor =
      route.kidFriendliness >= 4
        ? Colors.success
        : route.kidFriendliness >= 3
          ? Colors.warning
          : Colors.error

    return (
      <View key={route.id} style={styles.routeCard}>
        <TouchableOpacity
          onPress={() => setExpandedRoute(isExpanded ? null : route.id)}
          style={styles.routeHeader}
          accessibilityLabel={`Route option ${route.mode}, ${route.duration} minutes`}
          accessibilityHint="Tap to expand route details"
        >
          <View style={styles.routeHeaderLeft}>
            <View
              style={[
                styles.modeIcon,
                { backgroundColor: getModeColor(route.mode) },
              ]}
            >
              {getModeIcon(route.mode)}
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeMode}>{formatMode(route.mode)}</Text>
              <View style={styles.routeMetrics}>
                <Clock size={14} color={Colors.text.secondary} />
                <Text style={styles.routeTime}>{route.duration} min</Text>
                <Route
                  size={14}
                  color={Colors.text.secondary}
                  style={{ marginLeft: 8 }}
                />
                <Text style={styles.routeDistance}>
                  {(route.distance / 1000).toFixed(1)} km
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.routeRatings}>
            <RatingIndicator
              label="Safety"
              value={route.safety}
              color={safetyColor}
              size="small"
            />
            <RatingIndicator
              label="Kid-Friendly"
              value={route.kidFriendliness}
              color={kidFriendlinessColor}
              size="small"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View style={styles.routeDetails}>
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Route Steps</Text>
              {route.steps.slice(0, 5).map((step, index) => (
                <View key={step.id} style={styles.stepItem}>
                  <View style={styles.stepIcon}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepInstruction}>
                      {step.instruction}
                    </Text>
                    <Text style={styles.stepDuration}>{step.duration} min</Text>
                    {step.accessibilityNote && (
                      <Text style={styles.stepNote}>
                        {step.accessibilityNote}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
              {route.steps.length > 5 && (
                <Text style={styles.moreSteps}>
                  + {route.steps.length - 5} more steps
                </Text>
              )}
            </View>

            <View style={styles.detailsActions}>
              <AccessibleButton
                title="Select This Route"
                onPress={() => handleRouteSelect(route)}
                style={{
                  ...styles.selectButton,
                  backgroundColor: Colors.primary,
                }}
                textStyle={styles.selectButtonText}
              />
            </View>
          </Animated.View>
        )}
      </View>
    )
  }

  const renderSettings = () => (
    <Modal
      visible={showSettings}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.settingsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Route Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Child Age</Text>
              <View style={styles.ageSelector}>
                {[6, 8, 10, 12, 14].map((age) => (
                  <TouchableOpacity
                    key={age}
                    style={[
                      styles.ageButton,
                      routeOptions.childAge === age && styles.ageButtonSelected,
                    ]}
                    onPress={() =>
                      setRouteOptions((prev) => ({ ...prev, childAge: age }))
                    }
                  >
                    <Text
                      style={[
                        styles.ageButtonText,
                        routeOptions.childAge === age &&
                          styles.ageButtonTextSelected,
                      ]}
                    >
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Adult Supervision</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    routeOptions.parentSupervision && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setRouteOptions((prev) => ({
                      ...prev,
                      parentSupervision: !prev.parentSupervision,
                    }))
                  }
                >
                  <Users
                    size={16}
                    color={
                      routeOptions.parentSupervision
                        ? Colors.white
                        : Colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      routeOptions.parentSupervision &&
                        styles.toggleButtonTextActive,
                    ]}
                  >
                    {routeOptions.parentSupervision
                      ? 'With Adult'
                      : 'Independent'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Weather Condition</Text>
              <View style={styles.weatherSelector}>
                {['sunny', 'cloudy', 'rainy'].map((weather) => (
                  <TouchableOpacity
                    key={weather}
                    style={[
                      styles.weatherButton,
                      routeOptions.weatherCondition === weather &&
                        styles.weatherButtonSelected,
                    ]}
                    onPress={() =>
                      setRouteOptions((prev) => ({
                        ...prev,
                        weatherCondition: weather as any,
                      }))
                    }
                  >
                    {weather === 'sunny' && (
                      <Sun size={16} color={Colors.primary} />
                    )}
                    {weather === 'cloudy' && (
                      <Cloud size={16} color={Colors.primary} />
                    )}
                    {weather === 'rainy' && (
                      <CloudRain size={16} color={Colors.primary} />
                    )}
                    <Text style={styles.weatherButtonText}>
                      {weather.charAt(0).toUpperCase() + weather.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Maximum Walking Distance</Text>
              <View style={styles.distanceSelector}>
                {[400, 600, 800, 1000].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceButton,
                      routeOptions.maxWalkingDistance === distance &&
                        styles.distanceButtonSelected,
                    ]}
                    onPress={() =>
                      setRouteOptions((prev) => ({
                        ...prev,
                        maxWalkingDistance: distance,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.distanceButtonText,
                        routeOptions.maxWalkingDistance === distance &&
                          styles.distanceButtonTextSelected,
                      ]}
                    >
                      {distance}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <AccessibleButton
              title="Apply Settings"
              onPress={() => {
                setShowSettings(false)
                loadRoutes()
              }}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  )

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.locationInfo}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.headerTitle}>Route Planning</Text>
              </View>
              <View style={styles.routeSummary}>
                <Text style={styles.addresses}>
                  {fromAddress} → {toAddress}
                </Text>
                <View style={styles.contextInfo}>
                  {getWeatherIcon()}
                  <Text style={styles.contextText}>
                    Age {routeOptions.childAge}
                  </Text>
                  {routeOptions.parentSupervision && (
                    <Users size={16} color={Colors.primary} />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setShowSettings(true)}
                style={styles.settingsButton}
                accessibilityLabel="Open route settings"
              >
                <Settings size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close route planning"
              >
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modeSelectionBar}>
            <AccessibleButton
              title="Select Transport Modes"
              onPress={() => setShowModeSelector(true)}
              style={styles.modeSelectButton}
              textStyle={styles.modeSelectText}
            />
          </View>

          <ScrollView
            style={styles.routesList}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Finding best routes...</Text>
              </View>
            ) : routes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AlertTriangle size={48} color={Colors.warning} />
                <Text style={styles.emptyTitle}>No Routes Found</Text>
                <Text style={styles.emptyDescription}>
                  Try adjusting your settings or selecting different transport
                  modes.
                </Text>
                <AccessibleButton
                  title="Adjust Settings"
                  onPress={() => setShowSettings(true)}
                  style={styles.adjustButton}
                />
              </View>
            ) : (
              routes.map(renderRouteCard)
            )}
          </ScrollView>

          {showModeSelector && (
            <TransportModeSelector
              selectedMode="combined"
              onModeSelect={(mode) => {
                // Handle mode selection
                setShowModeSelector(false)
              }}
              fromLocation={`${from[0]}, ${from[1]}`}
              toLocation={`${to[0]}, ${to[1]}`}
              weatherInfo={{
                condition: routeOptions.weatherCondition || 'sunny',
                temperature: 20,
              }}
            />
          )}

          {renderSettings()}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

// Helper components
const RatingIndicator: React.FC<{
  label: string
  value: number
  color: string
  size?: 'small' | 'large'
}> = ({ label, value, color, size = 'large' }) => (
  <View style={styles.ratingIndicator}>
    <Text
      style={[styles.ratingLabel, size === 'small' && styles.ratingLabelSmall]}
    >
      {label}
    </Text>
    <View style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size === 'small' ? 10 : 12}
          color={star <= value ? color : Colors.gray}
          fill={star <= value ? color : 'transparent'}
        />
      ))}
    </View>
  </View>
)

// Helper functions
const getModeColor = (mode: TravelMode): string => {
  const colors = {
    walking: Colors.success,
    bicycling: Colors.primary,
    transit: Colors.warning,
    driving: Colors.error,
  }
  return colors[mode] || Colors.gray
}

const getModeIcon = (mode: TravelMode) => {
  // Return appropriate icon for each mode
  return <Navigation size={16} color={Colors.white} />
}

const formatMode = (mode: TravelMode): string => {
  const formats = {
    walking: 'Walking',
    bicycling: 'Biking',
    transit: 'Public Transit',
    driving: 'Driving',
  }
  return formats[mode] || mode
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  routeSummary: {
    marginTop: 4,
  },
  addresses: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  contextInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  modeSelectionBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modeSelectButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modeSelectText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  routesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  adjustButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
  },
  routeCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  routeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeMode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  routeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  routeDistance: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  routeRatings: {
    alignItems: 'flex-end',
  },
  ratingIndicator: {
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  ratingLabelSmall: {
    fontSize: 8,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  routeDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  detailsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  stepDuration: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  stepNote: {
    fontSize: 12,
    color: Colors.warning,
    fontStyle: 'italic',
    marginTop: 2,
  },
  moreSteps: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  detailsActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  selectButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingGroup: {
    marginVertical: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  ageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  ageButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  ageButtonTextSelected: {
    color: Colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.primary,
  },
  toggleButtonTextActive: {
    color: Colors.white,
  },
  weatherSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  weatherButtonSelected: {
    borderColor: Colors.primary,
  },
  weatherButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.text.primary,
  },
  distanceSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  distanceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  distanceButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  distanceButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  distanceButtonTextSelected: {
    color: Colors.white,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
  },
})
