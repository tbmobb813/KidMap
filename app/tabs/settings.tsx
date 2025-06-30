import React from "react";
import { StyleSheet, Text, View, Switch, ScrollView, Pressable } from "react-native";
import Colors from "@/constants/colors";
import { Bell, Shield, MapPin, Clock, HelpCircle, Info, ChevronRight } from "lucide-react-native";

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

type LinkItemProps = {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
};

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [safetyAlertsEnabled, setSafetyAlertsEnabled] = React.useState(true);
  const [locationHistoryEnabled, setLocationHistoryEnabled] = React.useState(false);
  const [simplifiedDirections, setSimplifiedDirections] = React.useState(true);

  const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E0E0E0", true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const LinkItem: React.FC<LinkItemProps> = ({ icon, title, onPress }) => (
    <Pressable 
      style={({ pressed }) => [
        styles.linkItem,
        pressed && styles.linkItemPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <Text style={styles.linkTitle}>{title}</Text>
      <ChevronRight size={20} color={Colors.textLight} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <SettingItem
          icon={<Bell size={24} color={Colors.primary} />}
          title="Notifications"
          description="Get alerts about transit delays and updates"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        
        <SettingItem
          icon={<Shield size={24} color={Colors.primary} />}
          title="Safety Alerts"
          description="Receive important safety information"
          value={safetyAlertsEnabled}
          onValueChange={setSafetyAlertsEnabled}
        />
        
        <SettingItem
          icon={<MapPin size={24} color={Colors.primary} />}
          title="Save Location History"
          description="Store places you've visited"
          value={locationHistoryEnabled}
          onValueChange={setLocationHistoryEnabled}
        />
        
        <SettingItem
          icon={<Clock size={24} color={Colors.primary} />}
          title="Simplified Directions"
          description="Show easier-to-follow directions"
          value={simplifiedDirections}
          onValueChange={setSimplifiedDirections}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Information</Text>
        
        <LinkItem
          icon={<HelpCircle size={24} color={Colors.primary} />}
          title="Help Center"
          onPress={() => {}}
        />
        
        <LinkItem
          icon={<Info size={24} color={Colors.primary} />}
          title="About KidMap"
          onPress={() => {}}
        />
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>KidMap v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  linkItemPressed: {
    opacity: 0.8,
    backgroundColor: "#EAEAEA",
  },
  linkTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  versionContainer: {
    alignItems: "center",
    padding: 24,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
