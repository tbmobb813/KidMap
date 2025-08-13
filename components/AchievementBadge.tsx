import { Star, Lock } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, Pressable } from "react-native";

import { useTheme } from "@/constants/theme";
import { Achievement } from "@/types/gamification";

type AchievementBadgeProps = {
  achievement: Achievement;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  onPress,
  size = "medium"
}) => {
  const theme = useTheme();
  const getDimensions = () => {
    switch (size) {
      case "small": return { width: 60, height: 60, fontSize: 20, textSize: 10 };
      case "medium": return { width: 80, height: 80, fontSize: 28, textSize: 12 };
      case "large": return { width: 100, height: 100, fontSize: 36, textSize: 14 };
    }
  };

  const dimensions = getDimensions();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${achievement.title} badge`}
      style={({ pressed }) => [
        styles.container,
        {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: achievement.unlocked ? theme.colors.secondary : theme.colors.border,
          shadowColor: theme.colors.text,
          borderWidth: achievement.unlocked ? 0 : 1,
          borderColor: theme.colors.border
        },
        pressed && styles.pressed
      ]}
      onPress={onPress}
      disabled={!achievement.unlocked}
      testID={`achievement-badge-${achievement.id}`}
    >
      {achievement.unlocked ? (
        <>
          <Text style={[styles.icon, { fontSize: dimensions.fontSize, color: theme.colors.primaryForeground }]}> {achievement.icon} </Text>
          <Star size={16} color={theme.colors.warning} style={styles.star} />
        </>
      ) : (
        <Lock size={24} color={theme.colors.textSecondary} />
      )}

      <Text
        style={[
          styles.title,
          { fontSize: dimensions.textSize, color: theme.colors.text },
          !achievement.unlocked && { color: theme.colors.textSecondary }
        ]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>

      {achievement.unlocked && (
        <Text style={[styles.points, { fontSize: dimensions.textSize - 2, color: theme.colors.primary }]}>+{achievement.points}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 16,
    elevation: 3,
    justifyContent: "center",
    margin: 4,
    padding: 8,
    position: "relative",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  icon: {
    marginBottom: 4,
  },
  points: {
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  star: {
    position: "absolute",
    right: 4,
    top: 4,
  },
  title: {
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
});

export default AchievementBadge;
