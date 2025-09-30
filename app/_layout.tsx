import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";

import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/constants/theme";
import { ToastProvider } from "@/providers/ToastProvider";
import { asyncStoragePersister } from "@/services/cachePersister";
import { useNavigationStore } from "@/stores/navigationStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // Cache routes for 24 hours when offline
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

export default function RootLayout() {
  const hydrate = useNavigationStore((s) => s.hydrate);
  const highContrast = useNavigationStore(
    (s) => s.accessibilitySettings.highContrast
  );
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      hydrate();
    }
  }, [started, hydrate]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        // Cache persists for 24 hours
        maxAge: 1000 * 60 * 60 * 24,
      }}
    >
      <ThemeProvider highContrast={highContrast}>
        <ToastProvider>
          <ErrorBoundary>
            <Slot />
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
