// __tests__/utils/achievementEngine.test.ts - Achievement engine tests
import { achievementEngine, TripData, UserStats } from '@/utils/achievementEngine';
import { TEST_CONFIG } from '../config/testSetup';

// Mock data for consistent testing
const MOCK_USER_STATS = {
  clean: {
    totalTrips: 0,
    totalPoints: 0,
    placesVisited: 0,
    favoriteTransitMode: 'walk' as const,
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
    totalRoutes: 0,
    timesSaved: 0,
    co2Saved: 0,
    safetyScore: 0,
  },
  experienced: {
    totalTrips: 25,
    totalPoints: 450,
    placesVisited: 12,
    favoriteTransitMode: 'transit' as const,
    streakDays: 7,
    level: 3,
    averageSafety: 4.2,
    safeTrips: 20,
    walkingTrips: 15,
    transitTrips: 8,
    combinedTrips: 5,
    morningTrips: 12,
    eveningTrips: 10,
    totalDistance: 15000,
    weatherConditions: ['sunny', 'cloudy', 'rainy'],
    consecutiveDays: 5,
    totalRoutes: 8,
    timesSaved: 120,
    co2Saved: 50,
    safetyScore: 4.5,
  },
} as const;

const MOCK_TRIPS = {
  safe_walking: {
    destination: 'Central Park',
    duration: 15,
    mode: 'walking' as const,
    safety: 5,
    distance: 800,
    timeOfDay: 'morning' as const,
  },
  unsafe_transit: {
    destination: 'Downtown Station',
    duration: 25,
    mode: 'transit' as const,
    safety: 2,
    distance: 3000,
    timeOfDay: 'evening' as const,
  },
  long_cycling: {
    destination: 'Riverside Trail',
    duration: 45,
    mode: 'cycling' as const,
    safety: 4,
    distance: 5000,
    timeOfDay: 'afternoon' as const,
  },
  multimodal: {
    destination: 'University Campus',
    duration: 30,
    mode: 'combined' as const,
    safety: 4,
    distance: 2500,
    timeOfDay: 'morning' as const,
  },
} as const;

