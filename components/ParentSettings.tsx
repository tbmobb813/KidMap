// components/ParentSettings.tsx - Comprehensive parent settings management
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native'
import {
  Settings,
  Shield,
  Clock,
  MapPin,
  Bell,
  Users,
  Phone,
  Lock,
  Fingerprint,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native'
import Colors from '../constants/colors'
import AccessibleButton from './AccessibleButton'
import {
  useParentalControlStore,
  ParentSettings,
  EmergencyContact,
} from '../stores/parentalControlStore'
import * as LocalAuthentication from 'expo-local-authentication'

interface ParentSettingsProps {
  visible: boolean
  onClose: () => void
}

export default function ParentSettings({
  visible,
  onClose,
}: ParentSettingsProps) {
  const { settings, updateSettings } = useParentalControlStore()

  const [editingSettings, setEditingSettings] =
    useState<ParentSettings>(settings)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null,
  )
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSettingChange = useCallback(
    (key: keyof ParentSettings, value: any) => {
      setEditingSettings((prev) => ({ ...prev, [key]: value }))
      setHasUnsavedChanges(true)
    },
    [],
  )

  const handleNestedSettingChange = useCallback(
    (parentKey: keyof ParentSettings, key: string, value: any) => {
      setEditingSettings((prev) => ({
        ...prev,
        [parentKey]: { ...(prev[parentKey] as any), [key]: value },
      }))
      setHasUnsavedChanges(true)
    },
    [],
  )

  const handleSaveSettings = () => {
    updateSettings(editingSettings)
    setHasUnsavedChanges(false)
    Alert.alert(
      'Settings Saved',
      'Your parental control settings have been updated.',
    )
  }

  const handleDiscardChanges = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setEditingSettings(settings)
              setHasUnsavedChanges(false)
              onClose()
            },
          },
        ],
      )
    } else {
      onClose()
    }
  }

  const renderAuthenticationSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Authentication & Security</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Shield size={20} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Require Authentication</Text>
            <Text style={styles.settingDescription}>
              Require PIN or biometric authentication to access parental
              controls
            </Text>
          </View>
        </View>
        <Switch
          value={editingSettings.requireAuthentication}
          onValueChange={(value) =>
            handleSettingChange('requireAuthentication', value)
          }
          trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
          thumbColor={
            editingSettings.requireAuthentication
              ? Colors.primary
              : Colors.textLight
          }
        />
      </View>

      {editingSettings.requireAuthentication && (
        <>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Lock size={20} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Authentication Method</Text>
                <Text style={styles.settingDescription}>
                  Choose how you want to authenticate
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.authMethodSelector}>
            {['pin', 'biometric', 'both'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.authMethodButton,
                  editingSettings.authenticationMethod === method &&
                    styles.authMethodButtonActive,
                ]}
                onPress={() =>
                  handleSettingChange('authenticationMethod', method)
                }
              >
                {method === 'pin' && (
                  <Lock
                    size={16}
                    color={
                      editingSettings.authenticationMethod === method
                        ? Colors.background
                        : Colors.textLight
                    }
                  />
                )}
                {method === 'biometric' && (
                  <Fingerprint
                    size={16}
                    color={
                      editingSettings.authenticationMethod === method
                        ? Colors.background
                        : Colors.textLight
                    }
                  />
                )}
                {method === 'both' && (
                  <Shield
                    size={16}
                    color={
                      editingSettings.authenticationMethod === method
                        ? Colors.background
                        : Colors.textLight
                    }
                  />
                )}
                <Text
                  style={[
                    styles.authMethodText,
                    editingSettings.authenticationMethod === method &&
                      styles.authMethodTextActive,
                  ]}
                >
                  {method === 'pin'
                    ? 'PIN Only'
                    : method === 'biometric'
                      ? 'Biometric Only'
                      : 'PIN + Biometric'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(editingSettings.authenticationMethod === 'pin' ||
            editingSettings.authenticationMethod === 'both') && (
            <AccessibleButton
              title={editingSettings.pin ? 'Change PIN' : 'Set PIN'}
              onPress={() => setShowPinSetup(true)}
              style={styles.pinSetupButton}
              leftIcon={<Edit3 size={16} color={Colors.primary} />}
            />
          )}
        </>
      )}
    </View>
  )

  const renderChildPermissions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Child Permissions</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Plus size={20} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Allow Category Creation</Text>
            <Text style={styles.settingDescription}>
              Let your child create new place categories
            </Text>
          </View>
        </View>
        <Switch
          value={editingSettings.allowChildCategoryCreation}
          onValueChange={(value) =>
            handleSettingChange('allowChildCategoryCreation', value)
          }
          trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
          thumbColor={
            editingSettings.allowChildCategoryCreation
              ? Colors.primary
              : Colors.textLight
          }
        />
      </View>

      {editingSettings.allowChildCategoryCreation && (
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <CheckCircle size={20} color={Colors.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Require Approval</Text>
              <Text style={styles.settingDescription}>
                New categories need parent approval before use
              </Text>
            </View>
          </View>
          <Switch
            value={editingSettings.requireApprovalForNewCategories}
            onValueChange={(value) =>
              handleSettingChange('requireApprovalForNewCategories', value)
            }
            trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
            thumbColor={
              editingSettings.requireApprovalForNewCategories
                ? Colors.primary
                : Colors.textLight
            }
          />
        </View>
      )}

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <MapPin size={20} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Allow Safe Zone Changes</Text>
            <Text style={styles.settingDescription}>
              Let your child modify safe zone boundaries
            </Text>
          </View>
        </View>
        <Switch
          value={editingSettings.allowChildSafeZoneModification}
          onValueChange={(value) =>
            handleSettingChange('allowChildSafeZoneModification', value)
          }
          trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
          thumbColor={
            editingSettings.allowChildSafeZoneModification
              ? Colors.primary
              : Colors.textLight
          }
        />
      </View>
    </View>
  )

  const renderSafetySettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Safety & Monitoring</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <MapPin size={20} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Max Safe Zone Distance</Text>
            <Text style={styles.settingDescription}>
              Maximum radius for safe zones (meters)
            </Text>
          </View>
        </View>
        <View style={styles.numberInput}>
          <TextInput
            style={styles.numberInputField}
            value={editingSettings.maxSafeZoneDistance.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 0
              handleSettingChange(
                'maxSafeZoneDistance',
                Math.max(50, Math.min(2000, value)),
              )
            }}
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.numberInputUnit}>m</Text>
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Bell size={20} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Check-in Reminders</Text>
            <Text style={styles.settingDescription}>
              Send periodic check-in reminders to your child
            </Text>
          </View>
        </View>
        <Switch
          value={editingSettings.checkInReminders}
          onValueChange={(value) =>
            handleSettingChange('checkInReminders', value)
          }
          trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
          thumbColor={
            editingSettings.checkInReminders ? Colors.primary : Colors.textLight
          }
        />
      </View>

      {editingSettings.checkInReminders && (
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Clock size={20} color={Colors.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Check-in Interval</Text>
              <Text style={styles.settingDescription}>
                How often to remind (minutes)
              </Text>
            </View>
          </View>
          <View style={styles.numberInput}>
            <TextInput
              style={styles.numberInputField}
              value={editingSettings.checkInInterval.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 0
                handleSettingChange(
                  'checkInInterval',
                  Math.max(15, Math.min(480, value)),
                )
              }}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.numberInputUnit}>min</Text>
          </View>
        </View>
      )}

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Eye size={20} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Location Sharing</Text>
            <Text style={styles.settingDescription}>
              Share child's location with emergency contacts
            </Text>
          </View>
        </View>
        <Switch
          value={editingSettings.locationSharing.enabled}
          onValueChange={(value) =>
            handleNestedSettingChange('locationSharing', 'enabled', value)
          }
          trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
          thumbColor={
            editingSettings.locationSharing.enabled
              ? Colors.primary
              : Colors.textLight
          }
        />
      </View>
    </View>
  )

  const renderRestrictedHours = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Restricted Hours</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Clock size={20} color={Colors.primary} />
          <View style={styles.settingText}>
            <Text style={styles.settingLabel}>Enable Restricted Hours</Text>
            <Text style={styles.settingDescription}>
              Limit app usage during certain hours
            </Text>
          </View>
        </View>
        <Switch
          value={editingSettings.restrictedHours.enabled}
          onValueChange={(value) =>
            handleNestedSettingChange('restrictedHours', 'enabled', value)
          }
          trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
          thumbColor={
            editingSettings.restrictedHours.enabled
              ? Colors.primary
              : Colors.textLight
          }
        />
      </View>

      {editingSettings.restrictedHours.enabled && (
        <>
          <View style={styles.timeRangeSelector}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <TextInput
                style={styles.timeInputField}
                value={editingSettings.restrictedHours.start}
                onChangeText={(text) =>
                  handleNestedSettingChange('restrictedHours', 'start', text)
                }
                placeholder="HH:MM"
                maxLength={5}
              />
            </View>
            <Text style={styles.timeSeparator}>to</Text>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>End Time</Text>
              <TextInput
                style={styles.timeInputField}
                value={editingSettings.restrictedHours.end}
                onChangeText={(text) =>
                  handleNestedSettingChange('restrictedHours', 'end', text)
                }
                placeholder="HH:MM"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AlertTriangle size={20} color={Colors.warning} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Allow Emergency Access</Text>
                <Text style={styles.settingDescription}>
                  Allow emergency features during restricted hours
                </Text>
              </View>
            </View>
            <Switch
              value={editingSettings.restrictedHours.allowEmergencyAccess}
              onValueChange={(value) =>
                handleNestedSettingChange(
                  'restrictedHours',
                  'allowEmergencyAccess',
                  value,
                )
              }
              trackColor={{ false: Colors.border, true: Colors.warning + '30' }}
              thumbColor={
                editingSettings.restrictedHours.allowEmergencyAccess
                  ? Colors.warning
                  : Colors.textLight
              }
            />
          </View>
        </>
      )}
    </View>
  )

  const renderEmergencyContacts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <AccessibleButton
          title="Add Contact"
          onPress={() => {
            setEditingContact(null)
            setShowContactModal(true)
          }}
          style={styles.addContactButton}
          textStyle={styles.addContactText}
          leftIcon={<Plus size={16} color={Colors.primary} />}
        />
      </View>

      {editingSettings.emergencyContacts.length === 0 ? (
        <View style={styles.emptyContacts}>
          <Users size={48} color={Colors.textLight} />
          <Text style={styles.emptyContactsText}>
            No emergency contacts added
          </Text>
          <Text style={styles.emptyContactsSubtext}>
            Add trusted contacts who can receive emergency alerts
          </Text>
        </View>
      ) : (
        editingSettings.emergencyContacts
          .sort((a, b) => a.priority - b.priority)
          .map((contact) => (
            <View key={contact.id} style={styles.contactItem}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDetails}>
                  {contact.relationship} • {contact.phone}
                </Text>
                <View style={styles.contactPermissions}>
                  {contact.canReceiveAlerts && (
                    <Text style={styles.contactPermission}>Alerts</Text>
                  )}
                  {contact.canViewLocation && (
                    <Text style={styles.contactPermission}>Location</Text>
                  )}
                </View>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={styles.editContactButton}
                  onPress={() => {
                    setEditingContact(contact)
                    setShowContactModal(true)
                  }}
                >
                  <Edit3 size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteContactButton}
                  onPress={() => {
                    const updatedContacts =
                      editingSettings.emergencyContacts.filter(
                        (c) => c.id !== contact.id,
                      )
                    handleSettingChange('emergencyContacts', updatedContacts)
                  }}
                >
                  <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
      )}
    </View>
  )

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleDiscardChanges}
            style={styles.headerButton}
          >
            <X size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parent Settings</Text>
          <TouchableOpacity
            onPress={handleSaveSettings}
            style={[
              styles.headerButton,
              hasUnsavedChanges && styles.saveButtonActive,
            ]}
            disabled={!hasUnsavedChanges}
          >
            <Save
              size={24}
              color={hasUnsavedChanges ? Colors.primary : Colors.textLight}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderAuthenticationSettings()}
          {renderChildPermissions()}
          {renderSafetySettings()}
          {renderRestrictedHours()}
          {renderEmergencyContacts()}
        </ScrollView>

        {hasUnsavedChanges && (
          <View style={styles.unsavedChangesBar}>
            <Text style={styles.unsavedChangesText}>
              You have unsaved changes
            </Text>
            <AccessibleButton
              title="Save Changes"
              onPress={handleSaveSettings}
              style={styles.saveChangesButton}
              textStyle={styles.saveChangesText}
            />
          </View>
        )}
      </View>
    </Modal>
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButtonActive: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 18,
  },
  authMethodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  authMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  authMethodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  authMethodText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
    textAlign: 'center',
  },
  authMethodTextActive: {
    color: Colors.background,
  },
  pinSetupButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 8,
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  numberInputField: {
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 8,
    textAlign: 'center',
    minWidth: 40,
  },
  numberInputUnit: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  timeInput: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  timeInputField: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    minWidth: 80,
  },
  timeSeparator: {
    fontSize: 16,
    color: Colors.textLight,
  },
  addContactButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addContactText: {
    color: Colors.primary,
    fontSize: 14,
  },
  emptyContacts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContactsText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 16,
  },
  emptyContactsSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  contactDetails: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  contactPermissions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactPermission: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editContactButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
  },
  deleteContactButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.error + '15',
  },
  unsavedChangesBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.warning + '15',
    borderTopWidth: 1,
    borderTopColor: Colors.warning + '30',
  },
  unsavedChangesText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500',
  },
  saveChangesButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveChangesText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
})
