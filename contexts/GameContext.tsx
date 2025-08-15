import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState } from 'react-native';
import { ChallengeLevel, ScoreRecord, GameMode } from '../types/game';
import { CHALLENGE_LEVELS } from '../constants/game';
import { saveGameData, loadGameData, flushPendingWrites } from '../utils/storage';

interface ThemeState {
  coins: number;
  currentTheme: string;
  unlockedThemes: string[];
  challengeProgress: Record<number, ChallengeLevel>;
  currentUnlockedLevel: number;
  highScores: {
    classic: number;
    timeAttack: number;
    challenge: number;
  };
  totalGamesPlayed: number;
}

interface ThemeContextType {
  themeState: ThemeState;
  spendCoins: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockTheme: (themeId: string) => void;
  setCurrentTheme: (themeId: string) => void;
  updateThemeState: (newState: Partial<ThemeState>) => void;
  updateChallengeProgress: (levelId: number, progress: Partial<ChallengeLevel>) => void;
  completeChallengeLevel: (levelId: number, stars: number, score: number, isNewStars: boolean) => number;
  getCurrentUnlockedLevel: () => number;
  updateHighScore: (mode: GameMode, score: number) => boolean;
  incrementGamesPlayed: () => void;
  getHighScore: (mode: GameMode) => number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeAction =
  | { type: 'SPEND_COINS'; amount: number }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'UNLOCK_THEME'; themeId: string }
  | { type: 'SET_CURRENT_THEME'; themeId: string }
  | { type: 'UPDATE_STATE'; newState: Partial<ThemeState> }
  | { type: 'UPDATE_CHALLENGE_PROGRESS'; levelId: number; progress: Partial<ChallengeLevel> }
  | { type: 'COMPLETE_CHALLENGE_LEVEL'; levelId: number; stars: number; score: number }
  | { type: 'UPDATE_HIGH_SCORE'; mode: GameMode; score: number }
  | { type: 'INCREMENT_GAMES_PLAYED' };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SPEND_COINS':
      return { ...state, coins: Math.max(0, state.coins - action.amount) };
    case 'ADD_COINS':
      return { ...state, coins: state.coins + action.amount };
    case 'UNLOCK_THEME':
      return {
        ...state,
        unlockedThemes: state.unlockedThemes.includes(action.themeId)
          ? state.unlockedThemes
          : [...state.unlockedThemes, action.themeId],
      };
    case 'SET_CURRENT_THEME':
      return { ...state, currentTheme: action.themeId };
    case 'UPDATE_STATE':
      return { ...state, ...action.newState };
    case 'UPDATE_CHALLENGE_PROGRESS':
      return {
        ...state,
        challengeProgress: {
          ...state.challengeProgress,
          [action.levelId]: {
            ...state.challengeProgress[action.levelId],
            ...action.progress,
          },
        },
      };
    case 'COMPLETE_CHALLENGE_LEVEL':
      const currentLevel = state.challengeProgress[action.levelId];
      const newStars = Math.max(currentLevel?.stars || 0, action.stars);
      const isCompleted = true;
      
      // Update current unlocked level
      const newUnlockedLevel = Math.max(state.currentUnlockedLevel, action.levelId + 1);
      
      return {
        ...state,
        challengeProgress: {
          ...state.challengeProgress,
          [action.levelId]: {
            ...currentLevel,
            completed: isCompleted,
            stars: newStars,
            bestScore: Math.max(currentLevel?.bestScore || 0, action.score),
          },
        },
        currentUnlockedLevel: newUnlockedLevel,
      };
    case 'UPDATE_HIGH_SCORE':
      return {
        ...state,
        highScores: {
          ...state.highScores,
          [action.mode]: Math.max(state.highScores[action.mode] || 0, action.score),
        },
      };
    case 'INCREMENT_GAMES_PLAYED':
      return { ...state, totalGamesPlayed: state.totalGamesPlayed + 1 };
    default:
      return state;
  }
};

// Initialize challenge progress
const initializeChallengeProgress = (): Record<number, ChallengeLevel> => {
  const progress: Record<number, ChallengeLevel> = {};
  CHALLENGE_LEVELS.forEach(level => {
    progress[level.id] = { 
      ...level, 
      completed: false, 
      stars: 0,
      bestScore: 0 
    };
  });
  return progress;
};

