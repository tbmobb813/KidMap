
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";

import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from '@/constants/theme';
import { useNavigationStore } from '@/stores/navigationStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const hydrate = useNavigationStore(s => s.hydrate);
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
          <Slot />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
