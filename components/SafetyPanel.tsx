import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, Linking, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { Shield, Phone, MessageCircle, MapPin, AlertTriangle } from 'lucide-react-native';
import { useGamificationStore } from '@/stores/gamificationStore';

type SafetyPanelProps = {
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
};

const SafetyPanel: React.FC<SafetyPanelProps> = ({ currentLocation }) => {
  const { safetyContacts } = useGamificationStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEmergencyCall = () => {
    Alert.alert('Emergency Call', 'Do you need to call for help?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 911', onPress: () => Linking.openURL('tel:911') },
      {
        text: 'Call Parent',
        onPress: () => {
          const primaryContact = safetyContacts.find((c) => c.isPrimary);
          if (primaryContact) {
            Linking.openURL(`tel:${primaryContact.phone}`);
          }
        },
      },
    ]);
  };

  const handleShareLocation = () => {
    if (!currentLocation) return;

    const message = `I'm at: https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;
    const primaryContact = safetyContacts.find((c) => c.isPrimary);

    if (primaryContact && Platform.OS !== 'web') {
      Linking.openURL(`sms:${primaryContact.phone}&body=${encodeURIComponent(message)}`);
    }
  };

  const handleSafeArrival = () => {
    Alert.alert('Safe Arrival', 'Let your family know you arrived safely?', [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Send message',
        onPress: () => {
          const primaryContact = safetyContacts.find((c) => c.isPrimary);
          if (primaryContact && Platform.OS !== 'web') {
            Linking.openURL(`sms:${primaryContact.phone}&body=I arrived safely! 😊`);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setIsExpanded(!isExpanded)}>
        <Shield size={20} color={Colors.primary} />
        <Text style={styles.title}>Safety Tools</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
      </Pressable>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.buttonRow}>
            <Pressable style={styles.safetyButton} onPress={handleEmergencyCall}>
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Emergency</Text>
            </Pressable>

            <Pressable style={styles.safetyButton} onPress={handleShareLocation}>
              <MapPin size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Share Location</Text>
            </Pressable>

            <Pressable style={styles.safetyButton} onPress={handleSafeArrival}>
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>I'm Safe</Text>
            </Pressable>
          </View>

          <View style={styles.tipContainer}>
            <AlertTriangle size={16} color={Colors.warning} />
            <Text style={styles.tipText}>Always stay with a trusted adult when traveling</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  safetyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
  },
});

export default SafetyPanel;
