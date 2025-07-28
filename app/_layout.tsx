/**
 * Root layout for the KidMap app. Handles font loading, splash screen, error boundaries,
 * and provides global providers (React Query, etc). This is the main entry point for the app UI.
 */
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import ErrorBoundary from '@/components/ErrorBoundary';
import NetworkStatusBar from '@/components/NetworkStatusBar';
import { trackScreenView } from '@/utils/analytics';
import { performanceMonitor } from '@/utils/performance';
import { useRegionStore } from '@/stores/regionStore';

// React Query client for caching and managing server state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Expo router settings (unstable API)
 */
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * Main layout component. Handles font loading, splash screen, and error boundaries.
 * Returns the navigation stack when ready.
 */
export default function RootLayout() {
  // Load custom fonts
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [appReady, setAppReady] = React.useState(false);
  // Check if region is configured (region selection logic)
  const { isConfigured } = useRegionStore();

  useEffect(() => {
    performanceMonitor.startTimer('app_startup');

    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        if (loaded || error) {
          setAppReady(true);
          performanceMonitor.endTimer('app_startup');
          trackScreenView('app_startup');
        }
      } catch (e) {
        console.warn(e);
        // Even if there's an error, we should still show the app
        setAppReady(true);
        performanceMonitor.endTimer('app_startup');
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
      }
    }

    // Add a minimum delay to ensure splash screen shows briefly
    const timer = setTimeout(() => {
      if (!appReady) {
        console.log('Font loading timeout, showing app anyway');
        setAppReady(true);
        performanceMonitor.endTimer('app_startup');
        SplashScreen.hideAsync();
      }
    }, 3000); // Increased to 3 seconds for better Android compatibility

    if (loaded || error) {
      prepare();
    }

    return () => clearTimeout(timer);
  }, [loaded, error, appReady]);

  // Show app if ready
  if (!appReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const { isConfigured } = useRegionStore();

  return (
    <>
      <StatusBar
        style={Platform.OS === 'android' ? 'dark' : 'dark'}
        backgroundColor={Platform.OS === 'android' ? Colors.background : undefined}
      />
      <NetworkStatusBar />
      <Stack
        screenOptions={{
          headerBackTitle: 'Back',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        {!isConfigured ? (
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="route/[id]"
              options={{
                title: 'Route Details',
                animation: Platform.OS === 'android' ? 'slide_from_right' : 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="search"
              options={{
                title: 'Search Places',
                animation: Platform.OS === 'android' ? 'slide_from_bottom' : 'slide_from_bottom',
                presentation: Platform.OS === 'android' ? 'modal' : 'modal',
              }}
            />
          </>
        )}
      </Stack>
    </>
  );
}
