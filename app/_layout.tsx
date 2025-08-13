import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";

import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from '@/constants/theme';
import { useNavigationStore } from '@/stores/navigationStore';

// Basic QueryClient configuration; retry limited to 1 to reduce noisy replays in dev.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // provisional; will revisit once real data layer lands
    },
  },
});

export default function RootLayout() {
  const hydrate = useNavigationStore(s => s.hydrate);
  const isHydrated = useNavigationStore(s => s.isHydrated);
  const highContrast = useNavigationStore(s => s.accessibilitySettings.highContrast);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      hydrate();
    }
  }, [started, hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider highContrast={highContrast}>
        <ErrorBoundary>
          {isHydrated ? (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="search" />
            </Stack>
          ) : null}
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
