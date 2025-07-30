// __tests__/helpers/mockTripData.ts - Mock trip data and related helpers for KidMap testing
import { TripData } from '@/utils/achievementEngine';
import { TripJournal, Achievement, UserStats } from '@/types/gamification';
import { Route, Place, TransitStep, PhotoCheckIn } from '@/types/navigation';

// Mock TripData for different scenarios
export const mockTripData: Record<string, TripData> = {
  // Basic walking trip
  walkingTrip: {
    destination: 'Central Park',
    duration: 15,
    mode: 'walking',
    safety: 5,
    distance: 800,
    weatherCondition: 'sunny',
    timeOfDay: 'morning',
  },

  // Transit trip
  transitTrip: {
    destination: 'Museum of Natural History',
    duration: 25,
    mode: 'transit',
    safety: 4,
    distance: 2500,
    weatherCondition: 'cloudy',
    timeOfDay: 'afternoon',
  },

  // Combined trip
  combinedTrip: {
    destination: 'Brooklyn Bridge',
    duration: 35,
    mode: 'combined',
    safety: 4,
    distance: 3200,
    weatherCondition: 'sunny',
    timeOfDay: 'evening',
  },

  // Long trip
  longTrip: {
    destination: 'Statue of Liberty',
    duration: 60,
    mode: 'combined',
    safety: 3,
    distance: 8500,
    weatherCondition: 'rainy',
    timeOfDay: 'afternoon',
  },

  // Unsafe trip (for testing safety scenarios)
  unsafeTrip: {
    destination: 'Construction Zone',
    duration: 10,
    mode: 'walking',
    safety: 1,
    distance: 400,
    weatherCondition: 'stormy',
    timeOfDay: 'night',
  },

  // Short trip
  shortTrip: {
    destination: 'Corner Store',
    duration: 3,
    mode: 'walking',
    safety: 5,
    distance: 150,
    weatherCondition: 'sunny',
    timeOfDay: 'morning',
  },
};

// Mock TripJournal entries
export const mockTripJournal: TripJournal[] = [
  {
    id: 'journal-1',
    date: '2025-07-30',
    from: 'Home',
    to: 'Central Park',
    photos: ['park-photo-1.jpg', 'squirrel-photo.jpg'],
    notes: 'Saw lots of squirrels and fed ducks at the pond!',
    rating: 5,
    funFacts: [
      'Central Park has over 25,000 trees!',
      'The park is home to over 200 species of birds.',
    ],
  },
  {
    id: 'journal-2',
    date: '2025-07-29',
    from: 'Home',
    to: 'Public Library',
    photos: ['library-books.jpg'],
    notes: 'Found an amazing book about space exploration',
    rating: 4,
    funFacts: [
      'The New York Public Library has over 50 million items!',
      'It serves over 18 million visitors annually.',
    ],
  },
  {
    id: 'journal-3',
    date: '2025-07-28',
    from: 'School',
    to: 'Ice Cream Shop',
    photos: ['ice-cream-cone.jpg'],
    notes: 'Got chocolate chip cookie dough flavor - so good!',
    rating: 5,
    funFacts: [
      'Americans consume about 20 quarts of ice cream per person each year!',
    ],
  },
];

// Mock Places for trip planning
export const mockPlaces: Place[] = [
  {
    id: 'place-home',
    name: 'Home',
    address: '123 Main St, New York, NY',
    category: 'home',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    isFavorite: true,
  },
  {
    id: 'place-school',
    name: 'Lincoln Elementary School',
    address: '456 School Ave, New York, NY',
    category: 'school',
    coordinates: { latitude: 40.7580, longitude: -73.9855 },
    isFavorite: true,
  },
  {
    id: 'place-park',
    name: 'Central Park',
    address: 'Central Park, New York, NY',
    category: 'park',
    coordinates: { latitude: 40.7829, longitude: -73.9654 },
    isFavorite: true,
  },
  {
    id: 'place-library',
    name: 'Public Library',
    address: '789 Book St, New York, NY',
    category: 'library',
    coordinates: { latitude: 40.7589, longitude: -73.9851 },
    isFavorite: false,
  },
  {
    id: 'place-museum',
    name: 'Museum of Natural History',
    address: 'Central Park West, New York, NY',
    category: 'other',
    coordinates: { latitude: 40.7813, longitude: -73.9740 },
    isFavorite: false,
  },
  {
    id: 'place-pizza',
    name: "Tony's Pizza",
    address: '321 Pizza Ave, New York, NY',
    category: 'food-pizza',
    coordinates: { latitude: 40.7505, longitude: -73.9934 },
    isFavorite: true,
  },
];

