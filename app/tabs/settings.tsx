import { Bell, Shield, MapPin, Clock, HelpCircle, Info, ChevronRight, Eye, Globe, Settings, RefreshCw, Palette, Lock, Camera } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Switch, ScrollView, Pressable } from "react-native";

import AccessibilitySettings from "@/components/AccessibilitySettings";
import CategoryManagement from "@/components/CategoryManagement";
import CityManagement from "@/components/CityManagement";
import NotificationStatusCard from "@/components/NotificationStatusCard";
import PhotoCheckInHistory from "@/components/PhotoCheckInHistory";
import PinAuthentication from "@/components/PinAuthentication";
import RegionalTransitCard from "@/components/RegionalTransitCard";
import RegionSwitcher from "@/components/RegionSwitcher";
import SystemHealthMonitor from "@/components/SystemHealthMonitor";
import { useTheme } from "@/constants/theme";
import ParentDashboard from "@/modules/safety/components/ParentDashboard";
import { useParentalStore } from "@/modules/safety/stores/parentalStore";
import { useRegionStore } from "@/stores/regionStore";
import { transitDataUpdater } from "@/utils/transitDataUpdater";

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

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  activeUnit: { backgroundColor: theme.colors.primary },
  activeUnitText: { color: theme.colors.primaryForeground },
  backButton: { alignSelf: 'flex-start' },
  backButtonText: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
  backHeader: { borderBottomColor: theme.colors.border, borderBottomWidth: 1, padding: 16 },
  container: { backgroundColor: theme.colors.background, flex: 1 },
  fullScreenContainer: { backgroundColor: theme.colors.background, flex: 1 },
  linkItem: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', marginBottom: 12, padding: 16 },
  linkTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  preferenceContent: { flex: 1, marginLeft: 16 },
  preferenceItem: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', marginBottom: 12, padding: 16 },
  preferenceTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: theme.colors.text },
  regionContainer: { alignItems: 'flex-start' },
  regionText: { fontSize: 12, marginTop: 4, color: theme.colors.textSecondary },
  section: { marginBottom: 16, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  settingContent: { flex: 1 },
  settingDescription: { fontSize: 14 },
  settingIcon: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', marginRight: 16, width: 40 },
  settingItem: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', marginBottom: 12, padding: 16 },
  settingTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  unitButton: { alignItems: 'center', borderRadius: 6, flex: 1, paddingHorizontal: 16, paddingVertical: 8 },
  unitText: { fontSize: 14, fontWeight: '500' },
  unitsToggle: { borderRadius: 8, flexDirection: 'row', padding: 2 },
  versionContainer: { alignItems: 'center', padding: 24 },
  versionText: { fontSize: 14 },
});

