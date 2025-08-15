import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Crown, Star, Target, Clock, Infinity, TrendingUp, Calendar, Award } from 'lucide-react-native';
import { useTheme } from '@/contexts/GameContext';
import { useSoundManager } from '@/hooks/useSoundManager';
import { Background } from '@/components/Background';
import { THEME_UI_COLORS } from '@/constants/game';
import { GameMode } from '@/types/game';
import { getTopScores, ScoreRecord } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getModeIcon = (mode: GameMode, size: number = 20, color: string = '#fff') => {
  switch (mode) {
    case 'classic':
      return <Infinity size={size} color={color} />;
    case 'timeAttack':
      return <Clock size={size} color={color} />;
    case 'challenge':
      return <Target size={size} color={color} />;
    default:
      return <Trophy size={size} color={color} />;
  }
};

const getModeDisplayName = (mode: GameMode): string => {
  switch (mode) {
    case 'classic':
      return 'Classic Mode';
    case 'timeAttack':
      return 'Time Attack';
    case 'challenge':
      return 'Challenge Mode';
    default:
      return 'Unknown';
  }
};

const getRankIcon = (rank: number, size: number = 24) => {
  switch (rank) {
    case 1:
      return <Crown size={size} color="#FFD700" />;
    case 2:
      return <Medal size={size} color="#C0C0C0" />;
    case 3:
      return <Medal size={size} color="#CD7F32" />;
    default:
      return <Trophy size={size} color="#666" />;
  }
};

