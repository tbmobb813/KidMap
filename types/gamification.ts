export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: string;
  requirement: string;
};

export type UserStats = {
  totalTrips: number;
  totalPoints: number;
  placesVisited: number;
  favoriteTransitMode: string;
  streakDays: number;
  level: number;
  averageSafety: number;
  safeTrips: number;
  walkingTrips?: number;
  transitTrips?: number;
  combinedTrips?: number;
  morningTrips?: number;
  eveningTrips?: number;
  totalDistance?: number;
  weatherConditions?: string[];
  consecutiveDays?: number;
};

export type SafetyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
};

export type TripJournal = {
  id: string;
  date: string; // Changed from Date to string for JSON serialization
  from: string;
  to: string;
  photos?: string[];
  notes: string;
  rating: number;
  funFacts: string[];
};
