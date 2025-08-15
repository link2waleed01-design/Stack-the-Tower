import { useState, useCallback, useRef } from 'react';
import { runOnJS } from 'react-native-reanimated';
import { GameState, Block, GameMode, ChallengeLevel } from '../types/game';
import { createInitialBlock, createNewBlock, calculateCollision, calculateScore } from '../utils/gameLogic';
import { GAME_CONFIG, CHALLENGE_LEVELS } from '../constants/game';
import { saveGameData } from '../utils/storage';
import { useSoundManager } from './useSoundManager';

export const useGameState = () => {
  const { playSound } = useSoundManager();
  const soundPlayedRef = useRef<Set<string>>(new Set());
  
  const [gameState, setGameState] = useState<GameState>({
    blocks: [createInitialBlock()],
    score: 0,
    combo: 0,
    perfectBlocks: 0,
    gameOver: false,
    gameStarted: false,
    tower_height: 1,
    currentBlock: null,
    highScore: 0,
    mode: 'classic',
    coins: 0,
    currentTheme: 'default',
    unlockedThemes: ['default'],
    unlockedSkins: [],
    dailyChallengeCompleted: false,
    lastDailyChallengeDate: '',
    rewardsGranted: false,
  });

  // Reset sound tracking when game starts
  const startGame = useCallback((mode: GameMode = 'classic', level?: ChallengeLevel) => {
    soundPlayedRef.current.clear();
    
    const initialBlock = createInitialBlock();
    const firstMovingBlock = createNewBlock(initialBlock, 1, mode, level);

    setGameState(prev => ({
      ...prev,
      blocks: [initialBlock],
      score: 0,
      combo: 0,
      perfectBlocks: 0,
      gameOver: false,
      gameStarted: true,
      tower_height: 1,
      currentBlock: firstMovingBlock,
      mode,
      level: level?.id,
      timeRemaining: mode === 'timeAttack' ? GAME_CONFIG.TIME_ATTACK_DURATION : level?.timeLimit,
      rewardsGranted: false,
    }));

    // Save game state immediately when starting
    runOnJS(() => {
      saveGameData({
        mode,
        level: level?.id,
        gameStarted: true,
      });
    })();
  }, []);

  const dropBlock = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentBlock || prev.gameOver) return prev;

      const topBlock = prev.blocks[prev.blocks.length - 1];
      const collision = calculateCollision(prev.currentBlock, topBlock);

      // Always play click sound when block is dropped
      runOnJS(() => {
        playSound('click', 0.6);
      })();

      if (collision.newWidth <= 0) {
        // Game over - play failed sound
        runOnJS(() => {
          playSound('failed', 0.8);
        })();

        return {
          ...prev,
          gameOver: true,
          currentBlock: null,
          gameStarted: false
        };
      }

      const newBlock: Block = {
        ...prev.currentBlock,
        x: collision.newX,
        width: collision.newWidth,
        isMoving: false,
      };

      const newCombo = collision.isPerfect ? prev.combo + 1 : 0;
      const newPerfectBlocks = collision.isPerfect ? prev.perfectBlocks + 1 : prev.perfectBlocks;
      const scoreIncrease = calculateScore(prev.tower_height, newCombo, collision.isPerfect, prev.mode);

      // Always play sound based on collision quality
      runOnJS(() => {
        if (collision.isPerfect) {
          playSound('chime', 0.7);
        } else if (collision.collisionAccuracy > 0.7) {
          playSound('drop', 0.5);
        } else {
          playSound('drop', 0.3);
        }
      })();

      // Check if challenge/time attack mode objectives are met
      const isComplete = checkModeCompletion(prev, newBlock);

      if (isComplete) {
        // Challenge/time attack completed - play success sound
        runOnJS(() => {
          playSound('success', 0.8);
        })();

        return {
          ...prev,
          blocks: [...prev.blocks, newBlock],
          currentBlock: null,
          score: prev.score + scoreIncrease,
          combo: newCombo,
          perfectBlocks: newPerfectBlocks,
          tower_height: prev.tower_height + 1,
          gameOver: true,
          gameStarted: false
        };
      }

      const nextMovingBlock = createNewBlock(
        newBlock,
        prev.tower_height + 1,
        prev.mode,
        prev.level ? CHALLENGE_LEVELS.find(l => l.id === prev.level) : undefined
      );

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        currentBlock: nextMovingBlock,
        score: prev.score + scoreIncrease,
        combo: newCombo,
        perfectBlocks: newPerfectBlocks,
        tower_height: prev.tower_height + 1,
      };
    });
  }, [playSound]);

  const checkModeCompletion = (state: GameState, newBlock: Block): boolean => {
    if (state.mode === 'challenge' && state.level) {
      const challengeLevel = CHALLENGE_LEVELS.find(l => l.id === state.level);
      if (challengeLevel && state.tower_height >= challengeLevel.targetBlocks) {
        return true;
      }
    }
    return false;
  };

  // Fixed timer update to properly decrement time
  const updateTimer = useCallback(() => {
    setGameState(prev => {
      if (prev.mode !== 'timeAttack' && !(prev.mode === 'challenge' && prev.timeRemaining !== undefined)) {
        return prev;
      }
      
      if (!prev.gameStarted || prev.gameOver) return prev;

      const newTime = Math.max(0, (prev.timeRemaining || 0) - 1);

      if (newTime <= 0) {
        // Time up - play failed sound
        runOnJS(() => {
          playSound('failed', 0.8);
        })();

        return {
          ...prev,
          timeRemaining: 0,
          gameOver: true,
          currentBlock: null,
          gameStarted: false
        };
      }

      // Play warning sound when time is low
      if (newTime === 10 || newTime === 5 || newTime === 3) {
        runOnJS(() => {
          playSound('click', 0.8);
        })();
      }

      return {
        ...prev,
        timeRemaining: newTime,
      };
    });
  }, [playSound]);

  // Batch state updates for better performance
  const resetGame = useCallback(() => {
    soundPlayedRef.current.clear();
    
    setGameState(prev => ({
      ...prev,
      blocks: [createInitialBlock()],
      score: 0,
      combo: 0,
      perfectBlocks: 0,
      gameOver: false,
      gameStarted: false,
      tower_height: 1,
      currentBlock: null,
      timeRemaining: undefined,
      level: 1,
      rewardsGranted: false,
    }));

    // Save reset state
    runOnJS(() => {
      saveGameData({
        gameStarted: false,
        gameOver: false,
        score: 0,
      });
    })();
  }, []);

  // Optimized position updates with reduced state changes
  const updateCurrentBlockPosition = useCallback((newX: number, newDirection?: 'left' | 'right') => {
    setGameState(prev => {
      if (!prev.currentBlock) return prev;

      // Only update if position actually changed significantly
      const positionChanged = Math.abs(prev.currentBlock.x - newX) > 0.5;
      const directionChanged = newDirection && prev.currentBlock.direction !== newDirection;
      
      if (!positionChanged && !directionChanged) return prev;

      return {
        ...prev,
        currentBlock: {
          ...prev.currentBlock,
          x: newX,
          ...(newDirection && { direction: newDirection }),
        },
      };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }, []);

  const spendCoins = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - amount),
    }));
  }, []);

  const unlockTheme = useCallback((themeId: string) => {
    setGameState(prev => ({
      ...prev,
      unlockedThemes: [...prev.unlockedThemes, themeId],
    }));
  }, []);

  const setCurrentTheme = useCallback((themeId: string) => {
    setGameState(prev => ({
      ...prev,
      currentTheme: themeId,
    }));
  }, []);

  const completeDailyChallenge = useCallback(() => {
    const today = new Date().toDateString();
    setGameState(prev => ({
      ...prev,
      dailyChallengeCompleted: true,
      lastDailyChallengeDate: today,
    }));
  }, []);

  return {
    gameState,
    startGame,
    dropBlock,
    resetGame,
    updateCurrentBlockPosition,
    updateTimer,
    addCoins,
    spendCoins,
    unlockTheme,
    setCurrentTheme,
    completeDailyChallenge,
    setGameState,
  };
};