// Mock Routes with different transport modes
export const mockRoutes: Route[] = [
  {
    id: 'route-walking-1',
    steps: [
      {
        id: 'step-1',
        type: 'walk',
        from: 'Home',
        to: 'Central Park',
        duration: 15,
        departureTime: '09:00',
        arrivalTime: '09:15',
      },
    ],
    totalDuration: 15,
    departureTime: '09:00',
    arrivalTime: '09:15',
  },
  {
    id: 'route-transit-1',
    steps: [
      {
        id: 'step-1',
        type: 'walk',
        from: 'Home',
        to: '86th St Station',
        duration: 5,
      },
      {
        id: 'step-2',
        type: 'subway',
        name: '4, 5, 6 Train',
        line: '4',
        color: '#00933c',
        from: '86th St',
        to: '59th St',
        duration: 8,
        stops: 3,
      },
      {
        id: 'step-3',
        type: 'walk',
        from: '59th St Station',
        to: 'Museum',
        duration: 7,
      },
    ],
    totalDuration: 20,
    departureTime: '10:00',
    arrivalTime: '10:20',
  },
];

// Mock PhotoCheckIn data
export const mockPhotoCheckIns: PhotoCheckIn[] = [
  {
    id: 'checkin-1',
    placeId: 'place-park',
    placeName: 'Central Park',
    photoUrl: 'file://photos/park-visit-1.jpg',
    timestamp: Date.now() - 86400000, // 1 day ago
    notes: 'Beautiful day at the park!',
    deviceInfo: {
      timestamp: Date.now() - 86400000,
      location: { latitude: 40.7829, longitude: -73.9654 },
      verified: true,
    },
  },
  {
    id: 'checkin-2',
    placeId: 'place-library',
    placeName: 'Public Library',
    photoUrl: 'file://photos/library-visit-1.jpg',
    timestamp: Date.now() - 172800000, // 2 days ago
    notes: 'Found a great book series!',
    deviceInfo: {
      timestamp: Date.now() - 172800000,
      location: { latitude: 40.7589, longitude: -73.9851 },
      verified: true,
    },
  },
];

// Mock UserStats for different progression levels
export const mockUserStatsProgression: Record<string, UserStats> = {
  beginner: {
    totalTrips: 1,
    totalPoints: 10,
    placesVisited: 1,
    favoriteTransitMode: 'walking',
    streakDays: 1,
    level: 1,
    averageSafety: 5.0,
    safeTrips: 1,
    walkingTrips: 1,
    transitTrips: 0,
    combinedTrips: 0,
    morningTrips: 1,
    eveningTrips: 0,
    totalDistance: 0.8,
    weatherConditions: ['sunny'],
    consecutiveDays: 1,
  },
  
  intermediate: {
    totalTrips: 15,
    totalPoints: 320,
    placesVisited: 8,
    favoriteTransitMode: 'walking',
    streakDays: 5,
    level: 3,
    averageSafety: 4.3,
    safeTrips: 13,
    walkingTrips: 8,
    transitTrips: 4,
    combinedTrips: 3,
    morningTrips: 6,
    eveningTrips: 9,
    totalDistance: 15.2,
    weatherConditions: ['sunny', 'cloudy', 'rainy'],
    consecutiveDays: 5,
  },
  
  advanced: {
    totalTrips: 50,
    totalPoints: 1250,
    placesVisited: 25,
    favoriteTransitMode: 'combined',
    streakDays: 14,
    level: 7,
    averageSafety: 4.6,
    safeTrips: 46,
    walkingTrips: 20,
    transitTrips: 15,
    combinedTrips: 15,
    morningTrips: 18,
    eveningTrips: 32,
    totalDistance: 85.7,
    weatherConditions: ['sunny', 'cloudy', 'rainy', 'snow'],
    consecutiveDays: 14,
  },
};

// Helper functions for creating mock data

export const createMockTripData = (overrides: Partial<TripData> = {}): TripData => ({
  destination: 'Test Destination',
  duration: 15,
  mode: 'walking',
  safety: 4,
  distance: 1000,
  weatherCondition: 'sunny',
  timeOfDay: 'morning',
  ...overrides,
});

