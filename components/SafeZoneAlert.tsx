// components/SafeZoneAlert.tsx - Real-time safe zone notifications
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native'
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  MapPin,
} from 'lucide-react-native'
import Colors from '@/constants/colors'
import { SafeZoneEvent } from '@/utils/safeZoneAlerts'

interface SafeZoneAlertProps {
  event: SafeZoneEvent | null
  onDismiss: () => void
  style?: any
}

const { width: screenWidth } = Dimensions.get('window')

export default function SafeZoneAlert({
  event,
  onDismiss,
  style,
}: SafeZoneAlertProps) {
  const [slideAnim] = useState(new Animated.Value(-100))
  const [opacityAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    if (event) {
      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss()
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      // Reset animations when no event
      slideAnim.setValue(-100)
      opacityAnim.setValue(0)
    }
  }, [event])

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss()
    })
  }

  if (!event) return null

  const isEntering = event.eventType === 'enter'
  const alertColor = isEntering ? Colors.success : Colors.warning
  const IconComponent = isEntering ? ShieldCheck : ShieldAlert

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: alertColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconComponent size={24} color="#FFFFFF" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isEntering ? 'Entered Safe Zone' : 'Left Safe Zone'}
          </Text>
          <Text style={styles.zoneName}>{event.zoneName}</Text>
          <View style={styles.detailsRow}>
            <MapPin size={12} color="#FFFFFF" style={styles.locationIcon} />
            <Text style={styles.timestamp}>
              {event.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Progress bar for auto-dismiss */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: slideAnim.interpolate({
                inputRange: [-100, 0],
                outputRange: [0, screenWidth - 32],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
    opacity: 0.8,
  },
  timestamp: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
})

// SafeZoneAlert History Component for parent dashboard
interface SafeZoneAlertHistoryProps {
  events: SafeZoneEvent[]
  maxEvents?: number
}

export function SafeZoneAlertHistory({
  events,
  maxEvents = 10,
}: SafeZoneAlertHistoryProps) {
  const recentEvents = events.slice(0, maxEvents)

  if (recentEvents.length === 0) {
    return (
      <View style={historyStyles.emptyContainer}>
        <Shield size={32} color={Colors.textLight} />
        <Text style={historyStyles.emptyText}>
          No recent safe zone activity
        </Text>
      </View>
    )
  }

  return (
    <View style={historyStyles.container}>
      <Text style={historyStyles.title}>Recent Safe Zone Activity</Text>
      {recentEvents.map((event, index) => (
        <View key={event.id} style={historyStyles.eventItem}>
          <View style={historyStyles.eventIcon}>
            {event.eventType === 'enter' ? (
              <ShieldCheck size={16} color={Colors.success} />
            ) : (
              <ShieldAlert size={16} color={Colors.warning} />
            )}
          </View>
          <View style={historyStyles.eventContent}>
            <Text style={historyStyles.eventTitle}>
              {event.eventType === 'enter' ? 'Entered' : 'Left'}{' '}
              {event.zoneName}
            </Text>
            <Text style={historyStyles.eventTime}>
              {event.timestamp.toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const historyStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
})
