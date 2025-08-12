import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