export const createMockTripJournal = (overrides: Partial<TripJournal> = {}): TripJournal => ({
  id: `journal-${Date.now()}`,
  date: new Date().toISOString().split('T')[0],
  from: 'Test Origin',
  to: 'Test Destination',
  photos: [],
  notes: 'Test trip notes',
  rating: 4,
  funFacts: ['This is a test fun fact!'],
  ...overrides,
});

export const createMockPlace = (overrides: Partial<Place> = {}): Place => ({
  id: `place-${Date.now()}`,
  name: 'Test Place',
  address: '123 Test St, Test City',
  category: 'other',
  coordinates: { latitude: 40.7128, longitude: -74.0060 },
  isFavorite: false,
  ...overrides,
});

export const createMockRoute = (overrides: Partial<Route> = {}): Route => ({
  id: `route-${Date.now()}`,
  steps: [
    {
      id: 'step-1',
      type: 'walk',
      from: 'Start',
      to: 'End',
      duration: 15,
    },
  ],
  totalDuration: 15,
  departureTime: '09:00',
  arrivalTime: '09:15',
  ...overrides,
});

export const createMockPhotoCheckIn = (overrides: Partial<PhotoCheckIn> = {}): PhotoCheckIn => ({
  id: `checkin-${Date.now()}`,
  placeId: 'test-place',
  placeName: 'Test Place',
  photoUrl: 'file://test-photo.jpg',
  timestamp: Date.now(),
  notes: 'Test check-in',
  deviceInfo: {
    timestamp: Date.now(),
    location: { latitude: 40.7128, longitude: -74.0060 },
    verified: true,
  },
  ...overrides,
});

// Mock data generators for bulk testing
export const generateMockTrips = (count: number): TripData[] => {
  const destinations = ['Park', 'Library', 'School', 'Store', 'Friend\'s House'];
  const modes: TripData['mode'][] = ['walking', 'transit', 'combined'];
  const weather = ['sunny', 'cloudy', 'rainy'];
  const timesOfDay: TripData['timeOfDay'][] = ['morning', 'afternoon', 'evening'];

  return Array.from({ length: count }, (_, i) => ({
    destination: destinations[i % destinations.length],
    duration: Math.floor(Math.random() * 45) + 5, // 5-50 minutes
    mode: modes[Math.floor(Math.random() * modes.length)],
    safety: Math.floor(Math.random() * 5) + 1, // 1-5
    distance: Math.floor(Math.random() * 5000) + 200, // 200-5200 meters
    weatherCondition: weather[Math.floor(Math.random() * weather.length)],
    timeOfDay: timesOfDay[Math.floor(Math.random() * timesOfDay.length)],
  }));
};

export const generateMockJournalEntries = (count: number): TripJournal[] => {
  const funFactPool = [
    'Did you know that NYC has over 8 million residents?',
    'Central Park was designed by Frederick Law Olmsted!',
    'The Statue of Liberty was a gift from France!',
    'Brooklyn Bridge was completed in 1883!',
    'Times Square is visited by 50 million people annually!',
  ];

  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    return {
      id: `journal-${i + 1}`,
      date: date.toISOString().split('T')[0],
      from: i % 2 === 0 ? 'Home' : 'School',
      to: mockPlaces[Math.floor(Math.random() * mockPlaces.length)].name,
      photos: Math.random() > 0.5 ? [`photo-${i}.jpg`] : [],
      notes: `Trip ${i + 1} notes - had a great time!`,
      rating: Math.floor(Math.random() * 5) + 1,
      funFacts: [funFactPool[Math.floor(Math.random() * funFactPool.length)]],
    };
  });
};

// Export commonly used mock combinations
export const mockDataSets = {
  emptyUser: {
    trips: [],
    journal: [],
    stats: mockUserStatsProgression.beginner,
  },
  beginnerUser: {
    trips: [mockTripData.walkingTrip],
    journal: [mockTripJournal[0]],
    stats: mockUserStatsProgression.beginner,
  },
  experiencedUser: {
    trips: generateMockTrips(15),
    journal: generateMockJournalEntries(10),
    stats: mockUserStatsProgression.intermediate,
  },
  expertUser: {
    trips: generateMockTrips(50),
    journal: generateMockJournalEntries(30),
    stats: mockUserStatsProgression.advanced,
  },
};