import { Trophy, MapPin, Zap, Target } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useTheme } from "@/constants/theme";
import { UserStats } from "@/types/gamification";
import { tint } from "@/utils/color";

type UserStatsCardProps = {
  stats: UserStats;
  onPetClick?: () => void;
};

const UserStatsCard: React.FC<UserStatsCardProps> = ({ stats, onPetClick }) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  const getProgressToNextLevel = () => {
    const pointsForCurrentLevel = (stats.level - 1) * 200;
    const pointsForNextLevel = stats.level * 200;
    const progress = (stats.totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel);
    return Math.max(0, Math.min(1, progress));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Trophy size={24} color={theme.colors.primary} />
          <Text style={styles.levelText}>Level {stats.level}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.pointsText}>{stats.totalPoints} points</Text>
          {onPetClick && (
            <Pressable style={styles.petButton} onPress={onPetClick}>
              <Text style={styles.petEmoji}>🐲</Text>
              <Text style={styles.petText}>Pet</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getProgressToNextLevel() * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(getProgressToNextLevel() * 100)}% to Level {stats.level + 1}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <MapPin size={20} color={theme.colors.secondary} />
          <Text style={styles.statNumber}>{stats.totalTrips}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>

        <View style={styles.statItem}>
          <Target size={20} color={theme.colors.primary} />
          <Text style={styles.statNumber}>{stats.placesVisited}</Text>
          <Text style={styles.statLabel}>Places</Text>
        </View>

        <View style={styles.statItem}>
          <Zap size={20} color={theme.colors.warning} />
          <Text style={styles.statNumber}>{stats.streakDays}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    elevation: 3,
    margin: 16,
    padding: 20,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  levelContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  levelText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  petButton: {
    alignItems: 'center',
    backgroundColor: tint(theme.colors.primary),
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 50,
    padding: 8,
  },
  petEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  petText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  pointsText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    height: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    height: "100%",
  },
  progressText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  statNumber: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default UserStatsCard;
