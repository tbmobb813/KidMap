import { Trophy, Star, Target, Calendar } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Dimensions, Platform } from "react-native";

import AchievementBadge from "@/components/AchievementBadge";
import UserStatsCard from "@/components/UserStatsCard";
import { useTheme } from "@/constants/theme";
import { useGamificationStore } from "@/stores/gamificationStore";
import { tint } from "@/utils/color";

const { width: screenWidth } = Dimensions.get('window');

export default function AchievementsScreen() {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { achievements, userStats, tripJournal } = useGamificationStore();
  const [selectedTab, setSelectedTab] = useState<"achievements" | "journal">("achievements");

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const renderJournalEntry = ({ item }: { item: typeof tripJournal[0] }) => (
    <View style={styles.journalEntry}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(star => (
              <Star 
              key={star}
              size={16} 
              color={star <= item.rating ? theme.colors.warning : theme.colors.border}
              fill={star <= item.rating ? theme.colors.warning : "transparent"}
            />
          ))}
        </View>
      </View>
      
      <Text style={styles.journalRoute}>
        {item.from} → {item.to}
      </Text>
      
      {item.notes && (
        <Text style={styles.journalNotes}>{item.notes}</Text>
      )}
      
      {item.funFacts.length > 0 && (
        <View style={styles.funFactsContainer}>
          <Text style={styles.funFactsTitle}>Fun Facts Learned:</Text>
          {item.funFacts.map((fact, index) => (
            <Text key={index} style={styles.funFact}>• {fact}</Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <UserStatsCard stats={userStats} />

      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            selectedTab === "achievements" && styles.activeTab
          ]}
          onPress={() => setSelectedTab("achievements")}
        >
          <Trophy size={20} color={selectedTab === "achievements" ? theme.colors.primaryForeground : theme.colors.primary} />
          <Text style={[
            styles.tabText,
            selectedTab === "achievements" && styles.activeTabText
          ]}>
            Achievements
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            selectedTab === "journal" && styles.activeTab
          ]}
          onPress={() => setSelectedTab("journal")}
        >
          <Calendar size={20} color={selectedTab === "journal" ? theme.colors.primaryForeground : theme.colors.primary} />
          <Text style={[
            styles.tabText,
            selectedTab === "journal" && styles.activeTabText
          ]}>
            Trip Journal
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {selectedTab === "achievements" ? (
          <>
            {unlockedAchievements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Unlocked Achievements</Text>
                <View style={styles.achievementsGrid}>
                  {unlockedAchievements.map(achievement => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="large"
                    />
                  ))}
                </View>
              </>
            )}

            {lockedAchievements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Coming Soon</Text>
                <View style={styles.achievementsGrid}>
                  {lockedAchievements.map(achievement => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      size="medium"
                    />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            {tripJournal.length > 0 ? (
              <View style={styles.journalContainer}>
                {tripJournal
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(item => (
                    <View key={item.id}>
                      {renderJournalEntry({ item })}
                    </View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Target size={40} color={theme.colors.textSecondary} />
                <Text style={styles.emptyText}>
                  Start your first trip to begin your journey journal!
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: Platform.select({
      web: screenWidth > 768 ? "space-around" : "center",
      default: "space-around",
    }),
    marginBottom: 24,
  },
  activeTab: {
  backgroundColor: theme.colors.primary,
  },
  activeTabText: {
  color: theme.colors.primaryForeground,
  },
  container: {
  backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 200,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    padding: 32,
  },
  emptyText: {
  color: theme.colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  funFact: {
  color: theme.colors.text,
    fontSize: 12,
    marginBottom: 2,
  },
  funFactsContainer: {
    backgroundColor: tint(theme.colors.secondary),
    borderRadius: 8,
    padding: 12,
  },
  funFactsTitle: {
  color: theme.colors.secondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  journalContainer: {
    gap: 12,
  },
  journalDate: {
  color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  journalEntry: {
  backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  journalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  journalList: {
    paddingBottom: 16,
  },
  journalNotes: {
  color: theme.colors.text,
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 8,
  },
  journalRoute: {
  color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  sectionTitle: {
  color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  tab: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 12,
  },
  tabContainer: {
  backgroundColor: theme.colors.surface,
    borderRadius: 12,
    flexDirection: "row",
    margin: 16,
    padding: 4,
  },
  tabText: {
  color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
