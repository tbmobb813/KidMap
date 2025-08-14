import { create } from "zustand";

import { PhotoCheckInSchema } from '@/core/validation';
import { favoriteLocations } from "@/mocks/places";
// import { sampleRoutes } from "@/mocks/transit";
import { fetchRoutes } from '@/services/routeService';
import { Place, Route, PhotoCheckIn, TravelMode, RouteOptions } from "@/types/navigation";
import { invariant } from '@/utils/invariant';
import { verifyLocationProximity } from "@/utils/locationUtils";
import { savePersistedState, loadPersistedState } from '@/utils/persistence';

type AccessibilitySettings = {
  largeText: boolean;
  highContrast: boolean;
  voiceDescriptions: boolean;
  simplifiedMode: boolean;
  darkMode: boolean; // Add dark mode toggle
  preferSystemTheme: boolean; // Whether to follow system theme
};

type WeatherInfo = {
  temperature: number;
  condition: string;
  humidity: number;
};

type NavigationState = {
  favorites: Place[];
  recentSearches: Place[];
  origin: Place | null;
  destination: Place | null;
  selectedRoute: Route | null;
  searchQuery: string;
  accessibilitySettings: AccessibilitySettings;
  photoCheckIns: PhotoCheckIn[];
  weatherInfo: WeatherInfo | null;
  selectedTravelMode: TravelMode;
  routeOptions: RouteOptions;
  routesLoading: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  // Actions
  setOrigin: (place: Place | null) => void;
  setDestination: (place: Place | null) => void;
  addToFavorites: (place: Place) => void;
  removeFromFavorites: (placeId: string) => void;
  addToRecentSearches: (place: Place) => void;
  clearRecentSearches: () => void;
  setSearchQuery: (query: string) => void;
  findRoutes: () => void;
  findRoutesAsync: () => Promise<void>;
  selectRoute: (route: Route) => void;
  clearRoute: () => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  addPhotoCheckIn: (checkIn: Omit<PhotoCheckIn, 'id'>) => void;
  setWeatherInfo: (weather: WeatherInfo) => void;
  setTravelMode: (mode: TravelMode) => void;
  updateRouteOptions: (options: Partial<RouteOptions>) => void;
  addLocationVerifiedPhotoCheckIn: (checkIn: Omit<PhotoCheckIn, 'id'>, currentLocation: { latitude: number; longitude: number }, placeLocation: { latitude: number; longitude: number }) => { isWithinRadius: boolean; distance: number };
};

let persistTimer: any = null;
const PERSIST_DEBOUNCE_MS = 300;

