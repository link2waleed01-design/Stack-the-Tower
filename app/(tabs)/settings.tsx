import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Volume2, VolumeX, Trash2, Info, Star, Award, Palette } from 'lucide-react-native';
import { useTheme } from '@/contexts/GameContext';
import { useSoundManager } from '@/hooks/useSoundManager';
import { Background } from '@/components/Background';
import { THEME_UI_COLORS } from '@/constants/game';
import { clearAllData } from '@/utils/storage';

export default function SettingsScreen() {
  const { playSound, soundEnabled, toggleSound } = useSoundManager();
  const { themeState, updateThemeState } = useTheme();
  const [isResetting, setIsResetting] = useState(false);

  const themeColors = THEME_UI_COLORS[themeState.currentTheme as keyof typeof THEME_UI_COLORS] || THEME_UI_COLORS.default;

  const handleSoundToggle = () => {
    playSound('button', 0.6);
    toggleSound();
  };

  const handleResetData = () => {
    playSound('button', 0.6);
    
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your progress, scores, and unlocked themes. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => playSound('click', 0.5),
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await clearAllData();
              
              // Reset theme state to initial values
              updateThemeState({
                coins: 0,
                currentTheme: 'default',
                unlockedThemes: ['default'],
                challengeProgress: {},
                currentUnlockedLevel: 1,
                highScores: { classic: 0, timeAttack: 0, challenge: 0 },
                totalGamesPlayed: 0,
              });

              playSound('success', 0.8);
              Alert.alert('Success', 'All data has been reset successfully.');
            } catch (error) {
              playSound('failed', 0.8);
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleTestSound = () => {
    playSound('chime', 0.8);
  };

  const completedLevels = Object.values(themeState.challengeProgress).filter(level => level.completed).length;
  const totalStars = Object.values(themeState.challengeProgress).reduce((sum, level) => sum + level.stars, 0);

  const settingsItems = [
    {
      id: 'sound',
      title: 'Sound Effects',
      description: 'Enable or disable game sound effects',
      icon: soundEnabled ? <Volume2 size={24} color={themeColors.accent} /> : <VolumeX size={24} color="#666" />,
      type: 'toggle' as const,
      value: soundEnabled,
      onToggle: handleSoundToggle,
    },
    {
      id: 'test-sound',
      title: 'Test Sound',
      description: 'Play a test sound to check audio',
      icon: <Volume2 size={24} color={themeColors.accent} />,
      type: 'button' as const,
      onPress: handleTestSound,
      disabled: !soundEnabled,
    },
    {
      id: 'reset',
      title: 'Reset All Data',
      description: 'Clear all progress, scores, and settings',
      icon: <Trash2 size={24} color="#ff4757" />,
      type: 'button' as const,
      onPress: handleResetData,
      destructive: true,
    },
  ];

  return (
    <View style={styles.container}>
      <Background towerHeight={1} themeId={themeState.currentTheme} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Settings size={28} color={themeColors.accent} />
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Settings
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Game Stats Summary */}
        <View style={[styles.statsCard, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.statsTitle, { color: themeColors.textPrimary }]}>
            Your Progress
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Star size={20} color="#FFD700" />
              <Text style={[styles.statNumber, { color: themeColors.textPrimary }]}>
                {totalStars}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Total Stars
              </Text>
            </View>

            <View style={styles.statItem}>
              <Award size={20} color={themeColors.accent} />
              <Text style={[styles.statNumber, { color: themeColors.textPrimary }]}>
                {completedLevels}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Levels Done
              </Text>
            </View>

            <View style={styles.statItem}>
              <Palette size={20} color={themeColors.accent} />
              <Text style={[styles.statNumber, { color: themeColors.textPrimary }]}>
                {themeState.unlockedThemes.length}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Themes
              </Text>
            </View>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Game Settings
          </Text>
          
          {settingsItems.map((item) => (
            <View key={item.id} style={[styles.settingItem, { backgroundColor: themeColors.cardBackground }]}>
              <View style={styles.settingLeft}>
                {item.icon}
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle, 
                    { color: item.destructive ? '#ff4757' : themeColors.textPrimary }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.settingDescription, { color: themeColors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
              </View>

              <View style={styles.settingRight}>
                {item.type === 'toggle' && (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#666', true: themeColors.accent }}
                    thumbColor={item.value ? '#fff' : '#f4f3f4'}
                  />
                )}
                
                {item.type === 'button' && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      item.destructive && styles.destructiveButton,
                      item.disabled && styles.disabledButton,
                    ]}
                    onPress={item.onPress}
                    disabled={item.disabled || isResetting}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      item.destructive && styles.destructiveButtonText,
                      item.disabled && styles.disabledButtonText,
                    ]}>
                      {item.id === 'reset' && isResetting ? 'Resetting...' : 
                       item.id === 'test-sound' ? 'Test' : 'Action'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* App Info */}
        <View style={[styles.infoCard, { backgroundColor: themeColors.cardBackground }]}>
          <Info size={20} color={themeColors.accent} />
          <View style={styles.infoText}>
            <Text style={[styles.infoTitle, { color: themeColors.textPrimary }]}>
              Stack Tower
            </Text>
            <Text style={[styles.infoDescription, { color: themeColors.textSecondary }]}>
              Version 1.0.0 • Built with React Native & Expo
            </Text>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: 15,
  },
  actionButton: {
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  disabledButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  actionButtonText: {
    color: '#4facfe',
    fontSize: 14,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: '#ff4757',
  },
  disabledButtonText: {
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 13,
  },
  footer: {
    height: 40,
  },
});