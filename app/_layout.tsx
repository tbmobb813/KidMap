import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Stack } from "expo-router";
import { View, Text } from "react-native";

export default function RootLayout() {
  console.log('RootLayout is rendering');
  
  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="search" />
      </Stack>
    </ErrorBoundary>
  );
}