const initialState: ThemeState = {
  coins: 0,
  currentTheme: 'default',
  unlockedThemes: ['default'],
  challengeProgress: initializeChallengeProgress(),
  currentUnlockedLevel: 1,
  highScores: {
    classic: 0,
    timeAttack: 0,
    challenge: 0,
  },
  totalGamesPlayed: 0,
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeState, dispatch] = useReducer(themeReducer, initialState);

  // Handle app backgrounding for data persistence
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Force save current state when app goes to background
        flushPendingWrites().catch(console.error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await loadGameData();
      if (Object.keys(savedData).length > 0) {
        // Merge saved challenge progress with default levels
        const mergedChallengeProgress = { ...initializeChallengeProgress() };
        if (savedData.challengeProgress) {
          Object.keys(savedData.challengeProgress).forEach(levelId => {
            const id = parseInt(levelId);
            if (mergedChallengeProgress[id]) {
              mergedChallengeProgress[id] = {
                ...mergedChallengeProgress[id],
                ...savedData.challengeProgress![id],
              };
            }
          });
        }

        dispatch({ 
          type: 'UPDATE_STATE', 
          newState: {
            ...savedData,
            challengeProgress: mergedChallengeProgress,
            currentUnlockedLevel: savedData.currentUnlockedLevel || 1,
            highScores: savedData.highScores || { classic: 0, timeAttack: 0, challenge: 0 },
          }
        });
      }
    };

    loadSavedData();
  }, []);

  // Debounced save to prevent excessive storage operations
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Save theme data when state changes
  useEffect(() => {
    // Debounce saves to prevent excessive storage operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveGameData({
        coins: themeState.coins,
        currentTheme: themeState.currentTheme,
        unlockedThemes: themeState.unlockedThemes,
        challengeProgress: themeState.challengeProgress,
        currentUnlockedLevel: themeState.currentUnlockedLevel,
        highScores: themeState.highScores,
        totalGamesPlayed: themeState.totalGamesPlayed,
        // Add other fields as needed to match your saveGameData interface
        unlockedSkins: [],
        dailyChallengeCompleted: false,
        lastDailyChallengeDate: '',
      });
    }, 300); // 300ms debounce
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    themeState.coins, 
    themeState.currentTheme, 
    themeState.unlockedThemes,
    themeState.challengeProgress,
    themeState.currentUnlockedLevel,
    themeState.highScores,
    themeState.totalGamesPlayed
  ]);

  const spendCoins = (amount: number) => {
    dispatch({ type: 'SPEND_COINS', amount });
  };

  const addCoins = (amount: number) => {
    dispatch({ type: 'ADD_COINS', amount });
  };

  const unlockTheme = (themeId: string) => {
    dispatch({ type: 'UNLOCK_THEME', themeId });
  };

  const setCurrentTheme = (themeId: string) => {
    dispatch({ type: 'SET_CURRENT_THEME', themeId });
  };

  const updateThemeState = (newState: Partial<ThemeState>) => {
    dispatch({ type: 'UPDATE_STATE', newState });
  };

  const updateChallengeProgress = (levelId: number, progress: Partial<ChallengeLevel>) => {
    dispatch({ type: 'UPDATE_CHALLENGE_PROGRESS', levelId, progress });
  };

  const completeChallengeLevel = (levelId: number, stars: number, score: number, isNewStars: boolean): number => {
    const currentLevel = themeState.challengeProgress[levelId];
    const previousStars = currentLevel?.stars || 0;
    const newStarsEarned = Math.max(0, stars - previousStars);
    
    dispatch({ type: 'COMPLETE_CHALLENGE_LEVEL', levelId, stars, score });
    
    // Calculate coin reward
    let coinsEarned = 0;
    if (isNewStars && newStarsEarned > 0) {
      // Base coins for level: Level 1 = 100, Level 2 = 150, etc.
      const baseCoinsPerLevel = 100 + (levelId - 1) * 50;
      coinsEarned = Math.floor((baseCoinsPerLevel * stars) / 3); // Scale based on stars earned
    }
    
    if (coinsEarned > 0) {
      dispatch({ type: 'ADD_COINS', amount: coinsEarned });
    }
    
    return coinsEarned;
  };

  const getCurrentUnlockedLevel = (): number => {
    return themeState.currentUnlockedLevel;
  };

  const updateHighScore = (mode: GameMode, score: number): boolean => {
    const currentHighScore = themeState.highScores[mode] || 0;
    const isNewHighScore = score > currentHighScore;
    
    if (isNewHighScore) {
      dispatch({ type: 'UPDATE_HIGH_SCORE', mode, score });
    }
    
    return isNewHighScore;
  };

  const getHighScore = (mode: GameMode): number => {
    return themeState.highScores[mode] || 0;
  };

  const incrementGamesPlayed = () => {
    dispatch({ type: 'INCREMENT_GAMES_PLAYED' });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeState,
        spendCoins,
        addCoins,
        unlockTheme,
        setCurrentTheme,
        updateThemeState,
        updateChallengeProgress,
        completeChallengeLevel,
        getCurrentUnlockedLevel,
        updateHighScore,
        incrementGamesPlayed,
        getHighScore,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};