// Main types export file
export * from './category';
export * from './gamification';
export * from './navigation';
export * from './region';

// Common base types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface UserStats {
  totalRoutes: number;
  totalDistance: number;
  timesSaved: number;
  co2Saved: number;
  safetyScore: number;
  // Additional stats for achievement system
  totalTrips: number;
  safeTrips: number;
  averageSafety: number;
  transitTrips: number;
  walkingTrips: number;
  combinedTrips: number;
  morningTrips: number;
  eveningTrips: number;
  weatherConditions: string[];
  consecutiveDays: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  dateUnlocked?: Date;
  category: 'safety' | 'exploration' | 'eco' | 'social' | 'milestone' | 'fitness' | 'transit' | 'variety' | 'efficiency' | 'routine' | 'challenge' | 'consistency';
  points?: number;
  unlocked?: boolean;
  unlockedAt?: Date;
  requirement?: string;
}

export interface PendingApproval {
  id: string;
  type: 'route' | 'location' | 'category' | 'permission' | 'safe-zone' | 'contact';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  requestedBy: string;
  details: any;
  status?: 'approved' | 'denied' | 'pending' | 'rejected';
  metadata?: Record<string, any>;
  reviewComments?: string;
}
