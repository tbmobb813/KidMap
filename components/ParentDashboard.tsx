import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeZoneManager from './SafeZoneManager';
import SafeZoneSettings from './SafeZoneSettings';
import { SafeZoneAlertHistory } from './SafeZoneAlert';
import { safeZoneAlertManager } from '@/utils/safeZoneAlerts';
import { pingDevice, sendLocationUpdate } from '@/utils/pingDevice';

const PIN_KEY = 'parent_pin';

const ParentDashboard: React.FC = () => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'zones' | 'alerts' | 'settings'>('zones');

  const handleChangePin = async () => {
    setLoading(true);
    const storedPin = await AsyncStorage.getItem(PIN_KEY);
    if (currentPin !== storedPin) {
      Alert.alert('Incorrect PIN', 'Current PIN is incorrect.');
      setLoading(false);
      return;
    }
    if (newPin.length < 4) {
      Alert.alert('PIN too short', 'PIN must be at least 4 digits.');
      setLoading(false);
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('PINs do not match', 'Please re-enter your new PIN.');
      setLoading(false);
      return;
    }
    await AsyncStorage.setItem(PIN_KEY, newPin);
    setShowPinModal(false);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setLoading(false);
    Alert.alert('PIN Changed', 'Your parent PIN has been updated.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Parent Dashboard</Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'zones' && styles.activeTab]}
          onPress={() => setActiveTab('zones')}
        >
          <Text style={[styles.tabText, activeTab === 'zones' && styles.activeTabText]}>
            Safe Zones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
            Alerts & History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.tabContent}>
        {activeTab === 'zones' && (
          <>
            <Section title="Safe Zone Management">
              <Text style={styles.sectionText}>Set up geofenced safe zones and manage locations.</Text>
              <SafeZoneManager />
            </Section>

            <Section title="Category Management">
              <Text style={styles.sectionText}>Add, edit, or approve categories for your child.</Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Manage Categories</Text>
              </TouchableOpacity>
            </Section>

            <Section title="Device Ping / Locate">
              <Text style={styles.sectionText}>
                Ping your child's device to ring or request a location update.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  await pingDevice();
                  await sendLocationUpdate();
                }}
              >
                <Text style={styles.buttonText}>Ping Child's Device</Text>
              </TouchableOpacity>
            </Section>
          </>
        )}

        {activeTab === 'alerts' && (
          <>
            <SafeZoneAlertHistory events={safeZoneAlertManager.getRecentEvents()} />
            
            <Section title="Check-Ins">
              <Text style={styles.sectionText}>Request or review your child's check-ins.</Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>View Check-Ins</Text>
              </TouchableOpacity>
            </Section>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <SafeZoneSettings />
            
            <Section title="Parent Mode Lock">
              <Text style={styles.sectionText}>Protect parent mode with PIN or biometrics.</Text>
              <TouchableOpacity style={styles.button} onPress={() => setShowPinModal(true)}>
                <Text style={styles.buttonText}>Change PIN</Text>
              </TouchableOpacity>
            </Section>

            <Section title="Device Settings">
              <Text style={styles.sectionText}>Manage device permissions and settings.</Text>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Device Settings</Text>
              </TouchableOpacity>
            </Section>
          </>
        )}
      </ScrollView>

      <Modal visible={showPinModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Parent PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Current PIN"
              keyboardType="number-pad"
              secureTextEntry
              value={currentPin}
              onChangeText={setCurrentPin}
              maxLength={8}
            />
            <TextInput
              style={styles.input}
              placeholder="New PIN"
              keyboardType="number-pad"
              secureTextEntry
              value={newPin}
              onChangeText={setNewPin}
              maxLength={8}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New PIN"
              keyboardType="number-pad"
              secureTextEntry
              value={confirmPin}
              onChangeText={setConfirmPin}
              maxLength={8}
            />
            <TouchableOpacity style={styles.button} onPress={handleChangePin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Changing...' : 'Change PIN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link} onPress={() => setShowPinModal(false)}>
              <Text style={styles.linkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F8F9FB',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2D3A4B',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3B4A5A',
  },
  sectionText: {
    fontSize: 15,
    color: '#5A6B7B',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4F8EF7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#2D3A4B',
  },
  input: {
    width: 220,
    height: 48,
    borderWidth: 1,
    borderColor: '#D0D6E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  link: {
    marginTop: 8,
  },
  linkText: {
    color: '#4F8EF7',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4F8EF7',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6B7B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default ParentDashboard;
