// components/EmergencyContactModal.tsx - Emergency contact management
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Bell,
  Eye,
  Save,
  X,
  Star,
  Users,
  Plus,
  Edit3,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import AccessibleButton from './AccessibleButton';
import { EmergencyContact } from '../stores/parentalControlStore';

interface EmergencyContactModalProps {
  visible: boolean;
  contact: EmergencyContact | null;
  onSave: (contact: EmergencyContact) => void;
  onClose: () => void;
}

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Grandparent',
  'Sibling',
  'Guardian',
  'Family Friend',
  'Neighbor',
  'Teacher',
  'Coach',
  'Other'
];

export default function EmergencyContactModal({
  visible,
  contact,
  onSave,
  onClose,
}: EmergencyContactModalProps) {
  const isEditing = contact !== null;
  
  const [formData, setFormData] = useState<Partial<EmergencyContact>>({
    id: contact?.id || Date.now().toString(),
    name: contact?.name || '',
    phone: contact?.phone || '',
    email: contact?.email || '',
    relationship: contact?.relationship || 'Parent',
    priority: contact?.priority || 1,
    canReceiveAlerts: contact?.canReceiveAlerts ?? true,
    canViewLocation: contact?.canViewLocation ?? false,
    address: contact?.address || '',
    notes: contact?.notes || '',
  });

  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!formData.name?.trim()) {
      errors.push('Name is required');
    }
    
    if (!formData.phone?.trim()) {
      errors.push('Phone number is required');
    } else if (!/^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]*){10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  const handleSave = useCallback(() => {
    if (!validateForm()) {
      Alert.alert('Validation Error', validationErrors.join('\n'));
      return;
    }

    const contactToSave: EmergencyContact = {
      id: formData.id!,
      name: formData.name!.trim(),
      phone: formData.phone!.trim(),
      email: formData.email?.trim() || '',
      relationship: formData.relationship!,
      priority: formData.priority!,
      canReceiveAlerts: formData.canReceiveAlerts!,
      canViewLocation: formData.canViewLocation!,
      address: formData.address?.trim() || '',
      notes: formData.notes?.trim() || '',
    };

    onSave(contactToSave);
    onClose();
  }, [formData, validateForm, validationErrors, onSave, onClose]);

  const handleClose = useCallback(() => {
    // Check if form has been modified
    const hasChanges = JSON.stringify(formData) !== JSON.stringify({
      id: contact?.id || Date.now().toString(),
      name: contact?.name || '',
      phone: contact?.phone || '',
      email: contact?.email || '',
      relationship: contact?.relationship || 'Parent',
      priority: contact?.priority || 1,
      canReceiveAlerts: contact?.canReceiveAlerts ?? true,
      canViewLocation: contact?.canViewLocation ?? false,
      address: contact?.address || '',
      notes: contact?.notes || '',
    });

    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close without saving?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: onClose,
          },
        ]
      );
    } else {
      onClose();
    }
  }, [formData, contact, onClose]);

  const updateFormData = useCallback((key: keyof EmergencyContact, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setValidationErrors([]);
  }, []);

  const renderRelationshipPicker = () => (
    <Modal
      visible={showRelationshipPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRelationshipPicker(false)}
    >
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Relationship</Text>
            <TouchableOpacity
              onPress={() => setShowRelationshipPicker(false)}
              style={styles.pickerCloseButton}
            >
              <X size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerContent} showsVerticalScrollIndicator={false}>
            {RELATIONSHIP_OPTIONS.map(relationship => (
              <TouchableOpacity
                key={relationship}
                style={[
                  styles.pickerOption,
                  formData.relationship === relationship && styles.pickerOptionSelected
                ]}
                onPress={() => {
                  updateFormData('relationship', relationship);
                  setShowRelationshipPicker(false);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.relationship === relationship && styles.pickerOptionTextSelected
                ]}>
                  {relationship}
                </Text>
                {formData.relationship === relationship && (
                  <View style={styles.pickerCheckmark}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <X size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Contact' : 'Add Emergency Contact'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Save size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                  placeholder="Enter full name"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  placeholder="Enter phone number"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.textInput}
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  placeholder="Enter email address"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship *</Text>
              <TouchableOpacity
                style={styles.relationshipSelector}
                onPress={() => setShowRelationshipPicker(true)}
              >
                <Users size={20} color={Colors.textLight} />
                <Text style={styles.relationshipText}>{formData.relationship}</Text>
                <View style={styles.relationshipArrow}>
                  <Text style={styles.arrowText}>▼</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Priority */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            <Text style={styles.sectionDescription}>
              Higher priority contacts will be contacted first in emergencies
            </Text>
            
            <View style={styles.prioritySelector}>
              {[1, 2, 3, 4, 5].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority && styles.priorityButtonActive
                  ]}
                  onPress={() => updateFormData('priority', priority)}
                >
                  <Star
                    size={16}
                    color={formData.priority === priority ? Colors.background : Colors.textLight}
                    fill={formData.priority === priority ? Colors.background : 'transparent'}
                  />
                  <Text style={[
                    styles.priorityText,
                    formData.priority === priority && styles.priorityTextActive
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Permissions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permissions</Text>
            
            <View style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Bell size={20} color={Colors.primary} />
                <View style={styles.permissionText}>
                  <Text style={styles.permissionLabel}>Receive Emergency Alerts</Text>
                  <Text style={styles.permissionDescription}>
                    Get notified when your child needs help or is in danger
                  </Text>
                </View>
              </View>
              <Switch
                value={formData.canReceiveAlerts}
                onValueChange={(value) => updateFormData('canReceiveAlerts', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
                thumbColor={formData.canReceiveAlerts ? Colors.primary : Colors.textLight}
              />
            </View>

            <View style={styles.permissionItem}>
              <View style={styles.permissionInfo}>
                <Eye size={20} color={Colors.primary} />
                <View style={styles.permissionText}>
                  <Text style={styles.permissionLabel}>View Child's Location</Text>
                  <Text style={styles.permissionDescription}>
                    Access real-time location information during emergencies
                  </Text>
                </View>
              </View>
              <Switch
                value={formData.canViewLocation}
                onValueChange={(value) => updateFormData('canViewLocation', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '30' }}
                thumbColor={formData.canViewLocation ? Colors.primary : Colors.textLight}
              />
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.textInput}
                  value={formData.address}
                  onChangeText={(text) => updateFormData('address', text)}
                  placeholder="Enter address (optional)"
                  placeholderTextColor={Colors.textLight}
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  value={formData.notes}
                  onChangeText={(text) => updateFormData('notes', text)}
                  placeholder="Add any additional notes or special instructions..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Please fix the following errors:</Text>
              {validationErrors.map((error, index) => (
                <Text key={index} style={styles.errorText}>• {error}</Text>
              ))}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {renderRelationshipPicker()}
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  relationshipSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relationshipText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  relationshipArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  priorityButton: {
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
    gap: 4,
  },
  priorityButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priorityText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  priorityTextActive: {
    color: Colors.background,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionText: {
    marginLeft: 12,
    flex: 1,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 18,
  },
  textAreaContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: Colors.error + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 40,
  },
  // Picker styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pickerContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    maxHeight: '70%',
    width: '100%',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  pickerCloseButton: {
    padding: 4,
  },
  pickerContent: {
    maxHeight: 300,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary + '15',
  },
  pickerOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  pickerCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
