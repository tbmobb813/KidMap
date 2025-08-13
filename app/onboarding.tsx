import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import OnboardingFlow from "@/components/OnboardingFlow";
import Colors from "@/constants/colors";
import { nav } from "@/shared/navigation/nav";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleOnboardingComplete = () => {
  nav.replaceTabs();
  };

  return (
    <View style={styles.container}>
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
});
