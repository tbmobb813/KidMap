import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, UserStats, SafetyContact, TripJournal } from '@/types/gamification';
import { achievementEngine, TripData } from '@/utils/achievementEngine';

type GamificationState = {
  userStats: UserStats;
  achievements: Achievement[];
  safetyContacts: SafetyContact[];
  tripJournal: TripJournal[];
  addPoints: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
  completeTrip: (tripData: TripData) => void;
  addSafetyContact: (contact: Omit<SafetyContact, 'id'>) => void;
  addTripEntry: (entry: Omit<TripJournal, 'id'>) => void;
  updateStats: (updates: Partial<UserStats>) => void;
  checkNewAchievements: (tripData: TripData) => Achievement[];
};

const initialUserStats: UserStats = {
  totalTrips: 0,
  totalPoints: 0,
  placesVisited: 0,
  favoriteTransitMode: 'walk',
  streakDays: 0,
  level: 1,
  averageSafety: 0,
  safeTrips: 0,
  walkingTrips: 0,
  transitTrips: 0,
  combinedTrips: 0,
  morningTrips: 0,
  eveningTrips: 0,
  totalDistance: 0,
  weatherConditions: [],
  consecutiveDays: 0,
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userStats: initialUserStats,
      achievements: achievementEngine.getAllAchievements(),
      safetyContacts: [],
      tripJournal: [],

      addPoints: (points: number) =>
        set((state) => {
          const newPoints = state.userStats.totalPoints + points;
          const newLevel = Math.floor(newPoints / 200) + 1;
          return {
            userStats: {
              ...state.userStats,
              totalPoints: newPoints,
              level: newLevel,
            },
          };
        }),

      unlockAchievement: (achievementId: string) =>
        set((state) => {
          const achievement = state.achievements.find((a) => a.id === achievementId);
          if (!achievement || achievement.unlocked) return state;
          const updatedAchievements = state.achievements.map((a) =>
            a.id === achievementId ? { ...a, unlocked: true, unlockedAt: new Date() } : a,
          );
          return {
            achievements: updatedAchievements,
            userStats: {
              ...state.userStats,
              totalPoints: state.userStats.totalPoints + achievement.points,
            },
          };
        }),

      completeTrip: (tripData: TripData) =>
        set((state) => {
          const updatedStats = achievementEngine.updateUserStats(state.userStats, tripData);
          const newAchievements = achievementEngine.checkAchievements(updatedStats, tripData);
          const achievementPoints = achievementEngine.calculateTotalPoints(newAchievements);
          const finalStats = {
            ...updatedStats,
            totalPoints: updatedStats.totalPoints + achievementPoints,
            level: Math.floor((updatedStats.totalPoints + achievementPoints) / 200) + 1,
          };
          const tripEntry: TripJournal = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            from: 'Start Location',
            to: tripData.destination,
            rating: tripData.safety,
            notes: `Completed ${tripData.mode} trip in ${tripData.duration} minutes`,
            funFacts: [],
          };
          return {
            userStats: finalStats,
            tripJournal: [tripEntry, ...state.tripJournal],
          };
        }),

      checkNewAchievements: (tripData: TripData): Achievement[] => {
        const state = get();
        return achievementEngine.checkAchievements(state.userStats, tripData);
      },

      addSafetyContact: (contact: Omit<SafetyContact, 'id'>) =>
        set((state) => {
          const newContact: SafetyContact = {
            ...contact,
            id: Date.now().toString(),
          };
          return {
            safetyContacts: [...state.safetyContacts, newContact],
          };
        }),

      addTripEntry: (entry: Omit<TripJournal, 'id'>) =>
        set((state) => {
          const newEntry: TripJournal = {
            ...entry,
            id: Date.now().toString(),
          };
          return {
            tripJournal: [newEntry, ...state.tripJournal],
          };
        }),

      updateStats: (updates: Partial<UserStats>) =>
        set((state) => ({
          userStats: { ...state.userStats, ...updates },
        })),
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
