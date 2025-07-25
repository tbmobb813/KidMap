import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SafeZoneManager from './SafeZoneManager';
import { pingDevice, sendLocationUpdate } from '@/utils/pingDevice';

const ParentDashboard: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Parent Dashboard</Text>

      <Section title="Category Management">
        <Text style={styles.sectionText}>Add, edit, or approve categories for your child.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Manage Categories</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Safe Zones">
        <Text style={styles.sectionText}>Set up geofenced safe zones and receive alerts.</Text>
        <SafeZoneManager />
      </Section>

      <Section title="Check-Ins">
        <Text style={styles.sectionText}>Request or review your child's check-ins.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Check-Ins</Text>
        </TouchableOpacity>
      </Section>


      <Section title="Device Ping / Locate">
        <Text style={styles.sectionText}>Ping your child's device to ring or request a location update.</Text>
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

      <Section title="Device Settings">
        <Text style={styles.sectionText}>Manage device permissions and settings.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Device Settings</Text>
        </TouchableOpacity>
      </Section>

      <Section title="Parent Mode Lock">
        <Text style={styles.sectionText}>Protect parent mode with PIN or biometrics.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Set Up Lock</Text>
        </TouchableOpacity>
      </Section>
    </ScrollView>
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ParentDashboard;
