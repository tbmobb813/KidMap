import { MapPin, Settings, Shield, CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";

import RegionSelector from "./RegionSelector";

import { useTheme } from "@/constants/theme";
import { useRegionStore } from "@/stores/regionStore";

type OnboardingStep = "welcome" | "region" | "preferences" | "safety" | "complete";

type OnboardingFlowProps = {
  onComplete: () => void;
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const theme = useTheme();

  // Assuming your store exposes these (adjust names if your store differs)
  const {
    availableRegions,
    userPreferences,
    setRegion,
    updatePreferences,
    completeOnboarding,
  } = useRegionStore();

  const handlePreferencesComplete = () => {
    setCurrentStep("safety");
  };

  const handleSafetyComplete = () => {
    setCurrentStep("complete");
  };

  const handleComplete = () => {
    completeOnboarding();
    onComplete();
  };

  const renderWelcome = () => (
    <View style={[styles.stepContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.iconContainer}>
        <MapPin size={48} color={theme.colors.primary} />
      </View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Welcome to KidMap</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        KidMap helps kids navigate public transportation safely and confidently. Let&apos;s set up
        your app for your city and preferences.
      </Text>
      <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setCurrentStep("region")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );

  const renderRegionSelection = () => (
    <View style={[styles.stepContainer, { backgroundColor: theme.colors.background }]}>
      <RegionSelector
        regions={availableRegions}
        selectedRegion={userPreferences?.selectedRegion}
        onSelectRegion={(regionId: string) => setRegion(regionId)}
      />
    </View>
  );

  const renderPreferences = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContentContainer}
    >
      <View style={styles.iconContainer}>
        <Settings size={48} color={theme.colors.primary} />
      </View>

      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Customize Your Experience</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Set your preferences to make KidMap work best for you.
      </Text>

      {/* Units */}
      <View style={styles.preferenceSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Units</Text>
        <View style={styles.optionRow}>
          <Pressable
            style={[
              styles.optionButton,
              { backgroundColor: theme.colors.surface },
              userPreferences?.preferredUnits === "imperial" && [
                styles.selectedOption,
                { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + "22" },
              ],
            ]}
            onPress={() => updatePreferences({ preferredUnits: "imperial" })}
          >
            <Text
              style={[
                styles.optionText,
                { color: theme.colors.text },
                userPreferences?.preferredUnits === "imperial" && { color: theme.colors.primary, fontWeight: "600" },
              ]}
            >
              Imperial (miles, °F)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              { backgroundColor: theme.colors.surface },
              userPreferences?.preferredUnits === "metric" && [
                styles.selectedOption,
                { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + "22" },
              ],
            ]}
            onPress={() => updatePreferences({ preferredUnits: "metric" })}
          >
            <Text
              style={[
                styles.optionText,
                { color: theme.colors.text },
                userPreferences?.preferredUnits === "metric" && { color: theme.colors.primary, fontWeight: "600" },
              ]}
            >
              Metric (km, °C)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Accessibility */}
      <View style={styles.preferenceSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Accessibility</Text>
        <Pressable
          style={[
            styles.toggleOption,
            { backgroundColor: theme.colors.surface },
            userPreferences?.accessibilityMode && [
              styles.selectedToggle,
              { borderColor: theme.colors.success, backgroundColor: theme.colors.success + "22" },
            ],
          ]}
          onPress={() => updatePreferences({ accessibilityMode: !userPreferences?.accessibilityMode })}
        >
          <Text style={[styles.toggleText, { color: theme.colors.text }]}>Enable accessibility features</Text>
          {userPreferences?.accessibilityMode && <CheckCircle size={20} color={theme.colors.success} />}
        </Pressable>
      </View>

      <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={handlePreferencesComplete}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );

  const renderSafety = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContentContainer}
    >
      <View style={styles.iconContainer}>
        <Shield size={48} color={theme.colors.primary} />
      </View>

      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Safety First</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        KidMap includes safety features to help you travel confidently.
      </Text>

      <View style={styles.safetyFeatures}>
        <View style={styles.featureItem}>
          <Shield size={24} color={theme.colors.success} />
          <Text style={[styles.featureText, { color: theme.colors.text }]}>Emergency contact buttons</Text>
        </View>
        <View style={styles.featureItem}>
          <MapPin size={24} color={theme.colors.success} />
          <Text style={[styles.featureText, { color: theme.colors.text }]}>Location sharing with parents</Text>
        </View>
        <View style={styles.featureItem}>
          <CheckCircle size={24} color={theme.colors.success} />
          <Text style={[styles.featureText, { color: theme.colors.text }]}>Safe arrival notifications</Text>
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Pressable
          style={[
            styles.toggleOption,
            { backgroundColor: theme.colors.surface },
            userPreferences?.parentalControls && [
              styles.selectedToggle,
              { borderColor: theme.colors.success, backgroundColor: theme.colors.success + "22" },
            ],
          ]}
          onPress={() => updatePreferences({ parentalControls: !userPreferences?.parentalControls })}
        >
          <Text style={[styles.toggleText, { color: theme.colors.text }]}>Enable parental controls</Text>
          {userPreferences?.parentalControls && <CheckCircle size={20} color={theme.colors.success} />}
        </Pressable>
      </View>

      <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={handleSafetyComplete}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );

  const renderComplete = () => (
    <View style={[styles.stepContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.iconContainer}>
        <CheckCircle size={48} color={theme.colors.success} />
      </View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>You&apos;re All Set!</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        KidMap is now configured for your region and preferences. Start exploring your city safely!
      </Text>
      <Pressable style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={handleComplete}>
        <Text style={styles.buttonText}>Start Using KidMap</Text>
      </Pressable>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return renderWelcome();
      case "region":
        return renderRegionSelection();
      case "preferences":
        return renderPreferences();
      case "safety":
        return renderSafety();
      case "complete":
        return renderComplete();
      default:
        return null;
    }
  };

  return <View style={[styles.container, { backgroundColor: theme.colors.background }]}>{renderCurrentStep()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 12,
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  preferenceSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    padding: 16,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedOption: {
    backgroundColor: "#F0F4FF",
  },
  safetyFeatures: {
    marginBottom: 24,
  },
  featureItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggleOption: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedToggle: {
    backgroundColor: "#F0FFF4",
  },
});

export default OnboardingFlow;
