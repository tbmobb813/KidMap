// utils/achievementEngine.ts - Gamification and achievement system
import { UserStats, Achievement } from '@/types';

export interface TripData {
  destination: string;
  duration: number; // minutes
  mode: 'walking' | 'transit' | 'combined';
  safety: number; // 1-5 rating
  distance?: number; // meters
  weatherCondition?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export class AchievementEngine {
  private static instance: AchievementEngine;
  
  static getInstance(): AchievementEngine {
    if (!AchievementEngine.instance) {
      AchievementEngine.instance = new AchievementEngine();
    }
    return AchievementEngine.instance;
  }

  // Predefined achievements
  private achievements: Achievement[] = [
    // Distance-based achievements
    {
      id: 'first_step',
      title: 'First Steps! 👶',
      description: 'Complete your first trip',
      icon: '🚶',
      points: 10,
      unlocked: false,
      category: 'milestone',
      requirement: 'Complete 1 trip',
    },
    {
      id: 'explorer',
      title: 'Little Explorer 🗺️',
      description: 'Complete 10 trips',
      icon: '🧭',
      points: 50,
      unlocked: false,
      category: 'milestone',
      requirement: 'Complete 10 trips',
    },
    {
      id: 'navigator',
      title: 'Kid Navigator 🚀',
      description: 'Complete 25 trips',
      icon: '🎯',
      points: 100,
      unlocked: false,
      category: 'milestone',
      requirement: 'Complete 25 trips',
    },
    {
      id: 'city_master',
      title: 'City Master 🏙️',
      description: 'Complete 50 trips',
      icon: '👑',
      points: 200,
      unlocked: false,
      category: 'milestone',
      requirement: 'Complete 50 trips',
    },

    // Safety-based achievements
    {
      id: 'safety_first',
      title: 'Safety First! 🛡️',
      description: 'Complete 5 trips with perfect safety scores',
      icon: '⭐',
      points: 75,
      unlocked: false,
      category: 'safety',
      requirement: 'Complete 5 trips with 5-star safety',
    },
    {
      id: 'guardian_angel',
      title: 'Guardian Angel 👼',
      description: 'Maintain 90% average safety score',
      icon: '🌟',
      points: 150,
      unlocked: false,
      category: 'safety',
      requirement: 'Maintain 90% safety average',
    },

    // Mode-specific achievements
    {
      id: 'walking_warrior',
      title: 'Walking Warrior 🚶‍♀️',
      description: 'Walk 10,000 steps in trips',
      icon: '👟',
      points: 100,
      unlocked: false,
      category: 'fitness',
      requirement: 'Walk 10,000 total steps',
    },
    {
      id: 'transit_pro',
      title: 'Transit Pro 🚇',
      description: 'Take 15 transit trips',
      icon: '🎫',
      points: 80,
      unlocked: false,
      category: 'transit',
      requirement: 'Complete 15 transit trips',
    },
    {
      id: 'multimodal_master',
      title: 'Multimodal Master 🔄',
      description: 'Use all transportation modes',
      icon: '🚌',
      points: 120,
      unlocked: false,
      category: 'variety',
      requirement: 'Use walking, transit, and combined modes',
    },

    // Time and efficiency achievements
    {
      id: 'speed_demon',
      title: 'Speedy Explorer ⚡',
      description: 'Complete a trip in under 15 minutes',
      icon: '💨',
      points: 60,
      unlocked: false,
      category: 'efficiency',
      requirement: 'Complete trip in <15 minutes',
    },
    {
      id: 'early_bird',
      title: 'Early Bird 🌅',
      description: 'Complete 5 morning trips',
      icon: '🐦',
      points: 40,
      unlocked: false,
      category: 'routine',
      requirement: 'Complete 5 trips before noon',
    },
    {
      id: 'night_owl',
      title: 'Night Explorer 🦉',
      description: 'Complete 3 evening trips safely',
      icon: '🌙',
      points: 70,
      unlocked: false,
      category: 'routine',
      requirement: 'Complete 3 evening trips',
    },

    // Special achievements
    {
      id: 'weather_warrior',
      title: 'Weather Warrior ⛈️',
      description: 'Complete trips in different weather conditions',
      icon: '🌈',
      points: 90,
      unlocked: false,
      category: 'challenge',
      requirement: 'Navigate in rain, sun, and cloudy weather',
    },
    {
      id: 'weekly_wanderer',
      title: 'Weekly Wanderer 📅',
      description: 'Complete at least one trip every day for a week',
      icon: '📍',
      points: 200,
      unlocked: false,
      category: 'consistency',
      requirement: 'Trip every day for 7 days',
    },
  ];

  // Check for newly unlocked achievements after a trip
  checkAchievements(userStats: UserStats, tripData: TripData): Achievement[] {
    const newAchievements: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && this.meetsRequirement(achievement, userStats, tripData)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  private meetsRequirement(achievement: Achievement, stats: UserStats, trip: TripData): boolean {
    switch (achievement.id) {
      case 'first_step':
        return stats.totalTrips >= 1;
      
      case 'explorer':
        return stats.totalTrips >= 10;
      
      case 'navigator':
        return stats.totalTrips >= 25;
      
      case 'city_master':
        return stats.totalTrips >= 50;
      
      case 'safety_first':
        return stats.safeTrips >= 5; // Assumes safeTrips tracks 5-star safety trips
      
      case 'guardian_angel':
        return stats.averageSafety >= 4.5; // 90% of 5 stars
      
      case 'walking_warrior':
        return (stats.totalDistance || 0) >= 10000; // Assuming distance in meters
      
      case 'transit_pro':
        return (stats.transitTrips || 0) >= 15;
      
      case 'multimodal_master':
        return (stats.walkingTrips || 0) > 0 && 
               (stats.transitTrips || 0) > 0 && 
               (stats.combinedTrips || 0) > 0;
      
      case 'speed_demon':
        return trip.duration < 15;
      
      case 'early_bird':
        return (stats.morningTrips || 0) >= 5;
      
      case 'night_owl':
        return (stats.eveningTrips || 0) >= 3;
      
      case 'weather_warrior':
        return (stats.weatherConditions || []).length >= 3;
      
      case 'weekly_wanderer':
        return this.checkWeeklyConsistency(stats);
      
      default:
        return false;
    }
  }

  private checkWeeklyConsistency(stats: UserStats): boolean {
    // Simplified check - in real app would check actual trip dates
    return stats.totalTrips >= 7 && (stats.consecutiveDays || 0) >= 7;
  }

  // Calculate points from achievements
  calculateTotalPoints(unlockedAchievements: Achievement[]): number {
    return unlockedAchievements.reduce((total, achievement) => total + achievement.points, 0);
  }

  // Get achievements by category
  getAchievementsByCategory(category: string): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === category);
  }