function schedulePersist(get: () => NavigationState) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const { favorites, recentSearches, accessibilitySettings, photoCheckIns, selectedTravelMode, routeOptions } = get();
    savePersistedState({ favorites, recentSearches, accessibilitySettings, photoCheckIns, selectedTravelMode, routeOptions });
  }, PERSIST_DEBOUNCE_MS);
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  favorites: favoriteLocations,
  recentSearches: [],
  origin: null,
  destination: null,
  selectedRoute: null,
  searchQuery: "",
  accessibilitySettings: {
    largeText: false,
    highContrast: false,
    voiceDescriptions: false,
    simplifiedMode: false,
    darkMode: false,
    preferSystemTheme: true, // Default to following system preference
  },
  photoCheckIns: [],
  weatherInfo: null,
  selectedTravelMode: "transit",
  routeOptions: {
    travelMode: "transit",
    avoidTolls: false,
    avoidHighways: false,
    accessibilityMode: false,
  },
  routesLoading: false,
  isHydrated: false,
  hydrate: async () => {
    try {
      const data = await loadPersistedState();
      if (data) {
        set({
          favorites: data.favorites ?? [],
          recentSearches: data.recentSearches ?? [],
          accessibilitySettings: data.accessibilitySettings ?? get().accessibilitySettings,
          photoCheckIns: data.photoCheckIns ?? [],
          selectedTravelMode: (['transit', 'walking', 'biking', 'driving'] as const).includes((data as any).selectedTravelMode) ? (data as any).selectedTravelMode as TravelMode : 'transit',
          routeOptions: data.routeOptions ?? get().routeOptions,
        });
      }
    } finally {
      set({ isHydrated: true });
    }
  },

  setOrigin: (place) => { set({ origin: place }); schedulePersist(get); },

  setDestination: (place) => { set({ destination: place }); schedulePersist(get); },

  addToFavorites: (place) => set((state) => {
    // Check if already in favorites
    if (state.favorites.some(fav => fav.id === place.id)) {
      return state;
    }

    const updatedPlace = { ...place, isFavorite: true };
    const next = { favorites: [...state.favorites, updatedPlace] } as Partial<NavigationState>;
    schedulePersist(() => ({ ...state, ...next } as NavigationState));
    return next;
  }),

  removeFromFavorites: (placeId) => set((state) => {
    const next = { favorites: state.favorites.filter(place => place.id !== placeId) } as Partial<NavigationState>;
    schedulePersist(() => ({ ...state, ...next } as NavigationState));
    return next;
  }),

  addToRecentSearches: (place) => set((state) => {
    // Remove if already exists to avoid duplicates
    const filteredSearches = state.recentSearches.filter(p => p.id !== place.id);

    // Add to beginning of array, limit to 5 recent searches
    const next = {
      recentSearches: [place, ...filteredSearches].slice(0, 5)
    } as Partial<NavigationState>;
    schedulePersist(() => ({ ...state, ...next } as NavigationState));
    return next;
  }),

  clearRecentSearches: () => { set({ recentSearches: [] }); schedulePersist(get); },

  setSearchQuery: (query) => set({ searchQuery: query }),

  findRoutes: () => { get().findRoutesAsync(); },

  findRoutesAsync: async () => {
    const { origin, destination, selectedTravelMode, routeOptions } = get();
    if (!origin || !destination) {
      set({ selectedRoute: null, routesLoading: false });
      return;
    }
    set({ routesLoading: true });
    try {
      const routes = await fetchRoutes({ origin, destination, mode: selectedTravelMode, options: routeOptions });
      invariant(origin.name.length > 0 && destination.name.length > 0, 'Origin or destination missing name');
      set({ selectedRoute: routes[0] || null });
    } catch (e) {
      console.warn('Failed to fetch routes', e);
      set({ selectedRoute: null });
    } finally {
      set({ routesLoading: false });
    }
  },

  selectRoute: (route) => set({ selectedRoute: route }),

  clearRoute: () => set({
    origin: null,
    destination: null,
    selectedRoute: null,
    searchQuery: ""
  }),

  updateAccessibilitySettings: (settings) => set((state) => {
    const next = { accessibilitySettings: { ...state.accessibilitySettings, ...settings } } as Partial<NavigationState>;
    schedulePersist(() => ({ ...state, ...next } as NavigationState));
    return next;
  }),

  addPhotoCheckIn: (checkIn) => {
    const parsed = PhotoCheckInSchema.safeParse(checkIn);
    if (!parsed.success) {
      console.warn('Invalid photo check-in:', parsed.error.issues);
      return;
    }
    set((state) => {
      const next = { photoCheckIns: [...state.photoCheckIns, { ...parsed.data, id: Date.now().toString() }] } as Partial<NavigationState>;
      schedulePersist(() => ({ ...state, ...next } as NavigationState));
      return next;
    });
  },

  setWeatherInfo: (weather) => set({ weatherInfo: weather }),

  setTravelMode: (mode) => {
    set({ selectedTravelMode: mode });
    // Automatically update route options and refind routes
    const { findRoutes } = get();
    set((state) => ({
      routeOptions: { ...state.routeOptions, travelMode: mode }
    }));
    findRoutes();
    schedulePersist(get);
  },

  updateRouteOptions: (options) => {
    set((state) => ({
      routeOptions: { ...state.routeOptions, ...options }
    }));
    // Refind routes with new options
    const { findRoutes } = get();
    findRoutes();
    schedulePersist(get);
  },

  addLocationVerifiedPhotoCheckIn: (checkIn, currentLocation, placeLocation) => {
    const verification = verifyLocationProximity(
      currentLocation.latitude,
      currentLocation.longitude,
      placeLocation.latitude,
      placeLocation.longitude,
      100 // 100 meter radius
    );

    const verifiedCheckIn = {
      ...checkIn,
      id: Date.now().toString(),
      location: currentLocation,
      isLocationVerified: verification.isWithinRadius,
      distanceFromPlace: verification.distance,
    };

    set((state) => {
      const next = { photoCheckIns: [...state.photoCheckIns, verifiedCheckIn] } as Partial<NavigationState>;
      schedulePersist(() => ({ ...state, ...next } as NavigationState));
      return next;
    });

    return verification;
  }
}));
