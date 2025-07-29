// components/DevicePingControl.tsx - Parent interface for device ping functionality
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import {
  Phone,
  MapPin,
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Volume2,
  Smartphone,
  Battery,
  Wifi,
  MapPinIcon,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import AccessibleButton from './AccessibleButton';
import { devicePingManager, PingRequest, LocationUpdate } from '../utils/devicePing';
import { useParentalControlStore } from '../stores/parentalControlStore';

interface DevicePingControlProps {
  visible: boolean;
  onClose: () => void;
}

export default function DevicePingControl({ visible, onClose }: DevicePingControlProps) {
  const { isAuthenticated } = useParentalControlStore();
  
  const [pendingPings, setPendingPings] = useState<PingRequest[]>([]);
  const [pingHistory, setPingHistory] = useState<PingRequest[]>([]);
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPingType, setSelectedPingType] = useState<PingRequest['type']>('ring');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<LocationUpdate | null>(null);

  useEffect(() => {
    if (visible && isAuthenticated) {
      refreshPingData();
      // Set up periodic refresh
      const interval = setInterval(refreshPingData, 5000);
      return () => clearInterval(interval);
    }
  }, [visible, isAuthenticated]);

  const refreshPingData = useCallback(async () => {
    try {
      setPendingPings(devicePingManager.getPendingRequests());
      setPingHistory(devicePingManager.getPingHistory());
    } catch (error) {
      console.error('Error refreshing ping data:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPingData();
    setRefreshing(false);
  }, [refreshPingData]);

  const sendPing = useCallback(async (type: PingRequest['type'], message?: string) => {
    if (!isAuthenticated) {
      Alert.alert('Authentication Required', 'Please authenticate to send pings to your child.');
      return;
    }

    setIsLoading(true);
    try {
      let pingId: string;
      
      switch (type) {
        case 'ring':
          pingId = await devicePingManager.ringChild(message);
          break;
        case 'locate':
          pingId = await devicePingManager.requestLocation(message);
          break;
        case 'check-in':
          pingId = await devicePingManager.requestCheckIn(message);
          break;
        case 'emergency':
          pingId = await devicePingManager.sendEmergencyPing(message);
          break;
        default:
          throw new Error('Invalid ping type');
      }

      Alert.alert(
        'Ping Sent',
        `Your ${type} request has been sent to your child's device.`,
        [{ text: 'OK', onPress: refreshPingData }]
      );

      setShowCustomMessage(false);
      setCustomMessage('');
      
    } catch (error) {
      console.error('Error sending ping:', error);
      Alert.alert('Error', 'Failed to send ping. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshPingData]);

  const showCustomMessageModal = useCallback((type: PingRequest['type']) => {
    setSelectedPingType(type);
    setCustomMessage('');
    setShowCustomMessage(true);
  }, []);

  const sendCustomPing = useCallback(async () => {
    if (!customMessage.trim()) {
      Alert.alert('Message Required', 'Please enter a message for your child.');
      return;
    }
    await sendPing(selectedPingType, customMessage.trim());
  }, [customMessage, selectedPingType, sendPing]);

  const formatTimeAgo = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  const getPingIcon = useCallback((type: PingRequest['type'], size = 20) => {
    switch (type) {
      case 'ring':
        return <Phone size={size} color={Colors.primary} />;
      case 'locate':
        return <MapPin size={size} color={Colors.primary} />;
      case 'check-in':
        return <MessageCircle size={size} color={Colors.primary} />;
      case 'emergency':
        return <AlertTriangle size={size} color={Colors.error} />;
      default:
        return <Smartphone size={size} color={Colors.primary} />;
    }
  }, []);

  const getPingStatusColor = useCallback((ping: PingRequest) => {
    if (ping.acknowledged) return Colors.success;
    if (Date.now() > ping.expiresAt) return Colors.textLight;
    if (ping.urgency === 'emergency') return Colors.error;
    return Colors.warning;
  }, []);

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionButton, styles.ringButton]}
          onPress={() => sendPing('ring')}
          disabled={isLoading}
        >
          <Phone size={24} color={Colors.background} />
          <Text style={styles.actionButtonText}>Ring Device</Text>
          <Text style={styles.actionButtonSubtext}>Make device ring</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.locateButton]}
          onPress={() => sendPing('locate')}
          disabled={isLoading}
        >
          <MapPin size={24} color={Colors.background} />
          <Text style={styles.actionButtonText}>Get Location</Text>
          <Text style={styles.actionButtonSubtext}>Request current location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.checkInButton]}
          onPress={() => sendPing('check-in')}
          disabled={isLoading}
        >
          <MessageCircle size={24} color={Colors.background} />
          <Text style={styles.actionButtonText}>Check-in</Text>
          <Text style={styles.actionButtonSubtext}>Ask how they're doing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.emergencyButton]}
          onPress={() => {
            Alert.alert(
              'Emergency Ping',
              'This will send an urgent notification to your child. Use only for emergencies.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send Emergency', style: 'destructive', onPress: () => sendPing('emergency') }
              ]
            );
          }}
          disabled={isLoading}
        >
          <AlertTriangle size={24} color={Colors.background} />
          <Text style={styles.actionButtonText}>Emergency</Text>
          <Text style={styles.actionButtonSubtext}>Urgent response needed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customMessageRow}>
        <AccessibleButton
          title="Send Custom Message"
          onPress={() => showCustomMessageModal('check-in')}
          style={styles.customMessageButton}
          textStyle={styles.customMessageButtonText}
          leftIcon={<Send size={16} color={Colors.primary} />}
          disabled={isLoading}
        />
      </View>
    </View>
  );

  const renderPendingPings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Pending Requests ({pendingPings.length})
      </Text>
      
      {pendingPings.length === 0 ? (
        <View style={styles.emptyState}>
          <CheckCircle size={48} color={Colors.success} />
          <Text style={styles.emptyStateText}>No pending requests</Text>
          <Text style={styles.emptyStateSubtext}>Your child has responded to all pings</Text>
        </View>
      ) : (
        pendingPings.map(ping => (
          <View key={ping.id} style={styles.pingItem}>
            <View style={styles.pingHeader}>
              <View style={styles.pingInfo}>
                {getPingIcon(ping.type)}
                <View style={styles.pingDetails}>
                  <Text style={styles.pingType}>
                    {ping.type.charAt(0).toUpperCase() + ping.type.slice(1)} Request
                  </Text>
                  <Text style={styles.pingTime}>{formatTimeAgo(ping.timestamp)}</Text>
                </View>
              </View>
              <View style={[styles.pingStatus, { backgroundColor: getPingStatusColor(ping) + '20' }]}>
                <Clock size={12} color={getPingStatusColor(ping)} />
                <Text style={[styles.pingStatusText, { color: getPingStatusColor(ping) }]}>
                  Pending
                </Text>
              </View>
            </View>
            
            {ping.message && (
              <Text style={styles.pingMessage}>{ping.message}</Text>
            )}
            
            <View style={styles.pingFooter}>
              <Text style={styles.urgencyText}>
                Priority: {ping.urgency.toUpperCase()}
              </Text>
              <Text style={styles.expiresText}>
                Expires {formatTimeAgo(ping.expiresAt)}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderPingHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      
      {pingHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={48} color={Colors.textLight} />
          <Text style={styles.emptyStateText}>No recent activity</Text>
          <Text style={styles.emptyStateSubtext}>Device pings will appear here</Text>
        </View>
      ) : (
        pingHistory.slice(0, 10).map(ping => (
          <View key={ping.id} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              {getPingIcon(ping.type, 16)}
              <Text style={styles.historyType}>
                {ping.type.charAt(0).toUpperCase() + ping.type.slice(1)}
              </Text>
              <Text style={styles.historyTime}>{formatTimeAgo(ping.timestamp)}</Text>
              <View style={styles.historyStatus}>
                {ping.acknowledged ? (
                  <CheckCircle size={16} color={Colors.success} />
                ) : (
                  <XCircle size={16} color={Colors.error} />
                )}
              </View>
            </View>
            
            {ping.message && (
              <Text style={styles.historyMessage}>{ping.message}</Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderLastLocation = () => {
    if (!lastLocationUpdate) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Known Location</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <MapPinIcon size={20} color={Colors.primary} />
            <Text style={styles.locationTime}>
              Updated {formatTimeAgo(lastLocationUpdate.timestamp)}
            </Text>
          </View>
          
          {lastLocationUpdate.address && (
            <Text style={styles.locationAddress}>{lastLocationUpdate.address}</Text>
          )}
          
          <Text style={styles.locationCoords}>
            {lastLocationUpdate.latitude.toFixed(6)}, {lastLocationUpdate.longitude.toFixed(6)}
          </Text>
          
          <View style={styles.locationDetails}>
            <View style={styles.locationDetail}>
              <Text style={styles.locationDetailLabel}>Accuracy:</Text>
              <Text style={styles.locationDetailValue}>{Math.round(lastLocationUpdate.accuracy)}m</Text>
            </View>
            
            {lastLocationUpdate.batteryLevel && (
              <View style={styles.locationDetail}>
                <Battery size={14} color={Colors.textLight} />
                <Text style={styles.locationDetailValue}>{Math.round(lastLocationUpdate.batteryLevel)}%</Text>
              </View>
            )}
            
            <View style={styles.locationDetail}>
              <Wifi size={14} color={Colors.textLight} />
              <Text style={styles.locationDetailValue}>{lastLocationUpdate.networkStatus}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCustomMessageModal = () => (
    <Modal
      visible={showCustomMessage}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCustomMessage(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowCustomMessage(false)}
            style={styles.modalCloseButton}
          >
            <XCircle size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Send Custom Message</Text>
          <TouchableOpacity
            onPress={sendCustomPing}
            style={styles.modalSendButton}
            disabled={isLoading || !customMessage.trim()}
          >
            <Send size={24} color={customMessage.trim() ? Colors.primary : Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.messageTypeSelector}>
            <Text style={styles.inputLabel}>Message Type:</Text>
            <View style={styles.typeButtons}>
              {(['ring', 'locate', 'check-in'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedPingType === type && styles.typeButtonActive
                  ]}
                  onPress={() => setSelectedPingType(type)}
                >
                  {getPingIcon(type, 16)}
                  <Text style={[
                    styles.typeButtonText,
                    selectedPingType === type && styles.typeButtonTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.messageInput}>
            <Text style={styles.inputLabel}>Your Message:</Text>
            <TextInput
              style={styles.textInput}
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Enter a message for your child..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {customMessage.length}/200 characters
            </Text>
          </View>

          <View style={styles.presetMessages}>
            <Text style={styles.inputLabel}>Quick Messages:</Text>
            {[
              "Where are you right now?",
              "Please call me when you get this",
              "Time to come home",
              "Are you safe?",
              "Check in with me please"
            ].map(preset => (
              <TouchableOpacity
                key={preset}
                style={styles.presetButton}
                onPress={() => setCustomMessage(preset)}
              >
                <Text style={styles.presetButtonText}>{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XCircle size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device Control</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton} disabled={refreshing}>
            <Volume2 size={24} color={refreshing ? Colors.textLight : Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {renderQuickActions()}
          {renderLastLocation()}
          {renderPendingPings()}
          {renderPingHistory()}
        </ScrollView>

        {renderCustomMessageModal()}
      </View>
    </Modal>
  );
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  quickActions: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
    justifyContent: 'center',
  },
  ringButton: {
    backgroundColor: Colors.primary,
  },
  locateButton: {
    backgroundColor: Colors.secondary,
  },
  checkInButton: {
    backgroundColor: Colors.success,
  },
  emergencyButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  actionButtonSubtext: {
    color: Colors.background + 'CC',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  customMessageRow: {
    alignItems: 'center',
  },
  customMessageButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 200,
  },
  customMessageButtonText: {
    color: Colors.primary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  pingItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  pingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pingDetails: {
    marginLeft: 12,
  },
  pingType: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  pingTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  pingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pingStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pingMessage: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  pingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
  },
  expiresText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  historyItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  historyTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  historyStatus: {
    marginLeft: 8,
  },
  historyMessage: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  locationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationTime: {
    fontSize: 14,
    color: Colors.textLight,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 14,
    color: Colors.textLight,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  locationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationDetailLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  locationDetailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalSendButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  messageTypeSelector: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  typeButtonTextActive: {
    color: Colors.background,
  },
  messageInput: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 8,
  },
  presetMessages: {
    marginBottom: 24,
  },
  presetButton: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
});