  // Get progress toward next achievement
  getNextAchievements(userStats: UserStats): Array<{achievement: Achievement, progress: number}> {
    const nextAchievements: Array<{achievement: Achievement, progress: number}> = [];

    this.achievements
      .filter(a => !a.unlocked)
      .forEach(achievement => {
        const progress = this.calculateProgress(achievement, userStats);
        if (progress > 0) {
          nextAchievements.push({ achievement, progress });
        }
      });

    return nextAchievements
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3); // Top 3 closest achievements
  }

  private calculateProgress(achievement: Achievement, stats: UserStats): number {
    switch (achievement.id) {
      case 'first_step':
        return Math.min(stats.totalTrips / 1, 1);
      
      case 'explorer':
        return Math.min(stats.totalTrips / 10, 1);
      
      case 'navigator':
        return Math.min(stats.totalTrips / 25, 1);
      
      case 'city_master':
        return Math.min(stats.totalTrips / 50, 1);
      
      case 'safety_first':
        return Math.min(stats.safeTrips / 5, 1);
      
      case 'guardian_angel':
        return Math.min(stats.averageSafety / 4.5, 1);
      
      case 'walking_warrior':
        return Math.min((stats.totalDistance || 0) / 10000, 1);
      
      case 'transit_pro':
        return Math.min((stats.transitTrips || 0) / 15, 1);
      
      case 'early_bird':
        return Math.min((stats.morningTrips || 0) / 5, 1);
      
      case 'night_owl':
        return Math.min((stats.eveningTrips || 0) / 3, 1);
      
      default:
        return 0;
    }
  }

  // Generate kid-friendly achievement notifications
  generateAchievementMessage(achievement: Achievement): string {
    const messages = [
      `🎉 Awesome! You unlocked "${achievement.title}"!`,
      `🌟 Amazing job! You earned "${achievement.title}"!`,
      `🎊 Congratulations! You achieved "${achievement.title}"!`,
      `⭐ Fantastic! You unlocked "${achievement.title}"!`,
      `🏆 Great work! You earned "${achievement.title}"!`,
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Get all achievements for display
  getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  // Reset achievements (for testing or user reset)
  resetAchievements(): void {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      delete achievement.unlockedAt;
    });
  }

  // Update user stats after trip completion
  updateUserStats(currentStats: UserStats, tripData: TripData): UserStats {
    const updatedStats: UserStats = {
      ...currentStats,
      totalTrips: currentStats.totalTrips + 1,
      totalDistance: (currentStats.totalDistance || 0) + (tripData.distance || 0),
    };

    // Update safety stats
    const totalSafetyPoints = (currentStats.averageSafety * currentStats.totalTrips) + tripData.safety;
    updatedStats.averageSafety = totalSafetyPoints / updatedStats.totalTrips;
    
    if (tripData.safety >= 5) {
      updatedStats.safeTrips = (currentStats.safeTrips || 0) + 1;
    }

    // Update mode-specific stats
    switch (tripData.mode) {
      case 'walking':
        updatedStats.walkingTrips = (currentStats.walkingTrips || 0) + 1;
        break;
      case 'transit':
        updatedStats.transitTrips = (currentStats.transitTrips || 0) + 1;
        break;
      case 'combined':
        updatedStats.combinedTrips = (currentStats.combinedTrips || 0) + 1;
        break;
    }

    // Update time-based stats
    switch (tripData.timeOfDay) {
      case 'morning':
        updatedStats.morningTrips = (currentStats.morningTrips || 0) + 1;
        break;
      case 'evening':
        updatedStats.eveningTrips = (currentStats.eveningTrips || 0) + 1;
        break;
    }

    // Update weather conditions
    if (tripData.weatherCondition) {
      const conditions = currentStats.weatherConditions || [];
      if (!conditions.includes(tripData.weatherCondition)) {
        updatedStats.weatherConditions = [...conditions, tripData.weatherCondition];
      }
    }

    return updatedStats;
  }
}

// Export singleton instance
export const achievementEngine = AchievementEngine.getInstance();