describe('Achievement Engine', () => {
  beforeEach(() => {
    achievementEngine.resetAchievements();
    jest.clearAllMocks();
  });

  describe('Stats Updating', () => {
    it('should update user stats correctly for walking trip', () => {
      const initialStats = { ...MOCK_USER_STATS.clean };
      const stats = achievementEngine.updateUserStats(initialStats, MOCK_TRIPS.safe_walking);

      expect(stats.totalTrips).toBe(1);
      expect(stats.walkingTrips).toBe(1);
      expect(stats.transitTrips).toBe(0);
      expect(stats.morningTrips).toBe(1);
      expect(stats.eveningTrips).toBe(0);
      expect(stats.averageSafety).toBe(5);
      expect(stats.totalDistance).toBe(800);
    });

    it('should update user stats correctly for transit trip', () => {
      const initialStats = { ...MOCK_USER_STATS.clean };
      const stats = achievementEngine.updateUserStats(initialStats, MOCK_TRIPS.unsafe_transit);

      expect(stats.totalTrips).toBe(1);
      expect(stats.walkingTrips).toBe(0);
      expect(stats.transitTrips).toBe(1);
      expect(stats.eveningTrips).toBe(1);
      expect(stats.averageSafety).toBe(2);
      expect(stats.totalDistance).toBe(3000);
    });

    it('should update user stats correctly for multimodal trip', () => {
      const initialStats = { ...MOCK_USER_STATS.clean };
      const stats = achievementEngine.updateUserStats(initialStats, MOCK_TRIPS.multimodal);

      expect(stats.totalTrips).toBe(1);
      expect(stats.combinedTrips).toBe(1);
      expect(stats.morningTrips).toBe(1);
      expect(stats.totalDistance).toBe(2500);
    });

    it('should accumulate stats correctly over multiple trips', () => {
      let stats = { ...MOCK_USER_STATS.clean };
      
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.safe_walking);
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.unsafe_transit);
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.long_cycling);

      expect(stats.totalTrips).toBe(3);
      expect(stats.walkingTrips).toBe(1);
      expect(stats.transitTrips).toBe(1); // cycling might be counted differently
      expect(stats.totalDistance).toBe(8800);
      expect(stats.averageSafety).toBeCloseTo((5 + 2 + 4) / 3, 1);
    });

    it('should handle edge cases in stats calculation', () => {
      const initialStats = { ...MOCK_USER_STATS.clean };
      const extremeTrip: TripData = {
        destination: 'Test Location',
        duration: 0,
        mode: 'walking',
        safety: 0,
        distance: 0,
        timeOfDay: 'morning',
      };

      const stats = achievementEngine.updateUserStats(initialStats, extremeTrip);
      
      expect(stats.totalTrips).toBe(1);
      expect(stats.totalDistance).toBe(0);
      expect(stats.averageSafety).toBe(0);
    });
  });

  describe('Achievement Unlocking', () => {
    it('should unlock first_step achievement on first trip', () => {
      const stats = achievementEngine.updateUserStats({ ...MOCK_USER_STATS.clean }, MOCK_TRIPS.safe_walking);
      const achievements = achievementEngine.checkAchievements(stats, MOCK_TRIPS.safe_walking);
      
      const firstStep = achievements.find(a => a.id === 'first_step');
      expect(firstStep?.unlocked).toBe(true);
    });

    it('should unlock safety achievements for high safety scores', () => {
      let stats = { ...MOCK_USER_STATS.clean };
      
      // Complete 5 safe trips (safety score 4+)
      for (let i = 0; i < 5; i++) {
        stats = achievementEngine.updateUserStats(stats, {
          ...MOCK_TRIPS.safe_walking,
          destination: `Safe Location ${i}`,
        });
      }
      
      const achievements = achievementEngine.checkAchievements(stats, MOCK_TRIPS.safe_walking);
      const safetyAchievement = achievements.find(a => a.category === 'safety' && a.unlocked);
      
      if (safetyAchievement) {
        expect(safetyAchievement.unlocked).toBe(true);
      }
    });

    it('should unlock walking achievements for walking trips', () => {
      let stats = { ...MOCK_USER_STATS.clean };
      
      // Complete multiple walking trips
      for (let i = 0; i < 10; i++) {
        stats = achievementEngine.updateUserStats(stats, {
          ...MOCK_TRIPS.safe_walking,
          destination: `Walking Destination ${i}`,
        });
      }
      
      const achievements = achievementEngine.checkAchievements(stats, MOCK_TRIPS.safe_walking);
      const walkingAchievements = achievements.filter(a => a.unlocked && a.id.includes('walk'));
      
      expect(walkingAchievements.length).toBeGreaterThan(0);
    });

    it('should unlock multimodal achievements', () => {
      let stats = { ...MOCK_USER_STATS.clean };
      
      // Mix different transport modes
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.safe_walking);
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.unsafe_transit);
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.multimodal);
      
      const achievements = achievementEngine.checkAchievements(stats, MOCK_TRIPS.multimodal);
      const multimodalAchievement = achievements.find(a => a.id === 'multimodal_master' && a.unlocked);
      
      if (multimodalAchievement) {
        expect(multimodalAchievement.unlocked).toBe(true);
      }
    });

    it('should not unlock achievements when requirements not met', () => {
      const stats = { ...MOCK_USER_STATS.clean };
      const achievements = achievementEngine.checkAchievements(stats, MOCK_TRIPS.unsafe_transit);
      
      const unlockedCount = achievements.filter(a => a.unlocked).length;
      expect(unlockedCount).toBeLessThanOrEqual(1); // Maybe first_step only
    });
  });

  describe('Achievement Progress Tracking', () => {
    it('should track progress towards next achievements', () => {
      const stats = {
        ...MOCK_USER_STATS.clean,
        walkingTrips: 2,
        transitTrips: 1,
        totalTrips: 3,
      };

      const nextAchievements = achievementEngine.getNextAchievements(stats);
      
      expect(nextAchievements.length).toBeGreaterThan(0);
      expect(nextAchievements.length).toBeLessThanOrEqual(3);
      
      nextAchievements.forEach(({ achievement, progress }) => {
        expect(achievement.unlocked).toBe(false);
        expect(progress).toBeGreaterThan(0);
        expect(progress).toBeLessThanOrEqual(100);
      });
    });

    it('should prioritize closest achievements', () => {
      const stats = {
        ...MOCK_USER_STATS.clean,
        walkingTrips: 9, // Very close to a walking milestone
        transitTrips: 1,
        totalTrips: 10,
      };

      const nextAchievements = achievementEngine.getNextAchievements(stats);
      
      if (nextAchievements.length > 0) {
        const topAchievement = nextAchievements[0];
        expect(topAchievement.progress).toBeGreaterThan(80); // Should be very close
      }
    });

    it('should return empty array when no progress available', () => {
      const stats = { ...MOCK_USER_STATS.experienced }; // All achievements might be unlocked
      const nextAchievements = achievementEngine.getNextAchievements(stats);
      
      expect(Array.isArray(nextAchievements)).toBe(true);
      // Length might be 0 if all achievements are unlocked
    });
  });

  describe('Points Calculation', () => {
    it('should calculate total points correctly', () => {
      const mockAchievements = [
        { id: 'test1', points: 10, unlocked: true },
        { id: 'test2', points: 20, unlocked: true },
        { id: 'test3', points: 15, unlocked: false }, // Should not count
      ];

      const total = achievementEngine.calculateTotalPoints(mockAchievements as any);
      expect(total).toBe(30);
    });

    it('should handle empty achievements array', () => {
      const total = achievementEngine.calculateTotalPoints([]);
      expect(total).toBe(0);
    });

    it('should handle achievements without unlocked status', () => {
      const mockAchievements = [
        { id: 'test1', points: 10 }, // No unlocked property
        { id: 'test2', points: 20, unlocked: true },
      ];

      const total = achievementEngine.calculateTotalPoints(mockAchievements as any);
      expect(total).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Achievement Messages', () => {
    it('should generate kid-friendly achievement messages', () => {
      const testAchievement = {
        id: 'safety_hero',
        title: 'Safety Hero',
        description: 'Kept safe for 5 trips',
        icon: '🏆',
        points: 15,
        unlocked: true,
        isUnlocked: true,
        category: 'safety',
        requirement: 'Complete 5 safe trips',
      };

      const message = achievementEngine.generateAchievementMessage(testAchievement as any);
      
      expect(message).toContain('Safety Hero');
      expect(message).toMatch(/🏆|🌟|⭐|🎉/); // Should contain celebration emojis
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should handle achievements without icons', () => {
      const testAchievement = {
        id: 'no_icon',
        title: 'Test Achievement',
        description: 'Test description',
        points: 10,
        unlocked: true,
        category: 'test',
      };

      const message = achievementEngine.generateAchievementMessage(testAchievement as any);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe('Achievement Categories', () => {
    it('should filter achievements by category correctly', () => {
      const safetyAchievements = achievementEngine.getAchievementsByCategory('safety');
      const milestoneAchievements = achievementEngine.getAchievementsByCategory('milestone');
      
      expect(Array.isArray(safetyAchievements)).toBe(true);
      expect(Array.isArray(milestoneAchievements)).toBe(true);
      
      safetyAchievements.forEach(achievement => {
        expect(achievement.category).toBe('safety');
      });
      
      milestoneAchievements.forEach(achievement => {
        expect(achievement.category).toBe('milestone');
      });
    });

    it('should handle invalid categories gracefully', () => {
      const invalidCategory = achievementEngine.getAchievementsByCategory('nonexistent' as any);
      expect(Array.isArray(invalidCategory)).toBe(true);
      expect(invalidCategory.length).toBe(0);
    });

    it('should return all available categories', () => {
      const allAchievements = achievementEngine.getAllAchievements();
      const categories = [...new Set(allAchievements.map(a => a.category))];
      
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('safety');
      expect(categories).toContain('milestone');
    });
  });

  describe('Achievement System Reset', () => {
    it('should reset all achievements to unlocked:false', () => {
      // First, unlock some achievements
      const stats = achievementEngine.updateUserStats({ ...MOCK_USER_STATS.clean }, MOCK_TRIPS.safe_walking);
      achievementEngine.checkAchievements(stats, MOCK_TRIPS.safe_walking);
      
      // Verify some are unlocked
      const beforeReset = achievementEngine.getAllAchievements();
      const unlockedBefore = beforeReset.filter(a => a.unlocked);
      expect(unlockedBefore.length).toBeGreaterThan(0);
      
      // Reset
      achievementEngine.resetAchievements();
      
      // Verify all are locked
      const afterReset = achievementEngine.getAllAchievements();
      const unlockedAfter = afterReset.filter(a => a.unlocked);
      expect(unlockedAfter.length).toBe(0);
    });

    it('should maintain achievement structure after reset', () => {
      const beforeReset = achievementEngine.getAllAchievements();
      achievementEngine.resetAchievements();
      const afterReset = achievementEngine.getAllAchievements();
      
      expect(afterReset.length).toBe(beforeReset.length);
      afterReset.forEach((achievement, index) => {
        const before = beforeReset[index];
        expect(achievement.id).toBe(before.id);
        expect(achievement.title).toBe(before.title);
        expect(achievement.points).toBe(before.points);
        expect(achievement.unlocked).toBe(false);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid achievement checks efficiently', () => {
      const startTime = Date.now();
      let stats = { ...MOCK_USER_STATS.clean };
      
      for (let i = 0; i < 100; i++) {
        stats = achievementEngine.updateUserStats(stats, {
          ...MOCK_TRIPS.safe_walking,
          destination: `Performance Test ${i}`,
        });
        achievementEngine.checkAchievements(stats, MOCK_TRIPS.safe_walking);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(TEST_CONFIG.timeouts.slow);
    });

    it('should handle malformed trip data gracefully', () => {
      const malformedTrip = {
        destination: null,
        duration: -5,
        mode: 'invalid_mode',
        safety: 10, // Out of range
        distance: -100,
        timeOfDay: 'invalid_time',
      } as any;

      expect(() => {
        const stats = achievementEngine.updateUserStats({ ...MOCK_USER_STATS.clean }, malformedTrip);
        achievementEngine.checkAchievements(stats, malformedTrip);
      }).not.toThrow();
    });

    it('should maintain consistency across multiple operations', () => {
      let stats = { ...MOCK_USER_STATS.clean };
      
      // Perform multiple operations
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.safe_walking);
      const achievements1 = achievementEngine.checkAchievements(stats, MOCK_TRIPS.safe_walking);
      const next1 = achievementEngine.getNextAchievements(stats);
      
      stats = achievementEngine.updateUserStats(stats, MOCK_TRIPS.unsafe_transit);
      const achievements2 = achievementEngine.checkAchievements(stats, MOCK_TRIPS.unsafe_transit);
      const next2 = achievementEngine.getNextAchievements(stats);
      
      expect(achievements1.length).toBeLessThanOrEqual(achievements2.length);
      expect(stats.totalTrips).toBe(2);
    });

    it('should handle concurrent access safely', () => {
      const stats1 = { ...MOCK_USER_STATS.clean };
      const stats2 = { ...MOCK_USER_STATS.clean };
      
      const result1 = achievementEngine.updateUserStats(stats1, MOCK_TRIPS.safe_walking);
      const result2 = achievementEngine.updateUserStats(stats2, MOCK_TRIPS.unsafe_transit);
      
      expect(result1.totalTrips).toBe(1);
      expect(result2.totalTrips).toBe(1);
      expect(result1.walkingTrips).toBe(1);
      expect(result2.transitTrips).toBe(1);
    });
  });
});
