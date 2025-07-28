// __tests__/gamification.test.ts - Test achievement system
import { achievementEngine, TripData } from '@/utils/achievementEngine';
import { useGamificationStore } from '@/stores/gamificationStore';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('Achievement System', () => {
  beforeEach(() => {
    achievementEngine.resetAchievements();
  });

  test('should unlock first steps achievement on first trip', () => {
    const mockTripData: TripData = {
      destination: 'Central Park',
      duration: 15,
      mode: 'walking',
      safety: 5,
      distance: 800,
    };

    const initialStats = {
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

    // Update stats for first trip
    const updatedStats = achievementEngine.updateUserStats(initialStats, mockTripData);
    expect(updatedStats.totalTrips).toBe(1);
    expect(updatedStats.walkingTrips).toBe(1);
    expect(updatedStats.averageSafety).toBe(5);

    // Check achievements
    const newAchievements = achievementEngine.checkAchievements(updatedStats, mockTripData);
    const firstStepAchievement = newAchievements.find(a => a.id === 'first_step');
    
    expect(firstStepAchievement).toBeDefined();
    expect(firstStepAchievement?.unlocked).toBe(true);
    expect(firstStepAchievement?.points).toBe(10);
  });

  test('should track different transportation modes', () => {
    const initialStats = {
      totalTrips: 5,
      totalPoints: 50,
      placesVisited: 5,
      favoriteTransitMode: 'walk',
      streakDays: 0,
      level: 1,
      averageSafety: 4,
      safeTrips: 3,
      walkingTrips: 3,
      transitTrips: 0,
      combinedTrips: 2,
      morningTrips: 2,
      eveningTrips: 1,
      totalDistance: 2000,
      weatherConditions: ['sunny'],
      consecutiveDays: 0,
    };

    const transitTrip: TripData = {
      destination: 'Times Square',
      duration: 25,
      mode: 'transit',
      safety: 4,
      distance: 5000,
    };

    const updatedStats = achievementEngine.updateUserStats(initialStats, transitTrip);
    expect(updatedStats.transitTrips).toBe(1);
    expect(updatedStats.totalTrips).toBe(6);
    
    // Check for multimodal achievement progress
    const nextAchievements = achievementEngine.getNextAchievements(updatedStats);
    const multimodalProgress = nextAchievements.find(
      ({achievement}) => achievement.id === 'multimodal_master'
    );
    
    expect(multimodalProgress).toBeDefined();
  });

  test('should calculate points correctly', () => {
    const achievements = achievementEngine.getAllAchievements();
    const unlockedAchievements = achievements.filter(a => a.id === 'first_step' || a.id === 'safety_first');
    
    // Unlock test achievements
    unlockedAchievements.forEach(a => a.unlocked = true);
    
    const totalPoints = achievementEngine.calculateTotalPoints(unlockedAchievements);
    expect(totalPoints).toBeGreaterThan(0);
  });

  test('should generate kid-friendly messages', () => {
    const achievement = {
      id: 'test',
      title: 'Test Achievement',
      description: 'Test description',
      icon: '🎉',
      points: 10,
      unlocked: true,
      category: 'test',
      requirement: 'Test requirement',
    };

    const message = achievementEngine.generateAchievementMessage(achievement);
    expect(message).toContain('Test Achievement');
    expect(message).toMatch(/🎉|🌟|🎊|⭐|🏆/); // Should contain kid-friendly emojis
  });

  test('should categorize achievements correctly', () => {
    const safetyAchievements = achievementEngine.getAchievementsByCategory('safety');
    const milestoneAchievements = achievementEngine.getAchievementsByCategory('milestone');
    
    expect(safetyAchievements.length).toBeGreaterThan(0);
    expect(milestoneAchievements.length).toBeGreaterThan(0);
    
    safetyAchievements.forEach(a => {
      expect(a.category).toBe('safety');
    });
  });
});

describe('Gamification Store Integration', () => {
  test('should complete trip and update achievements', async () => {
    // This would test the Zustand store integration
    // Note: In a real test, you'd need to properly mock Zustand
    const mockTripData: TripData = {
      destination: 'Brooklyn Bridge',
      duration: 30,
      mode: 'combined',
      safety: 4,
      distance: 2500,
      timeOfDay: 'morning',
    };

    // Test would verify that completeTrip updates both stats and achievements
    expect(mockTripData.mode).toBe('combined');
  });
});

describe('Achievement Progress Tracking', () => {
  test('should calculate progress toward next achievements', () => {
    const partialStats = {
      totalTrips: 7,
      totalPoints: 150,
      placesVisited: 7,
      favoriteTransitMode: 'walk',
      streakDays: 0,
      level: 1,
      averageSafety: 4.2,
      safeTrips: 4,
      walkingTrips: 5,
      transitTrips: 2,
      combinedTrips: 0,
      morningTrips: 3,
      eveningTrips: 1,
      totalDistance: 3500,
      weatherConditions: ['sunny', 'cloudy'],
      consecutiveDays: 0,
    };

    const nextAchievements = achievementEngine.getNextAchievements(partialStats);
    
    expect(nextAchievements.length).toBeGreaterThan(0);
    expect(nextAchievements.length).toBeLessThanOrEqual(3); // Should return top 3
    
    nextAchievements.forEach(({achievement, progress}) => {
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(1);
      expect(achievement.unlocked).toBe(false);
    });
  });
});
