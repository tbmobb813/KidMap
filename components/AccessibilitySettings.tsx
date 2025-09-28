import {
  Eye,
  Volume2,
  Zap,
  Settings,
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Shield,
} from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  ScrollView,
  Pressable,
} from "react-native";

import { ACCESSIBILITY_SETTINGS_A11Y } from '@/constants/a11yLabels';
import { useTheme } from "@/constants/theme";
import { useNavigationStore } from "@/stores/navigationStore";
import { track, setTelemetryEnabled, isTelemetryEnabled } from "@/telemetry";

type AccessibilitySettingsProps = {
  onBack?: () => void;
};

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  onBack,
}) => {
  const { accessibilitySettings, updateAccessibilitySettings } =
    useNavigationStore();
  const theme = useTheme();
  const [telemetryEnabled, setTelemetryState] = React.useState(
    isTelemetryEnabled()
  );

  const ThemePickerItem = ({
    icon,
    title,
    description,
    isSelected,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      style={[
        styles.themePickerItem,
        { borderColor: theme.colors.border },
        isSelected && {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={ACCESSIBILITY_SETTINGS_A11Y.themeItem(title, description, isSelected)}
    >
      <View style={styles.themeIcon}>{icon}</View>
      <View style={styles.themeContent}>
        <Text
          style={[
            styles.themeTitle,
            { color: theme.colors.text },
            accessibilitySettings.largeText && styles.largeText,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.themeDescription,
            { color: theme.colors.textSecondary },
            accessibilitySettings.largeText && styles.largeDescription,
          ]}
        >
          {description}
        </Text>
      </View>
      {isSelected && (
        <View
          style={[
            styles.selectedIndicator,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      )}
    </Pressable>
  );

  const SettingItem = ({
    icon,
    title,
    description,
    value,
    onValueChange,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            accessibilitySettings.largeText && styles.largeText,
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.settingDescription,
            accessibilitySettings.largeText && styles.largeDescription,
          ]}
        >
          {description}
        </Text>
      </View>
    <Switch
      accessibilityLabel={ACCESSIBILITY_SETTINGS_A11Y.toggleFor(title)}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.primaryForeground}
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {onBack && (
        <Pressable style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            Back to Settings
          </Text>
        </Pressable>
      )}

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text },
          accessibilitySettings.largeText && styles.largeSectionTitle,
        ]}
      >
        Accessibility Settings
      </Text>

      {/* Theme Selection */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text },
          accessibilitySettings.largeText && styles.largeSectionTitle,
        ]}
      >
        Appearance
      </Text>

      <ThemePickerItem
        icon={<Monitor size={24} color={theme.colors.primary} />}
        title="Auto (System)"
        description="Follow your device's theme setting"
        isSelected={
          accessibilitySettings.preferSystemTheme &&
          !accessibilitySettings.highContrast
        }
        onPress={() => {
          updateAccessibilitySettings({
            preferSystemTheme: true,
            highContrast: false,
          });
          track({ type: "theme_change", theme: "auto" });
        }}
      />

      <ThemePickerItem
        icon={<Sun size={24} color={theme.colors.primary} />}
        title="Light"
        description="Light colors for bright environments"
        isSelected={
          !accessibilitySettings.preferSystemTheme &&
          !accessibilitySettings.darkMode &&
          !accessibilitySettings.highContrast
        }
        onPress={() => {
          updateAccessibilitySettings({
            preferSystemTheme: false,
            darkMode: false,
            highContrast: false,
          });
          track({ type: "theme_change", theme: "light" });
        }}
      />

      <ThemePickerItem
        icon={<Moon size={24} color={theme.colors.primary} />}
        title="Dark"
        description="Dark colors for low-light environments"
        isSelected={
          !accessibilitySettings.preferSystemTheme &&
          accessibilitySettings.darkMode &&
          !accessibilitySettings.highContrast
        }
        onPress={() => {
          updateAccessibilitySettings({
            preferSystemTheme: false,
            darkMode: true,
            highContrast: false,
          });
          track({ type: "theme_change", theme: "dark" });
        }}
      />

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text },
          accessibilitySettings.largeText && styles.largeSectionTitle,
          { marginTop: 24 },
        ]}
      >
        Accessibility Features
      </Text>

      <SettingItem
        icon={<Eye size={24} color={theme.colors.primary} />}
        title="Large Text"
        description="Make text bigger and easier to read"
        value={accessibilitySettings.largeText}
        onValueChange={(value) => {
          updateAccessibilitySettings({ largeText: value });
          track({ type: "accessibility_toggle", setting: "largeText", value });
        }}
      />

      <SettingItem
        icon={<Settings size={24} color={theme.colors.primary} />}
        title="High Contrast"
        description="Use colors that are easier to see"
        value={accessibilitySettings.highContrast}
        onValueChange={(value) => {
          updateAccessibilitySettings({ highContrast: value });
          track({
            type: "accessibility_toggle",
            setting: "highContrast",
            value,
          });
        }}
      />

      <SettingItem
        icon={<Volume2 size={24} color={theme.colors.primary} />}
        title="Voice Descriptions"
        description="Hear descriptions of what's on screen"
        value={accessibilitySettings.voiceDescriptions}
        onValueChange={(value) => {
          updateAccessibilitySettings({ voiceDescriptions: value });
          track({
            type: "accessibility_toggle",
            setting: "voiceDescriptions",
            value,
          });
        }}
      />

      <SettingItem
        icon={<Zap size={24} color={theme.colors.primary} />}
        title="Simplified Mode"
        description="Show only the most important features"
        value={accessibilitySettings.simplifiedMode}
        onValueChange={(value) => {
          updateAccessibilitySettings({ simplifiedMode: value });
          track({
            type: "accessibility_toggle",
            setting: "simplifiedMode",
            value,
          });
        }}
      />

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text },
          accessibilitySettings.largeText && styles.largeSectionTitle,
          { marginTop: 24 },
        ]}
      >
        Privacy & Data
      </Text>

      <SettingItem
        icon={<Shield size={24} color={theme.colors.primary} />}
        title="Usage Analytics"
        description="Help improve the app by sharing anonymous usage data"
        value={telemetryEnabled}
        onValueChange={(value) => {
          setTelemetryEnabled(value);
          setTelemetryState(value);
          track({ type: "accessibility_toggle", setting: "telemetry", value });
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  backText: {
    // color set dynamically via element style override using theme
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  largeDescription: {
    fontSize: 16,
  },
  largeSectionTitle: {
    fontSize: 24,
  },
  largeText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  selectedIndicator: {
    borderRadius: 10,
    height: 20,
    width: 4,
  },
  settingContent: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingIcon: {
    alignItems: "center",
    backgroundColor: "/*TODO theme*/ theme.colors.placeholder /*#F0F4FF*/",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginRight: 16,
    width: 40,
  },
  settingItem: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 12,
    padding: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  themeContent: {
    flex: 1,
  },
  themeDescription: {
    fontSize: 14,
  },
  themeIcon: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginRight: 16,
    width: 40,
  },
  themePickerItem: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    marginBottom: 8,
    padding: 16,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
});

export default AccessibilitySettings;
