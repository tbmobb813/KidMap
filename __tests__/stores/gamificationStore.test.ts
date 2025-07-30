// __tests__/stores/gamificationStore.test.ts - Gamification store tests
import { act } from '@testing-library/react-native';
import { useGamificationStore } from '@/stores/gamificationStore';
import { 
  mockTripData, 
  mockUserStatsProgression, 
  createMockTripData 
} from '../helpers/mockTripData';
import { setupMockAsyncStorage } from '../helpers/mockAsyncStorage';
import { TEST_CONFIG } from '../config/testSetup';

// Centralized mocks
jest.mock('@react-native-async-storage/async-storage', () => 
  require('../helpers/mockAsyncStorage').createAsyncStorageMock()
);

describe('Gamification Store', () => {
  // Helper to reset store to clean state
  const resetStore = () => {
    const { updateStats } = useGamificationStore.getState();
    updateStats({
      totalTrips: 0,
      totalPoints: 0,
      walkingTrips: 0,
      safeTrips: 0,
    });
  };

  beforeEach(() => {
    setupMockAsyncStorage();
    resetStore();
    jest.clearAllMocks();
  });

  describe('Points Management', () => {
    it('should add points to user stats', () => {
      const { addPoints, userStats } = useGamificationStore.getState();
      const initialPoints = userStats.totalPoints;
      
      act(() => {
        addPoints(10);
      });
      
      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalPoints).toBe(initialPoints + 10);
    });

    it('should handle negative points correctly', () => {
      const { addPoints, userStats } = useGamificationStore.getState();
      
      // First add some points
      act(() => {
        addPoints(50);
      });
      
      // Then subtract some
      act(() => {
        addPoints(-20);
      });
      
      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalPoints).toBe(30);
    });

    it('should prevent points from going below zero', () => {
      const { addPoints, userStats } = useGamificationStore.getState();
      
      act(() => {
        addPoints(-100); // Try to go negative
      });
      
      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalPoints).toBeGreaterThanOrEqual(0);
    });

    it('should handle large point values', () => {
      const { addPoints } = useGamificationStore.getState();
      const largeValue = 999999;
      
      act(() => {
        addPoints(largeValue);
      });
      
      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalPoints).toBe(largeValue);
    });
  });

  describe('Achievement Management', () => {
    it('should unlock achievement by ID', () => {
      const { unlockAchievement, achievements } = useGamificationStore.getState();
      
      // Find an available achievement
      const availableAchievement = achievements.find(a => !a.unlocked);
      expect(availableAchievement).toBeDefined();
      
      act(() => {
        unlockAchievement(availableAchievement!.id);
      });

      const updatedAchievements = useGamificationStore.getState().achievements;
      const unlockedAchievement = updatedAchievements.find(
        a => a.id === availableAchievement!.id
      );
      
      expect(unlockedAchievement?.unlocked).toBe(true);
      expect(unlockedAchievement?.unlockedAt).toBeDefined();
    });

    it('should not unlock already unlocked achievements', () => {
      const { unlockAchievement, achievements } = useGamificationStore.getState();
      
      // Find an available achievement and unlock it
      const achievement = achievements.find(a => !a.unlocked);
      expect(achievement).toBeDefined();
      
      act(() => {
        unlockAchievement(achievement!.id);
      });
      
      const firstUnlockTime = useGamificationStore.getState().achievements
        .find(a => a.id === achievement!.id)?.unlockedAt;
      
      // Try to unlock again
      act(() => {
        unlockAchievement(achievement!.id);
      });
      
      const secondUnlockTime = useGamificationStore.getState().achievements
        .find(a => a.id === achievement!.id)?.unlockedAt;
      
      expect(firstUnlockTime).toEqual(secondUnlockTime);
    });

    it('should handle invalid achievement IDs gracefully', () => {
      const { unlockAchievement } = useGamificationStore.getState();
      
      const initialAchievements = useGamificationStore.getState().achievements;
      
      act(() => {
        unlockAchievement('invalid-achievement-id');
      });
      
      const updatedAchievements = useGamificationStore.getState().achievements;
      expect(updatedAchievements).toEqual(initialAchievements);
    });

    it('should calculate achievement progress correctly', () => {
      const { updateStats, getAchievementProgress } = useGamificationStore.getState();
      
      act(() => {
        updateStats({
          totalTrips: 5,
          walkingTrips: 3,
          safeTrips: 4,
        });
      });
      
      // Test achievement progress calculation if method exists
      if (getAchievementProgress) {
        const progress = getAchievementProgress('first-trip'); // Assuming this achievement exists
        expect(typeof progress).toBe('number');
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Statistics Management', () => {
    it('should update user stats correctly', () => {
      const { updateStats } = useGamificationStore.getState();
      const newStats = {
        totalTrips: 15,
        walkingTrips: 8,
        safeTrips: 12,
        totalPoints: 250,
      };
      
      act(() => {
        updateStats(newStats);
      });

      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalTrips).toBe(newStats.totalTrips);
      expect(updatedStats.walkingTrips).toBe(newStats.walkingTrips);
      expect(updatedStats.safeTrips).toBe(newStats.safeTrips);
      expect(updatedStats.totalPoints).toBe(newStats.totalPoints);
    });

    it('should handle partial stats updates', () => {
      const { updateStats } = useGamificationStore.getState();
      
      // Set initial stats
      act(() => {
        updateStats({
          totalTrips: 10,
          walkingTrips: 5,
          safeTrips: 8,
          totalPoints: 100,
        });
      });
      
      // Update only some stats
      act(() => {
        updateStats({
          totalTrips: 15,
          totalPoints: 150,
        });
      });

      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalTrips).toBe(15);
      expect(updatedStats.totalPoints).toBe(150);
      expect(updatedStats.walkingTrips).toBe(5); // Should remain unchanged
      expect(updatedStats.safeTrips).toBe(8); // Should remain unchanged
    });

    it('should validate stats values', () => {
      const { updateStats } = useGamificationStore.getState();
      
      act(() => {
        updateStats({
          totalTrips: -5, // Invalid negative value
          walkingTrips: 10,
        });
      });

      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalTrips).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Trip Data Integration', () => {
    it('should work with mock trip data', () => {
      const { updateStats } = useGamificationStore.getState();
      const tripStats = mockTripData.reduce((acc, trip) => ({
        totalTrips: acc.totalTrips + 1,
        walkingTrips: acc.walkingTrips + (trip.mode === 'walking' ? 1 : 0),
        safeTrips: acc.safeTrips + (trip.isSafe ? 1 : 0),
        totalPoints: acc.totalPoints + trip.points,
      }), {
        totalTrips: 0,
        walkingTrips: 0,
        safeTrips: 0,
        totalPoints: 0,
      });
      
      act(() => {
        updateStats(tripStats);
      });

      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalTrips).toBe(tripStats.totalTrips);
      expect(updatedStats.walkingTrips).toBe(tripStats.walkingTrips);
    });

    it('should handle user progression data', () => {
      const { updateStats } = useGamificationStore.getState();
      const levelData = mockUserStatsProgression.find(level => level.level === 1);
      
      if (levelData) {
        act(() => {
          updateStats(levelData.stats);
        });

        const updatedStats = useGamificationStore.getState().userStats;
        expect(updatedStats.totalPoints).toBe(levelData.stats.totalPoints);
      }
    });

    it('should work with custom trip data', () => {
      const { updateStats } = useGamificationStore.getState();
      const customTrip = createMockTripData({
        id: 'custom-trip',
        mode: 'cycling',
        points: 25,
        isSafe: true,
      });
      
      act(() => {
        updateStats({
          totalTrips: 1,
          totalPoints: customTrip.points,
          safeTrips: customTrip.isSafe ? 1 : 0,
        });
      });

      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalPoints).toBe(25);
      expect(updatedStats.safeTrips).toBe(1);
    });
  });

  describe('Level System', () => {
    it('should calculate current level based on points', () => {
      const { updateStats, getCurrentLevel } = useGamificationStore.getState();
      
      act(() => {
        updateStats({ totalPoints: 500 });
      });
      
      if (getCurrentLevel) {
        const currentLevel = getCurrentLevel();
        expect(typeof currentLevel).toBe('number');
        expect(currentLevel).toBeGreaterThan(0);
      }
    });

    it('should calculate points needed for next level', () => {
      const { updateStats, getPointsToNextLevel } = useGamificationStore.getState();
      
      act(() => {
        updateStats({ totalPoints: 100 });
      });
      
      if (getPointsToNextLevel) {
        const pointsNeeded = getPointsToNextLevel();
        expect(typeof pointsNeeded).toBe('number');
        expect(pointsNeeded).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Performance', () => {
    it('should handle rapid stats updates efficiently', () => {
      const { addPoints } = useGamificationStore.getState();
      const startTime = Date.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          addPoints(1);
        }
      });
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete quickly
      
      const finalStats = useGamificationStore.getState().userStats;
      expect(finalStats.totalPoints).toBe(100);
    });

    it('should maintain state consistency under rapid updates', () => {
      const { addPoints, updateStats } = useGamificationStore.getState();
      
      act(() => {
        updateStats({ totalTrips: 10 });
        addPoints(50);
        updateStats({ walkingTrips: 5 });
        addPoints(25);
      });
      
      const finalStats = useGamificationStore.getState().userStats;
      expect(finalStats.totalTrips).toBe(10);
      expect(finalStats.walkingTrips).toBe(5);
      expect(finalStats.totalPoints).toBe(75);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty stats updates', () => {
      const { updateStats } = useGamificationStore.getState();
      const initialStats = useGamificationStore.getState().userStats;
      
      act(() => {
        updateStats({});
      });
      
      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats).toEqual(initialStats);
    });

    it('should handle null/undefined values gracefully', () => {
      const { updateStats } = useGamificationStore.getState();
      
      act(() => {
        updateStats({
          totalTrips: null as any,
          walkingTrips: undefined as any,
          totalPoints: 100,
        });
      });
      
      const updatedStats = useGamificationStore.getState().userStats;
      expect(updatedStats.totalPoints).toBe(100);
      expect(typeof updatedStats.totalTrips).toBe('number');
      expect(typeof updatedStats.walkingTrips).toBe('number');
    });
  });

  describe('State Persistence', () => {
    it('should maintain state consistency across multiple reads', () => {
      const { updateStats } = useGamificationStore.getState();
      
      act(() => {
        updateStats({
          totalTrips: 42,
          totalPoints: 1337,
        });
      });
      
      const state1 = useGamificationStore.getState();
      const state2 = useGamificationStore.getState();
      
      expect(state1.userStats).toEqual(state2.userStats);
      expect(state1.achievements).toEqual(state2.achievements);
    });
  });
});
      updateStats({ totalTrips: 5, walkingTrips: 2 });
    });

    const stats = useGamificationStore.getState().userStats;
    expect(stats.totalTrips).toBe(5);
    expect(stats.walkingTrips).toBe(2);
  });

  it('should handle trip completion with mock trip data', () => {
    const { completeTrip, userStats } = useGamificationStore.getState();
    
    act(() => {
      completeTrip(mockTripData.walkingTrip);
    });

    const stats = useGamificationStore.getState().userStats;
    expect(stats.totalTrips).toBeGreaterThan(0);
    expect(stats.walkingTrips).toBeGreaterThan(0);
  });

  it('should progress through user stats levels', () => {
    const { updateStats } = useGamificationStore.getState();
    
    // Start as beginner
    act(() => {
      updateStats(mockUserStatsProgression.beginner);
    });
    
    let stats = useGamificationStore.getState().userStats;
    expect(stats.level).toBe(1);
    expect(stats.totalTrips).toBe(1);

    // Progress to intermediate
    act(() => {
      updateStats(mockUserStatsProgression.intermediate);
    });
    
    stats = useGamificationStore.getState().userStats;
    expect(stats.level).toBe(3);
    expect(stats.totalTrips).toBe(15);
  });

  it('should handle different trip modes with mock data', () => {
    const { completeTrip } = useGamificationStore.getState();
    
    // Complete different types of trips
    act(() => {
      completeTrip(mockTripData.walkingTrip);
      completeTrip(mockTripData.transitTrip);
      completeTrip(mockTripData.combinedTrip);
    });

    const stats = useGamificationStore.getState().userStats;
    expect(stats.walkingTrips).toBeGreaterThan(0);
    expect(stats.transitTrips).toBeGreaterThan(0);
    expect(stats.combinedTrips).toBeGreaterThan(0);
  });

  it('should create custom trip data for testing', () => {
    const customTrip = createMockTripData({
      destination: 'Custom Destination',
      mode: 'walking',
      safety: 5,
    });

    const { completeTrip } = useGamificationStore.getState();
    
    act(() => {
      completeTrip(customTrip);
    });

    const stats = useGamificationStore.getState().userStats;
    expect(stats.totalTrips).toBeGreaterThan(0);
    expect(stats.averageSafety).toBe(5);
  });
});
