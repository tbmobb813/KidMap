// components/ParentalDashboard.tsx - Main parental control dashboard
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native'
import {
  Shield,
  MapPin,
  Clock,
  Bell,
  Settings,
  Users,
  AlertTriangle,
  CheckCircle,
  Battery,
  Navigation,
  Phone,
  MessageSquare,
  Activity,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react-native'
import Colors from '../constants/colors'
import AccessibleButton from './AccessibleButton'
import ParentAuthentication from './ParentAuthentication'
import { useParentalControlStore } from '../stores/parentalControlStore'
import { useSafeZoneStore } from '../stores/safeZoneStore'

const { width } = Dimensions.get('window')

interface ParentalDashboardProps {
  visible: boolean
  onClose: () => void
}

export default function ParentalDashboard({
  visible,
  onClose,
}: ParentalDashboardProps) {
  const {
    session,
    isSessionValid,
    extendSession,
    childActivity,
    pendingApprovals,
    requestChildCheckIn,
    locateChild,
    triggerEmergencyAlert,
    settings,
  } = useParentalControlStore()

  const { safeZones } = useSafeZoneStore()

  const [showAuth, setShowAuth] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'activity' | 'approvals' | 'settings'
  >('overview')

  useEffect(() => {
    if (visible) {
      checkAuthentication()
    }
  }, [visible])

  const checkAuthentication = () => {
    if (!isSessionValid()) {
      setShowAuth(true)
    } else {
      extendSession()
    }
  }

  const handleAuthenticated = () => {
    setShowAuth(false)
  }

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)

    try {
      // Refresh child activity, location, etc.
      // In a real implementation, this would fetch from API
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  const handleEmergencyAction = (action: 'locate' | 'checkin' | 'alert') => {
    Alert.alert(
      'Emergency Action',
      `Are you sure you want to ${action === 'locate' ? 'locate your child' : action === 'checkin' ? 'request a check-in' : 'send an emergency alert'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'alert' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              switch (action) {
                case 'locate':
                  const location = await locateChild()
                  if (location) {
                    Alert.alert(
                      'Child Located',
                      `Current location: ${location[0].toFixed(6)}, ${location[1].toFixed(6)}`,
                    )
                  } else {
                    Alert.alert(
                      'Location Unavailable',
                      'Unable to get current location. The child may need to enable location services.',
                    )
                  }
                  break
                case 'checkin':
                  await requestChildCheckIn()
                  Alert.alert(
                    'Check-in Requested',
                    'Your child will receive a notification to check in.',
                  )
                  break
                case 'alert':
                  await triggerEmergencyAlert()
                  Alert.alert(
                    'Emergency Alert Sent',
                    'Emergency contacts have been notified.',
                  )
                  break
              }
            } catch (error) {
              Alert.alert(
                'Action Failed',
                'Unable to complete the requested action. Please try again.',
              )
            }
          },
        },
      ],
    )
  }

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionButton, styles.locateButton]}
          onPress={() => handleEmergencyAction('locate')}
          accessibilityLabel="Locate child"
        >
          <MapPin size={24} color={Colors.background} />
          <Text style={styles.actionButtonText}>Locate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.checkinButton]}
          onPress={() => handleEmergencyAction('checkin')}
          accessibilityLabel="Request check-in"
        >
          <MessageSquare size={24} color={Colors.background} />
          <Text style={styles.actionButtonText}>Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.emergencyButton]}
          onPress={() => handleEmergencyAction('alert')}
          accessibilityLabel="Send emergency alert"
        >
          <AlertTriangle size={24} color={Colors.background} />
          <Text style={styles.actionButtonText}>Emergency</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderChildStatus = () => {
    const isOnline =
      childActivity.lastSeen &&
      Date.now() - childActivity.lastSeen.getTime() < 5 * 60 * 1000
    const batteryLevel = childActivity.batteryLevel || 0
    const batteryColor =
      batteryLevel > 20
        ? Colors.success
        : batteryLevel > 10
          ? Colors.warning
          : Colors.error

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Child Status</Text>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isOnline ? Colors.success : Colors.warning,
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {isOnline
                  ? 'Online'
                  : 'Last seen ' + getTimeAgo(childActivity.lastSeen)}
              </Text>
            </View>
          </View>

          {childActivity.batteryLevel !== null && (
            <View style={styles.batteryInfo}>
              <Battery size={16} color={batteryColor} />
              <Text style={[styles.batteryText, { color: batteryColor }]}>
                {batteryLevel}%
              </Text>
            </View>
          )}
        </View>

        {childActivity.isInSafeZone && (
          <View style={styles.safeZoneInfo}>
            <CheckCircle size={16} color={Colors.success} />
            <Text style={styles.safeZoneText}>
              Currently in safe zone:{' '}
              {childActivity.currentSafeZone || 'Unknown'}
            </Text>
          </View>
        )}

        {childActivity.currentLocation && (
          <View style={styles.locationInfo}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.locationText}>
              {childActivity.currentLocation[0].toFixed(4)},{' '}
              {childActivity.currentLocation[1].toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    )
  }

  const renderPendingApprovals = () => {
    const pending = pendingApprovals.filter(
      (approval) => approval.status === 'pending',
    )

    if (pending.length === 0) {
      return (
        <View style={styles.approvalCard}>
          <Text style={styles.sectionTitle}>Pending Approvals</Text>
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={Colors.success} />
            <Text style={styles.emptyStateText}>All caught up!</Text>
            <Text style={styles.emptyStateSubtext}>
              No pending approvals at this time.
            </Text>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.approvalCard}>
        <View style={styles.approvalHeader}>
          <Text style={styles.sectionTitle}>Pending Approvals</Text>
          <View style={styles.approvalBadge}>
            <Text style={styles.approvalBadgeText}>{pending.length}</Text>
          </View>
        </View>

        {pending.slice(0, 3).map((approval) => (
          <View key={approval.id} style={styles.approvalItem}>
            <View style={styles.approvalInfo}>
              <Text style={styles.approvalType}>
                {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}{' '}
                Request
              </Text>
              <Text style={styles.approvalTime}>
                {getTimeAgo(approval.requestedAt)}
              </Text>
            </View>
            <View style={styles.approvalActions}>
              <TouchableOpacity style={styles.approveButton}>
                <CheckCircle size={16} color={Colors.success} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton}>
                <X size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {pending.length > 3 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>
              View all {pending.length} approvals
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderSafeZoneOverview = () => (
    <View style={styles.safeZoneCard}>
      <Text style={styles.sectionTitle}>Safe Zones</Text>
      <View style={styles.safeZoneStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{safeZones.length}</Text>
          <Text style={styles.statLabel}>Total Zones</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {safeZones.filter((zone) => zone.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>
            {childActivity.isInSafeZone ? '✓' : '—'}
          </Text>
          <Text style={styles.statLabel}>Current Status</Text>
        </View>
      </View>
    </View>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {renderChildStatus()}
            {renderQuickActions()}
            {renderPendingApprovals()}
            {renderSafeZoneOverview()}
          </>
        )
      case 'activity':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Activity Monitor</Text>
            <Text style={styles.tabSubtitle}>
              Detailed activity tracking coming soon...
            </Text>
          </View>
        )
      case 'approvals':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Approval Management</Text>
            <Text style={styles.tabSubtitle}>
              Detailed approval management coming soon...
            </Text>
          </View>
        )
      case 'settings':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Parent Settings</Text>
            <Text style={styles.tabSubtitle}>
              Settings configuration coming soon...
            </Text>
          </View>
        )
      default:
        return null
    }
  }

  const renderTabs = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'overview', label: 'Overview', icon: Activity },
        { key: 'activity', label: 'Activity', icon: Eye },
        { key: 'approvals', label: 'Approvals', icon: CheckCircle },
        { key: 'settings', label: 'Settings', icon: Settings },
      ].map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.key

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
            accessibilityLabel={`${tab.label} tab`}
          >
            <Icon
              size={20}
              color={isActive ? Colors.primary : Colors.textLight}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.key === 'approvals' &&
              pendingApprovals.filter((a) => a.status === 'pending').length >
                0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {
                      pendingApprovals.filter((a) => a.status === 'pending')
                        .length
                    }
                  </Text>
                </View>
              )}
          </TouchableOpacity>
        )
      })}
    </View>
  )

  if (!visible) return null

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Shield size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>Parental Controls</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {renderTabs()}

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderTabContent()}
        </ScrollView>
      </View>

      <ParentAuthentication
        visible={showAuth}
        onAuthenticated={handleAuthenticated}
        onCancel={onClose}
      />
    </>
  )
}

// Helper function
const getTimeAgo = (date: Date | null): string => {
  if (!date) return 'unknown'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
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
    backgroundColor: Colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  tabBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  batteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  safeZoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: Colors.success + '15',
    borderRadius: 8,
  },
  safeZoneText: {
    fontSize: 14,
    color: Colors.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  quickActions: {
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locateButton: {
    backgroundColor: Colors.primary,
  },
  checkinButton: {
    backgroundColor: Colors.warning,
  },
  emergencyButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  approvalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  approvalBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvalBadgeText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  approvalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  approvalInfo: {
    flex: 1,
  },
  approvalType: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  approvalTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.success + '15',
  },
  rejectButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.error + '15',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  safeZoneCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  safeZoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
})
