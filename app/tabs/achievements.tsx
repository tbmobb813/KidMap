import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native'
import Colors from '../../src/constants/colors'
import AchievementBadge from '../../src/components/AchievementBadge'
import UserStatsCard from '../../src/components/UserStatsCard'
import { useGamificationStore } from '../../src/stores/gamificationStore'
import { achievementEngine } from '../../src/utils/achievementEngine'
import type { UserStats } from '../../src/types/index'
import {
  Trophy,
  Star,
  Target,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

export default function AchievementsScreen() {
  const { achievements, userStats, tripJournal } = useGamificationStore() as {
    achievements: any[]
    userStats: UserStats
    tripJournal: any[]
  }
  const [selectedTab, setSelectedTab] = useState<
    'achievements' | 'progress' | 'journal'
  >('achievements')
  const [allAchievements, setAllAchievements] = useState(
    achievementEngine.getAllAchievements(),
  )
  const [nextAchievements, setNextAchievements] = useState(
    achievementEngine.getNextAchievements(userStats),
  )

  useEffect(() => {
    setAllAchievements(achievementEngine.getAllAchievements())
    setNextAchievements(achievementEngine.getNextAchievements(userStats))
  }, [userStats])

  const unlockedAchievements = allAchievements.filter((a) => a.unlocked)
  const lockedAchievements = allAchievements.filter((a) => !a.unlocked)
  const totalPoints =
    achievementEngine.calculateTotalPoints(unlockedAchievements)

  const renderAchievementCard = (achievement: any, progressValue?: number) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.unlocked ? styles.unlockedCard : styles.lockedCard,
      ]}
    >
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <View style={styles.achievementInfo}>
          <Text
            style={[
              styles.achievementTitle,
              !achievement.unlocked && styles.lockedText,
            ]}
          >
            {achievement.title}
          </Text>
          <Text
            style={[
              styles.achievementDescription,
              !achievement.unlocked && styles.lockedText,
            ]}
          >
            {achievement.description}
          </Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{achievement.points}pts</Text>
        </View>
      </View>

      {progressValue && !achievement.unlocked && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressValue * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progressValue * 100)}% Complete
          </Text>
        </View>
      )}

      <Text style={styles.requirementText}>{achievement.requirement}</Text>
    </View>
  )

  const renderJournalEntry = ({ item }: { item: (typeof tripJournal)[0] }) => (
    <View style={styles.journalEntry}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              color={star <= item.rating ? '#FFD700' : Colors.border}
              fill={star <= item.rating ? '#FFD700' : 'transparent'}
            />
          ))}
        </View>
      </View>

      <Text style={styles.journalRoute}>
        {item.from} → {item.to}
      </Text>

      {item.notes && <Text style={styles.journalNotes}>{item.notes}</Text>}

      {item.funFacts.length > 0 && (
        <View style={styles.funFactsContainer}>
          <Text style={styles.funFactsTitle}>Fun Facts Learned:</Text>
          {item.funFacts.map((fact, index) => (
            <Text key={index} style={styles.funFact}>
              • {fact}
            </Text>
          ))}
        </View>
      )}
    </View>
  )

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
            selectedTab === 'achievements' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Trophy
            size={20}
            color={selectedTab === 'achievements' ? '#FFFFFF' : Colors.primary}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'achievements' && styles.activeTabText,
            ]}
          >
            Achievements
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, selectedTab === 'progress' && styles.activeTab]}
          onPress={() => setSelectedTab('progress')}
        >
          <TrendingUp
            size={20}
            color={selectedTab === 'progress' ? '#FFFFFF' : Colors.primary}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'progress' && styles.activeTabText,
            ]}
          >
            Progress
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, selectedTab === 'journal' && styles.activeTab]}
          onPress={() => setSelectedTab('journal')}
        >
          <Calendar
            size={20}
            color={selectedTab === 'journal' ? '#FFFFFF' : Colors.primary}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'journal' && styles.activeTabText,
            ]}
          >
            Journal
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {selectedTab === 'achievements' ? (
          <>
            <View style={styles.statsOverview}>
              <Text style={styles.pointsTotal}>
                🏆 {totalPoints} Total Points
              </Text>
              <Text style={styles.achievementCount}>
                {unlockedAchievements.length} of {allAchievements.length}{' '}
                Unlocked
              </Text>
            </View>

            {unlockedAchievements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  🌟 Unlocked Achievements
                </Text>
                {unlockedAchievements.map((achievement) =>
                  renderAchievementCard(achievement),
                )}
              </>
            )}

            {lockedAchievements.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>🔒 Locked Achievements</Text>
                {lockedAchievements
                  .slice(0, 6)
                  .map((achievement) => renderAchievementCard(achievement))}
              </>
            )}
          </>
        ) : selectedTab === 'progress' ? (
          <>
            <Text style={styles.sectionTitle}>📈 Your Progress</Text>

            {nextAchievements.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Almost There!</Text>
                {nextAchievements.map(({ achievement, progress }) =>
                  renderAchievementCard(achievement, progress),
                )}
              </>
            )}

            <View style={styles.categoryProgress}>
              <Text style={styles.subsectionTitle}>Categories</Text>
              {['milestone', 'safety', 'fitness', 'transit'].map((category) => {
                const categoryAchievements =
                  achievementEngine.getAchievementsByCategory(category)
                const unlockedCount = categoryAchievements.filter(
                  (a) => a.unlocked,
                ).length
                const progress = unlockedCount / categoryAchievements.length

                return (
                  <View key={category} style={styles.categoryCard}>
                    <Text style={styles.categoryName}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <View style={styles.categoryProgressBar}>
                      <View
                        style={[
                          styles.categoryProgressFill,
                          { width: `${progress * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryText}>
                      {unlockedCount}/{categoryAchievements.length}
                    </Text>
                  </View>
                )
              })}
            </View>
          </>
        ) : (
          <>
            {tripJournal.length > 0 ? (
              <View style={styles.journalContainer}>
                {tripJournal
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .map((item) => (
                    <View key={item.id}>{renderJournalEntry({ item })}</View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Target size={40} color={Colors.textLight} />
                <Text style={styles.emptyText}>
                  Start your first trip to begin your journey journal!
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
    minHeight: 200,
  },
  // Achievement card styles
  statsOverview: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  pointsTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  achievementCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  achievementCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unlockedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  lockedCard: {
    backgroundColor: '#F8F9FA',
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  lockedText: {
    color: Colors.textLight,
    opacity: 0.6,
  },
  pointsBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  requirementText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  // Progress tab styles
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  categoryProgress: {
    marginTop: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    width: 80,
  },
  categoryProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textLight,
    width: 40,
    textAlign: 'right',
  },
  // Existing styles
  journalContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: Platform.select({
      web: screenWidth > 768 ? 'space-around' : 'center',
      default: 'space-around',
    }),
    gap: 16,
    marginBottom: 24,
  },
  journalList: {
    paddingBottom: 16,
  },
  journalEntry: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  journalDate: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  journalRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  journalNotes: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  funFactsContainer: {
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    padding: 12,
  },
  funFactsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 4,
  },
  funFact: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
})
