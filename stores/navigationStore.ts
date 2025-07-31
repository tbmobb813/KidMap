import { create } from 'zustand'
import { Place, Route, PhotoCheckIn } from '@/types/navigation'
import { favoriteLocations } from '@/mocks/places'
import { sampleRoutes } from '@/mocks/transit'

type AccessibilitySettings = {
  largeText: boolean
  highContrast: boolean
  voiceDescriptions: boolean
  simplifiedMode: boolean
}

type WeatherInfo = {
  temperature: number
  condition: string
  humidity: number
}

type NavigationState = {
  favorites: Place[]
  recentSearches: Place[]
  origin: Place | null
  destination: Place | null
  availableRoutes: Route[]
  selectedRoute: Route | null
  activeRoute: any | null
  searchQuery: string
  accessibilitySettings: AccessibilitySettings
  photoCheckIns: PhotoCheckIn[]
  weatherInfo: WeatherInfo | null

  // Actions
  setOrigin: (place: Place | null) => void
  setDestination: (place: Place | null) => void
  addToFavorites: (place: Place) => void
  removeFromFavorites: (placeId: string) => void
  addToRecentSearches: (place: Place) => void
  clearRecentSearches: () => void
  setSearchQuery: (query: string) => void
  findRoutes: () => void
  selectRoute: (route: Route) => void
  clearRoute: () => void
  clearActiveRoute: () => void
  updateAccessibilitySettings: (
    settings: Partial<AccessibilitySettings>,
  ) => void
  addPhotoCheckIn: (checkIn: Omit<PhotoCheckIn, 'id'>) => void
  setWeatherInfo: (weather: WeatherInfo) => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  favorites: favoriteLocations,
  recentSearches: [],
  origin: null,
  destination: null,
  availableRoutes: [],
  selectedRoute: null,
  activeRoute: null,
  searchQuery: '',
  accessibilitySettings: {
    largeText: false,
    highContrast: false,
    voiceDescriptions: false,
    simplifiedMode: false,
  },
  photoCheckIns: [],
  weatherInfo: null,

  setOrigin: (place) => set({ origin: place }),

  setDestination: (place) => set({ destination: place }),

  addToFavorites: (place) =>
    set((state) => {
      // Check if already in favorites
      if (state.favorites.some((fav) => fav.id === place.id)) {
        return state
      }

      const updatedPlace = { ...place, isFavorite: true }
      return { favorites: [...state.favorites, updatedPlace] }
    }),

  removeFromFavorites: (placeId) =>
    set((state) => ({
      favorites: state.favorites.filter((place) => place.id !== placeId),
    })),

  addToRecentSearches: (place) =>
    set((state) => {
      // Remove if already exists to avoid duplicates
      const filteredSearches = state.recentSearches.filter(
        (p) => p.id !== place.id,
      )

      // Add to beginning of array, limit to 5 recent searches
      return {
        recentSearches: [place, ...filteredSearches].slice(0, 5),
      }
    }),

  clearRecentSearches: () => set({ recentSearches: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  findRoutes: () => {
    const { origin, destination } = get()

    if (!origin || !destination) {
      set({ availableRoutes: [], selectedRoute: null })
      return
    }

    // In a real app, this would call an API to get routes
    // For now, we'll use sample data
    set({
      availableRoutes: sampleRoutes,
      selectedRoute: sampleRoutes[0],
    })
  },

  selectRoute: (route) => set({ selectedRoute: route }),

  clearRoute: () =>
    set({
      origin: null,
      destination: null,
      availableRoutes: [],
      selectedRoute: null,
      searchQuery: '',
    }),

  updateAccessibilitySettings: (settings) =>
    set((state) => ({
      accessibilitySettings: { ...state.accessibilitySettings, ...settings },
    })),

  addPhotoCheckIn: (checkIn) =>
    set((state) => ({
      photoCheckIns: [
        ...state.photoCheckIns,
        { ...checkIn, id: Date.now().toString() },
      ],
    })),

  setWeatherInfo: (weather) => set({ weatherInfo: weather }),

  clearActiveRoute: () => set({ activeRoute: null }),
}))
