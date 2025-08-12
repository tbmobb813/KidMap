import { create } from "zustand";
import { invariant } from '@/utils/invariant';
import { Place, Route, PhotoCheckIn, TravelMode, RouteOptions } from "@/types/navigation";
import { fetchRoutes } from '../src/services/routeService';
import { PhotoCheckInSchema } from '@/core/validation';
import { favoriteLocations } from "@/mocks/places";
import { sampleRoutes } from "@/mocks/transit";
import { verifyLocationProximity } from "@/utils/locationUtils";

type AccessibilitySettings = {
  largeText: boolean;
  highContrast: boolean;
  voiceDescriptions: boolean;
  simplifiedMode: boolean;
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
  availableRoutes: Route[];
  selectedRoute: Route | null;
  searchQuery: string;
  accessibilitySettings: AccessibilitySettings;
  photoCheckIns: PhotoCheckIn[];
  weatherInfo: WeatherInfo | null;
  selectedTravelMode: TravelMode;
  routeOptions: RouteOptions;
  routesLoading: boolean;

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

export const useNavigationStore = create<NavigationState>((set, get) => ({
  favorites: favoriteLocations,
  recentSearches: [],
  origin: null,
  destination: null,
  availableRoutes: [],
  selectedRoute: null,
  searchQuery: "",
  accessibilitySettings: {
    largeText: false,
    highContrast: false,
    voiceDescriptions: false,
    simplifiedMode: false,
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

  setOrigin: (place) => set({ origin: place }),

  setDestination: (place) => set({ destination: place }),

  addToFavorites: (place) => set((state) => {
    // Check if already in favorites
    if (state.favorites.some(fav => fav.id === place.id)) {
      return state;
    }

    const updatedPlace = { ...place, isFavorite: true };
    return { favorites: [...state.favorites, updatedPlace] };
  }),

  removeFromFavorites: (placeId) => set((state) => ({
    favorites: state.favorites.filter(place => place.id !== placeId)
  })),

  addToRecentSearches: (place) => set((state) => {
    // Remove if already exists to avoid duplicates
    const filteredSearches = state.recentSearches.filter(p => p.id !== place.id);

    // Add to beginning of array, limit to 5 recent searches
    return {
      recentSearches: [place, ...filteredSearches].slice(0, 5)
    };
  }),

  clearRecentSearches: () => set({ recentSearches: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  findRoutes: () => { get().findRoutesAsync(); },

  findRoutesAsync: async () => {
    const { origin, destination, selectedTravelMode, routeOptions } = get();
    if (!origin || !destination) {
      set({ availableRoutes: [], selectedRoute: null, routesLoading: false });
      return;
    }
    set({ routesLoading: true });
    try {
      const routes = await fetchRoutes({ origin, destination, mode: selectedTravelMode, options: routeOptions });
      invariant(origin.name.length > 0 && destination.name.length > 0, 'Origin or destination missing name');
      set({
        availableRoutes: routes,
        selectedRoute: routes[0] || null,
      });
    } catch (e) {
      console.warn('Failed to fetch routes', e);
      set({ availableRoutes: [], selectedRoute: null });
    } finally {
      set({ routesLoading: false });
    }
  },

  selectRoute: (route) => set({ selectedRoute: route }),

  clearRoute: () => set({
    origin: null,
    destination: null,
    availableRoutes: [],
    selectedRoute: null,
    searchQuery: ""
  }),

  updateAccessibilitySettings: (settings) => set((state) => ({
    accessibilitySettings: { ...state.accessibilitySettings, ...settings }
  })),

  addPhotoCheckIn: (checkIn) => {
    const parsed = PhotoCheckInSchema.safeParse(checkIn);
    if (!parsed.success) {
      console.warn('Invalid photo check-in:', parsed.error.issues);
      return;
    }
    set((state) => ({
      photoCheckIns: [...state.photoCheckIns, { ...parsed.data, id: Date.now().toString() }]
    }));
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
  },

  updateRouteOptions: (options) => {
    set((state) => ({
      routeOptions: { ...state.routeOptions, ...options }
    }));
    // Refind routes with new options
  const { findRoutes } = get();
    findRoutes();
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

    set((state) => ({
      photoCheckIns: [...state.photoCheckIns, verifiedCheckIn]
    }));

    return verification;
  }
}));