export default function SettingsScreen() {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [safetyAlertsEnabled, setSafetyAlertsEnabled] = React.useState(true);
  const [locationHistoryEnabled, setLocationHistoryEnabled] = React.useState(false);
  const [simplifiedDirections, setSimplifiedDirections] = React.useState(true);
  const [showAccessibility, setShowAccessibility] = React.useState(false);
  const [showCityManagement, setShowCityManagement] = React.useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = React.useState(false);
  const [showPhotoHistory, setShowPhotoHistory] = React.useState(false);
  const [userMode, setUserMode] = React.useState<'parent' | 'child'>('child');
  const [showPinAuth, setShowPinAuth] = React.useState(false);
  const [showParentDashboard, setShowParentDashboard] = React.useState(false);
  
  const { currentRegion, userPreferences, updatePreferences } = useRegionStore();
  const { isParentMode, exitParentMode } = useParentalStore();

  const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, value, onValueChange }) => (
    <View style={[styles.settingItem,{ backgroundColor: theme.colors.surface }] }>
      <View style={[styles.settingIcon,{ backgroundColor: theme.colors.surfaceAlt }] }>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle,{ color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription,{ color: theme.colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.primaryForeground}
      />
    </View>
  );

  const LinkItem: React.FC<LinkItemProps> = ({ icon, title, onPress }) => (
    <Pressable
      style={({ pressed }) => [
        styles.linkItem,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.8, backgroundColor: theme.colors.surfaceAlt }
      ]}
      onPress={onPress}
    >
      <View style={[styles.settingIcon,{ backgroundColor: theme.colors.surfaceAlt }]}>{icon}</View>
      <Text style={[styles.linkTitle,{ color: theme.colors.text }]}>{title}</Text>
      <ChevronRight size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );

  const handleTransitDataUpdate = async () => {
    try {
      console.log('Starting transit data update for all regions...');
      const results = await transitDataUpdater.updateAllRegions();
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        console.log(`Successfully updated transit data for all ${totalCount} regions`);
      } else {
        console.log(`Updated ${successCount}/${totalCount} regions successfully`);
        results.filter(r => !r.success).forEach(result => {
          console.error(`Failed to update ${result.regionId}: ${result.message}`);
        });
      }
    } catch (error) {
      console.error('Failed to update transit data:', error);
    }
  };

  const handleParentModeToggle = () => {
    if (isParentMode) {
      exitParentMode();
      setShowParentDashboard(false);
    } else {
      setShowPinAuth(true);
    }
  };

  const handlePinAuthenticated = async () => {
    setShowPinAuth(false);
    setShowParentDashboard(true);
  };

  const handleExitParentDashboard = () => {
    setShowParentDashboard(false);
    exitParentMode();
  };

  return (
  <ScrollView style={[styles.container,{ backgroundColor: theme.colors.background }] }>
      {showPinAuth ? (
        <PinAuthentication
          onAuthenticated={handlePinAuthenticated}
          onCancel={() => setShowPinAuth(false)}
        />
      ) : showParentDashboard ? (
        <ParentDashboard onExit={handleExitParentDashboard} />
      ) : showAccessibility ? (
        <AccessibilitySettings onBack={() => setShowAccessibility(false)} />
      ) : showCityManagement ? (
        <CityManagement onBack={() => setShowCityManagement(false)} />
      ) : showCategoryManagement ? (
        <CategoryManagement onBack={() => setShowCategoryManagement(false)} userMode={userMode} />
      ) : showPhotoHistory ? (
        <View style={styles.fullScreenContainer}>
          <View style={styles.backHeader}>
            <Pressable 
              style={styles.backButton}
              onPress={() => setShowPhotoHistory(false)}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          </View>
          <PhotoCheckInHistory />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Region & Location</Text>
            <View style={styles.regionContainer}>
              <RegionSwitcher />
            </View>
            
            <LinkItem
              icon={<Settings size={24} color={theme.colors.primary} />}
              title="Manage Cities"
              onPress={() => setShowCityManagement(true)}
            />
            
            <LinkItem
              icon={<RefreshCw size={24} color={theme.colors.primary} />}
              title="Update Transit Data"
              onPress={handleTransitDataUpdate}
            />
          </View>

          <RegionalTransitCard />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Parental Controls</Text>
            
            <LinkItem
              icon={<Lock size={24} color={theme.colors.primary} />}
              title={isParentMode ? "Exit Parent Mode" : "Parent Dashboard"}
              onPress={handleParentModeToggle}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>User Mode</Text>
            <View style={styles.preferenceItem}>
              <Settings size={24} color={theme.colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Current Mode</Text>
                <View style={styles.unitsToggle}>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userMode === "child" && styles.activeUnit
                    ]}
                    onPress={() => setUserMode("child")}
                  >
                    <Text style={[
                      styles.unitText,
                      userMode === "child" && styles.activeUnitText
                    ]}>
                      Child
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userMode === "parent" && styles.activeUnit
                    ]}
                    onPress={() => setUserMode("parent")}
                  >
                    <Text style={[
                      styles.unitText,
                      userMode === "parent" && styles.activeUnitText
                    ]}>
                      Parent
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Categories</Text>
            
            <LinkItem
              icon={<Palette size={24} color={theme.colors.primary} />}
              title="Manage Categories"
              onPress={() => setShowCategoryManagement(true)}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Safety & Check-ins</Text>
            
            <LinkItem
              icon={<Camera size={24} color={theme.colors.primary} />}
              title="Photo Check-in History"
              onPress={() => setShowPhotoHistory(true)}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>App Settings</Text>
            
            <NotificationStatusCard testId="notification-status" />
            
            <SettingItem
              icon={<Bell size={24} color={theme.colors.primary} />}
              title="Notifications"
              description="Get alerts about transit delays and updates"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            
            <SettingItem
              icon={<Shield size={24} color={theme.colors.primary} />}
              title="Safety Alerts"
              description="Receive important safety information"
              value={safetyAlertsEnabled}
              onValueChange={setSafetyAlertsEnabled}
            />
            
            <SettingItem
              icon={<MapPin size={24} color={theme.colors.primary} />}
              title="Save Location History"
              description="Store places you've visited"
              value={locationHistoryEnabled}
              onValueChange={setLocationHistoryEnabled}
            />
            
            <SettingItem
              icon={<Clock size={24} color={theme.colors.primary} />}
              title="Simplified Directions"
              description="Show easier-to-follow directions"
              value={simplifiedDirections}
              onValueChange={setSimplifiedDirections}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Regional Preferences</Text>
            
            <View style={styles.preferenceItem}>
              <Globe size={24} color={theme.colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Units</Text>
                <View style={styles.unitsToggle}>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userPreferences.preferredUnits === "imperial" && styles.activeUnit
                    ]}
                    onPress={() => updatePreferences({ preferredUnits: "imperial" })}
                  >
                    <Text style={[
                      styles.unitText,
                      userPreferences.preferredUnits === "imperial" && styles.activeUnitText
                    ]}>
                      Imperial
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userPreferences.preferredUnits === "metric" && styles.activeUnit
                    ]}
                    onPress={() => updatePreferences({ preferredUnits: "metric" })}
                  >
                    <Text style={[
                      styles.unitText,
                      userPreferences.preferredUnits === "metric" && styles.activeUnitText
                    ]}>
                      Metric
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>System Status</Text>
            <SystemHealthMonitor testId="system-health" />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Help & Information</Text>
            
            <LinkItem
              icon={<HelpCircle size={24} color={theme.colors.primary} />}
              title="Help Center"
              onPress={() => {}}
            />
            
            <LinkItem
              icon={<Info size={24} color={theme.colors.primary} />}
              title="About KidMap"
              onPress={() => {}}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle,{ color: theme.colors.text }]}>Accessibility</Text>
            
            <LinkItem
              icon={<Eye size={24} color={theme.colors.primary} />}
              title="Accessibility Settings"
              onPress={() => setShowAccessibility(true)}
            />
          </View>

          <View style={styles.versionContainer}>
            <Text style={[styles.versionText,{ color: theme.colors.textSecondary }]}>KidMap v1.0.0</Text>
            <Text style={[styles.regionText,{ color: theme.colors.textSecondary }]}>Configured for {currentRegion.name}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