export default function LeaderboardScreen() {
  const { playSound } = useSoundManager();
  const { themeState } = useTheme();
  const [selectedMode, setSelectedMode] = useState<GameMode | 'all'>('all');
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);

  const themeColors = THEME_UI_COLORS[themeState.currentTheme as keyof typeof THEME_UI_COLORS] || THEME_UI_COLORS.default;

  useEffect(() => {
    loadRecentScores();
  }, [selectedMode]);

  const loadRecentScores = async () => {
    try {
      const scores = await getTopScores(selectedMode === 'all' ? undefined : selectedMode, 10);
      setRecentScores(scores);
    } catch (error) {
      console.error('Failed to load scores:', error);
    }
  };

  const handleModeSelect = (mode: GameMode | 'all') => {
    playSound('button', 0.6);
    setSelectedMode(mode);
  };

  const modes: Array<{ id: GameMode | 'all'; name: string; icon: React.ReactNode }> = [
    { id: 'all', name: 'All', icon: <Trophy size={16} color="#fff" /> },
    { id: 'classic', name: 'Classic', icon: getModeIcon('classic', 16) },
    { id: 'timeAttack', name: 'Time Attack', icon: getModeIcon('timeAttack', 16) },
    { id: 'challenge', name: 'Challenge', icon: getModeIcon('challenge', 16) },
  ];

  const completedLevels = Object.values(themeState.challengeProgress).filter(level => level.completed).length;
  const totalStars = Object.values(themeState.challengeProgress).reduce((sum, level) => sum + level.stars, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <Background towerHeight={1} themeId={themeState.currentTheme} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Trophy size={28} color={themeColors.accent} />
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Leaderboard
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.statHeader}>
            <Infinity size={20} color={themeColors.accent} />
            <Text style={[styles.statTitle, { color: themeColors.textPrimary }]}>Classic</Text>
          </View>
          <Text style={[styles.statValue, { color: themeColors.accent }]}>
            {themeState.highScores.classic.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>High Score</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.statHeader}>
            <Clock size={20} color={themeColors.accent} />
            <Text style={[styles.statTitle, { color: themeColors.textPrimary }]}>Time Attack</Text>
          </View>
          <Text style={[styles.statValue, { color: themeColors.accent }]}>
            {themeState.highScores.timeAttack.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>High Score</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.statHeader}>
            <Target size={20} color={themeColors.accent} />
            <Text style={[styles.statTitle, { color: themeColors.textPrimary }]}>Challenge</Text>
          </View>
          <Text style={[styles.statValue, { color: themeColors.accent }]}>
            {completedLevels}/20
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Completed</Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={[styles.additionalStatCard, { backgroundColor: themeColors.cardBackground }]}>
          <Star size={18} color="#FFD700" />
          <Text style={[styles.additionalStatText, { color: themeColors.textPrimary }]}>
            {totalStars} Stars
          </Text>
        </View>

        <View style={[styles.additionalStatCard, { backgroundColor: themeColors.cardBackground }]}>
          <TrendingUp size={18} color={themeColors.accent} />
          <Text style={[styles.additionalStatText, { color: themeColors.textPrimary }]}>
            {themeState.totalGamesPlayed} Games
          </Text>
        </View>

        <View style={[styles.additionalStatCard, { backgroundColor: themeColors.cardBackground }]}>
          <Award size={18} color={themeColors.accent} />
          <Text style={[styles.additionalStatText, { color: themeColors.textPrimary }]}>
            {themeState.highScores.challenge.toLocaleString()} Best
          </Text>
        </View>
      </View>

      {/* Mode Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.modeFilter}
        contentContainerStyle={styles.modeFilterContent}
      >
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              selectedMode === mode.id && [styles.selectedModeButton, { backgroundColor: themeColors.accent }],
            ]}
            onPress={() => handleModeSelect(mode.id)}
          >
            {mode.icon}
            <Text style={[
              styles.modeButtonText,
              selectedMode === mode.id && styles.selectedModeButtonText,
              { color: selectedMode === mode.id ? '#fff' : themeColors.textSecondary }
            ]}>
              {mode.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recent Scores */}
      <View style={styles.scoresSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Recent Scores
        </Text>
        
        <ScrollView style={styles.scoresList} showsVerticalScrollIndicator={false}>
          {recentScores.length === 0 ? (
            <View style={styles.emptyState}>
              <Trophy size={48} color={themeColors.textTertiary} />
              <Text style={[styles.emptyStateText, { color: themeColors.textSecondary }]}>
                No scores yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: themeColors.textTertiary }]}>
                Start playing to see your scores here!
              </Text>
            </View>
          ) : (
            recentScores.map((score, index) => (
              <View key={`${score.date}-${index}`} style={[styles.scoreCard, { backgroundColor: themeColors.cardBackground }]}>
                <View style={styles.scoreRank}>
                  {getRankIcon(index + 1, 20)}
                  <Text style={[styles.rankText, { color: themeColors.textSecondary }]}>
                    #{index + 1}
                  </Text>
                </View>

                <View style={styles.scoreInfo}>
                  <View style={styles.scoreHeader}>
                    <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>
                      {score.score.toLocaleString()}
                    </Text>
                    <View style={styles.modeTag}>
                      {getModeIcon(score.mode, 14, themeColors.accent)}
                      <Text style={[styles.modeTagText, { color: themeColors.accent }]}>
                        {getModeDisplayName(score.mode)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.scoreDetails}>
                    <Text style={[styles.scoreBlocks, { color: themeColors.textSecondary }]}>
                      {score.blocks} blocks
                    </Text>
                    <Text style={[styles.scoreDate, { color: themeColors.textTertiary }]}>
                      {formatDate(score.date)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
          
          <View style={styles.footer} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  additionalStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  additionalStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  additionalStatText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeFilter: {
    maxHeight: 50,
    marginBottom: 20,
  },
  modeFilterContent: {
    paddingHorizontal: 20,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
  },
  selectedModeButton: {
    backgroundColor: '#4facfe',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedModeButtonText: {
    color: '#fff',
  },
  scoresSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scoresList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  scoreRank: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 40,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  modeTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBlocks: {
    fontSize: 14,
    fontWeight: '500',
  },
  scoreDate: {
    fontSize: 12,
  },
  footer: {
    height: 20,
  },
});