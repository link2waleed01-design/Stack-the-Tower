import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ScoreRecord, GameState, GameMode } from '../types/game';

const HIGH_SCORE_KEY = '@stack_tower_high_score';
const GAME_DATA_KEY = '@stack_tower_game_data';
const SCORES_KEY = '@stack_tower_scores';
const HIGH_SCORES_KEY = '@stack_tower_high_scores';

// Cache for frequently accessed data
let gameDataCache: Partial<GameState> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Batch write operations to improve performance
let pendingWrites: Array<{ key: string; data: any }> = [];
let writeTimeout: ReturnType<typeof setTimeout> | null = null;

const batchWrite = async () => {
  if (pendingWrites.length === 0) return;

  try {
    const operations = pendingWrites.map(
      ({ key, data }): [string, string] => [key, JSON.stringify(data)]
    );
    await AsyncStorage.multiSet(operations);
    pendingWrites = [];
  } catch (error) {
    console.error('Error in batch write:', error);
  }
};

const scheduleBatchWrite = () => {
  if (writeTimeout) clearTimeout(writeTimeout);
  writeTimeout = setTimeout(batchWrite, 100); // Batch writes every 100ms
};

export const getHighScore = async (): Promise<number> => {
  try {
    const score = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    return score ? parseInt(score, 10) : 0;
  } catch (error) {
    console.error('Error getting high score:', error);
    return 0;
  }
};

export const saveHighScore = async (score: number): Promise<void> => {
  try {
    pendingWrites.push({ key: HIGH_SCORE_KEY, data: score.toString() });
    scheduleBatchWrite();
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};

// Optimized game data saving with caching
export const saveGameData = async (gameData: Partial<GameState>): Promise<void> => {
  try {
    // Update cache
    gameDataCache = { ...gameDataCache, ...gameData };
    cacheTimestamp = Date.now();

    const dataToSave = {
      coins: gameData.coins || 0,
      currentTheme: gameData.currentTheme || 'default',
      unlockedThemes: gameData.unlockedThemes || ['default'],
      unlockedSkins: gameData.unlockedSkins || [],
      dailyChallengeCompleted: gameData.dailyChallengeCompleted || false,
      lastDailyChallengeDate: gameData.lastDailyChallengeDate || '',
      challengeProgress: gameData.challengeProgress || {},
      currentUnlockedLevel: gameData.currentUnlockedLevel || 1,
      highScores: gameData.highScores || { classic: 0, timeAttack: 0, challenge: 0 },
      totalGamesPlayed: gameData.totalGamesPlayed || 0,
    };

    // Use batch writing for better performance
    pendingWrites.push({ key: GAME_DATA_KEY, data: dataToSave });
    scheduleBatchWrite();
  } catch (error) {
    console.error('Error saving game data:', error);
  }
};

// export const saveGameData = async (gameData: Partial<GameState>): Promise<void> => {
//   try {
//     const dataToSave = {
//       coins: gameData.coins ?? 0,
//       currentTheme: gameData.currentTheme ?? 'default',
//       unlockedThemes: gameData.unlockedThemes ?? ['default'],
//       unlockedSkins: gameData.unlockedSkins ?? [],
//       dailyChallengeCompleted: gameData.dailyChallengeCompleted ?? false,
//       lastDailyChallengeDate: gameData.lastDailyChallengeDate ?? '',
//       challengeProgress: gameData.challengeProgress ?? {},
//       currentUnlockedLevel: gameData.currentUnlockedLevel ?? 1,
//       highScores: gameData.highScores ?? { classic: 0, timeAttack: 0, challenge: 0 },
//       totalGamesPlayed: gameData.totalGamesPlayed ?? 0,
//     };

//     await AsyncStorage.setItem(GAME_DATA_KEY, JSON.stringify(dataToSave));
//   } catch (error) {
//     console.error('Error saving game data:', error);
//   }
// };

// Optimized game data loading with caching
export const loadGameData = async (): Promise<Partial<GameState>> => {
  try {
    // Return cached data if still valid
    if (gameDataCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return gameDataCache;
    }

    const data = await AsyncStorage.getItem(GAME_DATA_KEY);
    const parsedData = data ? JSON.parse(data) : {};

    // Update cache
    gameDataCache = parsedData;
    cacheTimestamp = Date.now();

    return parsedData;
  } catch (error) {
    console.error('Error loading game data:', error);
    return {};
  }
};

// export const loadGameData = async (): Promise<Partial<GameState>> => {
//   try {
//     const data = await AsyncStorage.getItem(GAME_DATA_KEY);
//     return data ? JSON.parse(data) : {};
//   } catch (error) {
//     console.error('Error loading game data:', error);
//     return {};
//   }
// };

// Optimized score saving with batching
export const saveScore = async (scoreRecord: ScoreRecord): Promise<void> => {
  try {
    const existingScores = await getScores();
    const updatedScores = [...existingScores, scoreRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Keep top 50 scores

    pendingWrites.push({ key: SCORES_KEY, data: updatedScores });
    scheduleBatchWrite();
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

export const getScores = async (mode?: GameMode): Promise<ScoreRecord[]> => {
  try {
    const scores = await AsyncStorage.getItem(SCORES_KEY);
    const allScores = scores ? JSON.parse(scores) : [];
    
    if (mode) {
      return allScores.filter((score: ScoreRecord) => score.mode === mode);
    }
    
    return allScores;
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
};

export const getTopScores = async (mode?: GameMode, limit: number = 10): Promise<ScoreRecord[]> => {
  try {
    const allScores = await getScores();
    const filteredScores = mode
      ? allScores.filter((score: ScoreRecord) => score.mode === mode)
      : allScores;

    return filteredScores.slice(0, limit);
  } catch (error) {
    console.error('Error getting top scores:', error);
    return [];
  }
};

// New functions for mode-specific high scores
export const saveHighScores = async (highScores: Record<GameMode, number>): Promise<void> => {
  try {
    pendingWrites.push({ key: HIGH_SCORES_KEY, data: highScores });
    scheduleBatchWrite();
  } catch (error) {
    console.error('Error saving high scores:', error);
  }
};

export const getHighScores = async (): Promise<Record<GameMode, number>> => {
  try {
    const scores = await AsyncStorage.getItem(HIGH_SCORES_KEY);
    return scores ? JSON.parse(scores) : { classic: 0, timeAttack: 0, challenge: 0 };
  } catch (error) {
    console.error('Error getting high scores:', error);
    return { classic: 0, timeAttack: 0, challenge: 0 };
  }
};

// Clear cache when clearing all data
export const clearAllData = async (): Promise<void> => {
  try {
    gameDataCache = null;
    cacheTimestamp = 0;
    pendingWrites = [];
    if (writeTimeout) {
      clearTimeout(writeTimeout);
      writeTimeout = null;
    }
    await AsyncStorage.multiRemove([HIGH_SCORE_KEY, GAME_DATA_KEY, SCORES_KEY, HIGH_SCORES_KEY]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Force flush pending writes (useful for app backgrounding)
export const flushPendingWrites = async (): Promise<void> => {
  if (writeTimeout) {
    clearTimeout(writeTimeout);
    writeTimeout = null;
  }
  await batchWrite();
};