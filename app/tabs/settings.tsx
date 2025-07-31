import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Switch,
  ScrollView,
  Pressable,
} from 'react-native'
import Colors from '@/constants/colors'
import {
  Bell,
  Shield,
  MapPin,
  Clock,
  HelpCircle,
  Info,
  ChevronRight,
  Eye,
  Globe,
  Settings,
  RefreshCw,
} from 'lucide-react-native'
import AccessibilitySettings from '@/components/AccessibilitySettings'
import RegionSwitcher from '@/components/RegionSwitcher'
import RegionalTransitCard from '@/components/RegionalTransitCard'
import CityManagement from '@/components/CityManagement'
import { useRegionStore } from '@/stores/regionStore'
import { transitDataUpdater } from '@/utils/transitDataUpdater'

type SettingItemProps = {
  icon: React.ReactNode
  title: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
}

type LinkItemProps = {
  icon: React.ReactNode
  title: string
  onPress: () => void
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [safetyAlertsEnabled, setSafetyAlertsEnabled] = React.useState(true)
  const [locationHistoryEnabled, setLocationHistoryEnabled] =
    React.useState(false)
  const [simplifiedDirections, setSimplifiedDirections] = React.useState(true)
  const [showAccessibility, setShowAccessibility] = React.useState(false)
  const [showCityManagement, setShowCityManagement] = React.useState(false)

  const { currentRegion, userPreferences, updatePreferences } = useRegionStore()

  const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    description,
    value,
    onValueChange,
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  )

  const LinkItem: React.FC<LinkItemProps> = ({ icon, title, onPress }) => (
    <Pressable
      style={({ pressed }) => [
        styles.linkItem,
        pressed && styles.linkItemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <Text style={styles.linkTitle}>{title}</Text>
      <ChevronRight size={20} color={Colors.textLight} />
    </Pressable>
  )

  const handleTransitDataUpdate = async () => {
    try {
      console.log('Starting transit data update for all regions...')
      const results = await transitDataUpdater.updateAllRegions()

      const successCount = results.filter((r) => r.success).length
      const totalCount = results.length

      if (successCount === totalCount) {
        console.log(
          `Successfully updated transit data for all ${totalCount} regions`,
        )
      } else {
        console.log(
          `Updated ${successCount}/${totalCount} regions successfully`,
        )
        results
          .filter((r) => !r.success)
          .forEach((result) => {
            console.error(
              `Failed to update ${result.regionId}: ${result.message}`,
            )
          })
      }
    } catch (error) {
      console.error('Failed to update transit data:', error)
    }
  }

  return (
    <ScrollView style={styles.container}>
      {showAccessibility ? (
        <AccessibilitySettings onBack={() => setShowAccessibility(false)} />
      ) : showCityManagement ? (
        <CityManagement onBack={() => setShowCityManagement(false)} />
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Region & Location</Text>
            <View style={styles.regionContainer}>
              <RegionSwitcher />
            </View>

            <LinkItem
              icon={<Settings size={24} color={Colors.primary} />}
              title="Manage Cities"
              onPress={() => setShowCityManagement(true)}
            />

            <LinkItem
              icon={<RefreshCw size={24} color={Colors.primary} />}
              title="Update Transit Data"
              onPress={handleTransitDataUpdate}
            />
          </View>

          <RegionalTransitCard />

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
            <LinkItem
              icon={<Shield size={24} color={Colors.primary} />}
              title="Parent Dashboard"
              onPress={() => {
                // Use your navigation method here. If using Expo Router, use router.push:
                if (typeof window !== 'undefined' && window.location) {
                  window.location.href = '/parent-dashboard'
                }
              }}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.preferenceItem}>
              <Globe size={24} color={Colors.primary} />
              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>Units</Text>
                <View style={styles.unitsToggle}>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userPreferences.preferredUnits === 'imperial' &&
                        styles.activeUnit,
                    ]}
                    onPress={() =>
                      updatePreferences({ preferredUnits: 'imperial' })
                    }
                  >
                    <Text
                      style={[
                        styles.unitText,
                        userPreferences.preferredUnits === 'imperial' &&
                          styles.activeUnitText,
                      ]}
                    >
                      Imperial
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.unitButton,
                      userPreferences.preferredUnits === 'metric' &&
                        styles.activeUnit,
                    ]}
                    onPress={() =>
                      updatePreferences({ preferredUnits: 'metric' })
                    }
                  >
                    <Text
                      style={[
                        styles.unitText,
                        userPreferences.preferredUnits === 'metric' &&
                          styles.activeUnitText,
                      ]}
                    >
                      Metric
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accessibility</Text>

            <LinkItem
              icon={<Eye size={24} color={Colors.primary} />}
              title="Accessibility Settings"
              onPress={() => setShowAccessibility(true)}
            />
          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>KidMap v1.0.0</Text>
            <Text style={styles.regionText}>
              Configured for {currentRegion.name}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  )
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
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  regionContainer: {
    alignItems: 'flex-start',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  linkItemPressed: {
    opacity: 0.8,
    backgroundColor: '#EAEAEA',
  },
  linkTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  preferenceContent: {
    flex: 1,
    marginLeft: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  unitsToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 8,
    padding: 2,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeUnit: {
    backgroundColor: Colors.primary,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  activeUnitText: {
    color: '#FFFFFF',
  },
  versionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  regionText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
})
