// components/SafeZoneSettings.tsx - Safe zone alert configuration
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Settings, Volume2, Bell, Clock, Shield, Save } from 'lucide-react-native';
import Colors from '@/constants/colors';
import AccessibleButton from './AccessibleButton';
import { safeZoneAlertManager, AlertSettings } from '@/utils/safeZoneAlerts';

interface SafeZoneSettingsProps {
  onSettingsUpdate?: (settings: AlertSettings) => void;
}

export default function SafeZoneSettings({ onSettingsUpdate }: SafeZoneSettingsProps) {
  const [settings, setSettings] = useState<AlertSettings>({
    enableVoiceAlerts: true,
    enableVisualAlerts: true,
    enableParentNotifications: true,
    alertCooldownMinutes: 5,
    quietHours: {
      start: "22:00",
      end: "07:00",
      enabled: true
    }
  });

  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("07:00");
  const [cooldownInput, setCooldownInput] = useState("5");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = safeZoneAlertManager.getSettings();
      setSettings(currentSettings);
      setStartTime(currentSettings.quietHours.start);
      setEndTime(currentSettings.quietHours.end);
      setCooldownInput(currentSettings.alertCooldownMinutes.toString());
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = <K extends keyof AlertSettings>(
    key: K,
    value: AlertSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const updateQuietHours = (key: keyof AlertSettings['quietHours'], value: any) => {
    const newSettings = {
      ...settings,
      quietHours: {
        ...settings.quietHours,
        [key]: value
      }
    };
    setSettings(newSettings);
  };

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleSaveSettings = async () => {
    // Validate inputs
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (24-hour)');
      return;
    }

    const cooldown = parseInt(cooldownInput);
    if (isNaN(cooldown) || cooldown < 1 || cooldown > 60) {
      Alert.alert('Invalid Cooldown', 'Cooldown must be between 1 and 60 minutes');
      return;
    }

    try {
      const finalSettings = {
        ...settings,
        alertCooldownMinutes: cooldown,
        quietHours: {
          ...settings.quietHours,
          start: startTime,
          end: endTime
        }
      };

      await safeZoneAlertManager.updateSettings(finalSettings);
      setSettings(finalSettings);
      onSettingsUpdate?.(finalSettings);
      
      Alert.alert('Settings Saved', 'Safe zone alert settings have been updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Safe Zone Alert Settings</Text>
        </View>

        {/* Voice Alerts */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Volume2 size={18} color={Colors.textLight} style={styles.settingIcon} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Voice Alerts</Text>
              <Text style={styles.settingDescription}>
                Speak notifications when entering or leaving safe zones
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enableVoiceAlerts}
            onValueChange={(value) => updateSetting('enableVoiceAlerts', value)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={settings.enableVoiceAlerts ? Colors.primary : Colors.textLight}
          />
        </View>

        {/* Visual Alerts */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={18} color={Colors.textLight} style={styles.settingIcon} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Visual Alerts</Text>
              <Text style={styles.settingDescription}>
                Show popup notifications on screen
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enableVisualAlerts}
            onValueChange={(value) => updateSetting('enableVisualAlerts', value)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={settings.enableVisualAlerts ? Colors.primary : Colors.textLight}
          />
        </View>

        {/* Parent Notifications */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Settings size={18} color={Colors.textLight} style={styles.settingIcon} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Parent Notifications</Text>
              <Text style={styles.settingDescription}>
                Send notifications to parent devices
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enableParentNotifications}
            onValueChange={(value) => updateSetting('enableParentNotifications', value)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={settings.enableParentNotifications ? Colors.primary : Colors.textLight}
          />
        </View>
      </View>

      {/* Alert Cooldown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Frequency</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Alert Cooldown (minutes)</Text>
          <Text style={styles.inputDescription}>
            Minimum time between alerts for the same zone
          </Text>
          <TextInput
            style={styles.textInput}
            value={cooldownInput}
            onChangeText={setCooldownInput}
            keyboardType="numeric"
            placeholder="5"
            maxLength={2}
          />
        </View>
      </View>

      {/* Quiet Hours */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Enable Quiet Hours</Text>
              <Text style={styles.settingDescription}>
                Disable alerts during specified hours
              </Text>
            </View>
          </View>
          <Switch
            value={settings.quietHours.enabled}
            onValueChange={(value) => updateQuietHours('enabled', value)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={settings.quietHours.enabled ? Colors.primary : Colors.textLight}
          />
        </View>

        {settings.quietHours.enabled && (
          <View style={styles.timeInputContainer}>
            <View style={styles.timeInputGroup}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TextInput
                style={styles.timeInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="22:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View style={styles.timeInputGroup}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TextInput
                style={styles.timeInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="07:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
        )}
      </View>

      {/* Statistics */}
      <SafeZoneStatistics />

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <AccessibleButton
          title="Save Settings"
          onPress={handleSaveSettings}
          variant="primary"
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

// Statistics component
function SafeZoneStatistics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    try {
      const statistics = safeZoneAlertManager.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  if (!stats) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's Activity</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.todayEnters}</Text>
          <Text style={styles.statLabel}>Zone Entries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.todayExits}</Text>
          <Text style={styles.statLabel}>Zone Exits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.safetyScore}</Text>
          <Text style={styles.statLabel}>Safety Score</Text>
        </View>
      </View>
      {stats.mostVisitedZone !== 'None' && (
        <Text style={styles.mostVisited}>
          Most visited: {stats.mostVisitedZone}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  inputGroup: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  inputDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  mostVisited: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  saveContainer: {
    padding: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
