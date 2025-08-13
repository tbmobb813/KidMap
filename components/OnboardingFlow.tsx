import { MapPin, Settings, Shield, CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";

import RegionSelector from "./RegionSelector";

import Colors from "@/constants/colors"; // legacy
import { useTheme } from '@/constants/theme';
import { useRegionStore } from "@/stores/regionStore";

type OnboardingStep = "welcome" | "region" | "preferences" | "safety" | "complete";

type OnboardingFlowProps = {
  onComplete: () => void;
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const theme = useTheme();
  const {
    availableRegions,
    userPreferences,
    setRegion,
    updatePreferences,
    completeOnboarding,
  } = useRegionStore();

  const handleRegionSelect = (regionId: string) => {
    setRegion(regionId);
    setCurrentStep("preferences");
  };

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
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
  <MapPin size={48} color={theme.colors.primary} />
      </View>
  <Text style={[styles.stepTitle,{ color: theme.colors.text }]}>Welcome to KidMap!</Text>
      <Text style={styles.stepDescription}>
        KidMap helps kids navigate public transportation safely and confidently. 
        Let&apos;s set up your app for your city and preferences.
      </Text>
      <Pressable style={styles.primaryButton} onPress={() => setCurrentStep("region")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );

  const renderRegionSelection = () => (
    <RegionSelector
      regions={availableRegions}
      selectedRegion={userPreferences.selectedRegion}
      onSelectRegion={handleRegionSelect}
    />
  );

  const renderPreferences = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.iconContainer}>
  <Settings size={48} color={theme.colors.primary} />
      </View>
  <Text style={[styles.stepTitle,{ color: theme.colors.text }]}>Customize Your Experience</Text>
      <Text style={styles.stepDescription}>
        Set your preferences to make KidMap work best for you.
      </Text>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Units</Text>
        <View style={styles.optionRow}>
          <Pressable
            style={[
              styles.optionButton,
              userPreferences.preferredUnits === "imperial" && styles.selectedOption
            ]}
            onPress={() => updatePreferences({ preferredUnits: "imperial" })}
          >
            <Text style={[
              styles.optionText,
              userPreferences.preferredUnits === "imperial" && styles.selectedOptionText
            ]}>
              Imperial (miles, °F)
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              userPreferences.preferredUnits === "metric" && styles.selectedOption
            ]}
            onPress={() => updatePreferences({ preferredUnits: "metric" })}
          >
            <Text style={[
              styles.optionText,
              userPreferences.preferredUnits === "metric" && styles.selectedOptionText
            ]}>
              Metric (km, °C)
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <Pressable
          style={[
            styles.toggleOption,
            userPreferences.accessibilityMode && styles.selectedToggle
          ]}
          onPress={() => updatePreferences({ 
            accessibilityMode: !userPreferences.accessibilityMode 
          })}
        >
          <Text style={styles.toggleText}>Enable accessibility features</Text>
          {userPreferences.accessibilityMode && (
            <CheckCircle size={20} color={theme.colors.success} />
          )}
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={handlePreferencesComplete}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );

  const renderSafety = () => (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.iconContainer}>
  <Shield size={48} color={theme.colors.primary} />
      </View>
      <Text style={styles.stepTitle}>Safety First</Text>
      <Text style={styles.stepDescription}>
        KidMap includes safety features to help you travel confidently.
      </Text>

      <View style={styles.safetyFeatures}>
        <View style={styles.featureItem}>
          <Shield size={24} color={theme.colors.success} />
          <Text style={styles.featureText}>Emergency contact buttons</Text>
        </View>
        <View style={styles.featureItem}>
          <MapPin size={24} color={theme.colors.success} />
          <Text style={styles.featureText}>Location sharing with parents</Text>
        </View>
        <View style={styles.featureItem}>
          <CheckCircle size={24} color={theme.colors.success} />
          <Text style={styles.featureText}>Safe arrival notifications</Text>
        </View>
      </View>

      <View style={styles.preferenceSection}>
        <Pressable
          style={[
            styles.toggleOption,
            userPreferences.parentalControls && styles.selectedToggle
          ]}
          onPress={() => updatePreferences({ 
            parentalControls: !userPreferences.parentalControls 
          })}
        >
          <Text style={styles.toggleText}>Enable parental controls</Text>
          {userPreferences.parentalControls && (
            <CheckCircle size={20} color={theme.colors.success} />
          )}
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={handleSafetyComplete}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
  <CheckCircle size={48} color={theme.colors.success} />
      </View>
  <Text style={[styles.stepTitle,{ color: theme.colors.text }]}>You&apos;re All Set!</Text>
      <Text style={styles.stepDescription}>
        KidMap is now configured for your region and preferences. 
        Start exploring your city safely!
      </Text>
      <Pressable style={styles.primaryButton} onPress={handleComplete}>
        <Text style={styles.buttonText}>Start Using KidMap</Text>
      </Pressable>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome": return renderWelcome();
      case "region": return renderRegionSelection();
      case "preferences": return renderPreferences();
      case "safety": return renderSafety();
      case "complete": return renderComplete();
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: "/*TODO theme*/ theme.colors.placeholder /*#FFFFFF*/",
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  featureItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  featureText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  optionButton: {
    alignItems: "center",
    backgroundColor: Colors.card, // TODO: replace with theme.colors.surface
    borderColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    padding: 16,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  preferenceSection: {
    marginBottom: 24,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  safetyFeatures: {
    marginBottom: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  selectedOption: {
    backgroundColor: "/*TODO theme*/ theme.colors.placeholder /*#F0F4FF*/",
    borderColor: Colors.primary,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  selectedToggle: {
    backgroundColor: "/*TODO theme*/ theme.colors.placeholder /*#F0FFF4*/",
    borderColor: Colors.success,
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  stepDescription: {
    color: Colors.textLight, // TODO: replace with theme.colors.textSecondary
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: "center",
  },
  stepTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  toggleOption: {
    alignItems: "center",
    backgroundColor: Colors.card, // TODO: replace with theme.colors.surface
    borderColor: "transparent",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  toggleText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default OnboardingFlow;
