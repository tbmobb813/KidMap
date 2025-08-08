// components/SafetyDashboard.tsx - Unified safety control center
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native'
import {
  Shield,
  MapPin,
  Phone,
  Settings,
  Bell,
  Users,
  CheckSquare,
  Plus,
  Eye,
  Zap,
  Heart,
  Navigation,
} from 'lucide-react-native'
import Colors from '../constants/colors'
import AccessibleButton from './AccessibleButton'
import ParentAuthentication from './ParentAuthentication'
import ParentalDashboard from './ParentalDashboard'
import DevicePingControl from './DevicePingControl'
import SafeZoneManager from './SafeZoneManager'
import ApprovalManager from './ApprovalManager'
import ParentSettings from './ParentSettings'
import CategoryCreator from './CategoryCreator'
import VoiceNavigation from './VoiceNavigation'
import { useParentalControlStore } from '../stores/parentalControlStore'
import { useSafeZoneStore } from '../stores/safeZoneStore'
import { useCategoryStore } from '../stores/categoryStore'

interface SafetyDashboardProps {
  visible: boolean
  onClose: () => void
}

type DashboardMode = 'child' | 'parent' | 'auth'
type ParentView = 'dashboard' | 'ping' | 'safezones' | 'approvals' | 'settings'

export default function SafetyDashboard({
  visible,
  onClose,
}: SafetyDashboardProps) {
  const { session, childActivity, pendingApprovals } = useParentalControlStore()
  const { safeZones } = useSafeZoneStore()
  const { getPendingCategories, initializeDefaultCategories } =
    useCategoryStore()

  const [mode, setMode] = useState<DashboardMode>('child')
  const [parentView, setParentView] = useState<ParentView>('dashboard')
  const [showCategoryCreator, setShowCategoryCreator] = useState(false)
  const [showVoiceNav, setShowVoiceNav] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Initialize default categories on first load
    initializeDefaultCategories()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh operations
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleParentAccess = () => {
    if (session?.isAuthenticated) {
      setMode('parent')
      setParentView('dashboard')
    } else {
      setMode('auth')
    }
  }

  const handleAuthSuccess = () => {
    setMode('parent')
    setParentView('dashboard')
  }

  const handleBackToChild = () => {
    setMode('child')
    setParentView('dashboard')
  }

  const pendingApprovalsCount = pendingApprovals?.length || 0
  const pendingCategories = getPendingCategories().length
  const currentSafeZone = safeZones?.[0] || null // Get first active safe zone
  const isInSafeZone = childActivity.isInSafeZone

  // Child Safety Dashboard
  const renderChildDashboard = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Safety Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Shield
            size={24}
            color={isInSafeZone ? Colors.success : Colors.warning}
          />
          <Text style={styles.statusTitle}>Safety Status</Text>
        </View>
        <Text
          style={[
            styles.statusText,
            { color: isInSafeZone ? Colors.success : Colors.warning },
          ]}
        >
          {isInSafeZone
            ? `✅ You're in ${currentSafeZone || 'a safe zone'}!`
            : "⚠️ You're outside your safe zones"}
        </Text>
        {!isInSafeZone && (
          <Text style={styles.statusSubtext}>
            Let your parent know where you are or head to a safe zone
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowVoiceNav(true)}
          >
            <Navigation size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Voice Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowCategoryCreator(true)}
          >
            <Plus size={24} color={Colors.success} />
            <Text style={styles.quickActionText}>New Category</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              Alert.alert('Check In', "Let your parent know you're safe!", [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Send Check-in',
                  onPress: () => {
                    // Trigger check-in logic
                    Alert.alert(
                      'Check-in Sent!',
                      "Your parent has been notified that you're safe! 💚",
                    )
                  },
                },
              ])
            }}
          >
            <Heart size={24} color={Colors.error} />
            <Text style={styles.quickActionText}>I'm Safe!</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Parent Access */}
      <View style={styles.section}>
        <AccessibleButton
          title="Parent/Guardian Access"
          onPress={handleParentAccess}
          style={styles.parentAccessButton}
          textStyle={styles.parentAccessText}
        />
      </View>

      {/* Current Safe Zones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Your Safe Zones ({safeZones.length})
        </Text>
        {safeZones.slice(0, 3).map((zone) => (
          <View key={zone.id} style={styles.safeZoneItem}>
            <MapPin size={16} color={Colors.success} />
            <Text style={styles.safeZoneText}>{zone.name}</Text>
            <Text style={styles.safeZoneDistance}>{zone.radius}m</Text>
          </View>
        ))}
        {safeZones.length > 3 && (
          <Text style={styles.moreText}>
            +{safeZones.length - 3} more safe zones
          </Text>
        )}
      </View>
    </ScrollView>
  )

  // Parent Dashboard Views
  const renderParentContent = () => {
    switch (parentView) {
      case 'ping':
        return (
          <DevicePingControl
            visible={true}
            onClose={() => setParentView('dashboard')}
          />
        )
      case 'safezones':
        return <SafeZoneManager />
      case 'approvals':
        return (
          <ApprovalManager
            visible={true}
            onClose={() => setParentView('dashboard')}
          />
        )
      case 'settings':
        return (
          <ParentSettings
            visible={true}
            onClose={() => setParentView('dashboard')}
          />
        )
      default:
        return <ParentalDashboard visible={true} onClose={handleBackToChild} />
    }
  }

  if (!visible) return null

  // Authentication Mode
  if (mode === 'auth') {
    return (
      <ParentAuthentication
        visible={true}
        onAuthenticated={handleAuthSuccess}
        onCancel={() => setMode('child')}
      />
    )
  }

  // Parent Mode
  if (mode === 'parent') {
    return (
      <View style={styles.container}>
        {parentView === 'dashboard' ? (
          renderParentContent()
        ) : (
          <View style={styles.container}>
            <View style={styles.parentHeader}>
              <TouchableOpacity
                onPress={() => setParentView('dashboard')}
                style={styles.backButton}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.parentTitle}>
                {parentView === 'ping' && 'Device Control'}
                {parentView === 'safezones' && 'Safe Zones'}
                {parentView === 'approvals' && 'Approvals'}
                {parentView === 'settings' && 'Settings'}
              </Text>
              <TouchableOpacity
                onPress={handleBackToChild}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            {renderParentContent()}
          </View>
        )}
      </View>
    )
  }

  // Child Mode (Default)
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Center</Text>
        <View style={styles.notificationBadge}>
          {(pendingApprovalsCount > 0 || pendingCategories > 0) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingApprovalsCount + pendingCategories}
              </Text>
            </View>
          )}
        </View>
      </View>

      {renderChildDashboard()}

      {/* Modals */}
      <CategoryCreator
        visible={showCategoryCreator}
        onClose={() => setShowCategoryCreator(false)}
      />

      <VoiceNavigation
        currentStep="Safety Dashboard"
        isNavigationPaused={!showVoiceNav}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: Colors.text.primaryLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: Colors.text.primaryLight,
    lineHeight: 18,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  parentAccessButton: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: 16,
  },
  parentAccessText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  safeZoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  safeZoneText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  safeZoneDistance: {
    fontSize: 12,
    color: Colors.text.primaryLight,
  },
  moreText: {
    fontSize: 12,
    color: Colors.text.primaryLight,
    textAlign: 'center',
    marginTop: 8,
  },
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.primary,
  },
  parentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
})
