import { Linking } from "react-native";

import { nav } from "@/shared/navigation/nav";

export type DeepLinkParams = {
  screen?: string;
  params?: Record<string, string>;
};

export const handleDeepLink = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;
    const searchParams = Object.fromEntries(parsedUrl.searchParams);

    // Handle different deep link patterns
    if (path.startsWith('/route/')) {
      const routeId = path.split('/')[2];
      nav.push("/route/:id", { id: routeId });
    } else if (path === '/search') {
      const { category } = searchParams as Record<string, string>;
      nav.push('/search', category ? { category } : undefined);
    } else if (path.startsWith('/place/')) {
      // const placeId = path.split('/')[2];
      // Navigate to place details or set as destination
      nav.push('/map');
    } else {
      // Default to home
      nav.push('/');
    }
  } catch (error) {
    // Suppress noisy stack trace in test environment while preserving behavior
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error handling deep link:', error);
    }
    nav.push('/');
  }
};

export const createShareableLink = (screen: string, params?: Record<string, string>) => {
  const baseUrl = 'https://kidmap.app'; // Replace with your actual domain
  const url = new URL(baseUrl);
  url.pathname = screen;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

export const shareRoute = async (routeId: string) => {
  const url = createShareableLink(`/route/${routeId}`);
  try {
    await Linking.openURL(`sms:?body=Check out this route: ${url}`);
  } catch (error) {
    console.error('Error sharing route:', error);
  }
};
