import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  runOnJS,
  cancelAnimation,
  Easing
} from 'react-native-reanimated';
import { Background } from '../../components/Background';
import { Block } from '../../components/Block';
import { GameUI } from '../../components/GameUI';
import { TimeAttackUI } from '../../components/TimeAttackUI';
import { ChallengeUI } from '../../components/ChallengeUI';
import { GameOverScreen } from '../../components/GameOverScreen';
import { ModeSelector } from '../../components/ModeSelector';
import { PauseMenu } from '../../components/PauseMenu';
import { DailyChallengeModal } from '../../components/DailyChallengeModal';
import { ThemeSelector } from '../../components/ThemeSelector';
import { BlockShapeSelector } from '../../components/BlockShapeSelector';
import { useGameState } from '../../hooks/useGameState';
import { useHighScore } from '../../hooks/useHighScore';
import { useTheme } from '../../contexts/GameContext';
import { useSoundManager } from '../../hooks/useSoundManager';
import { GAME_CONFIG, ANIMATION_CONFIG, CHALLENGE_LEVELS, THEMES } from '../../constants/game';
import { GameMode, ChallengeLevel, DailyChallenge } from '../../types/game';
import { generateDailyChallenge, calculateChallengeStars } from '../../utils/gameLogic';
import { saveGameData, loadGameData, saveScore } from '../../utils/storage';

// Optimize animation frame rate for Android
// Optimized animation constants for higher speeds
const ANIMATION_FRAME_RATE = 60;
const TARGET_FRAME_TIME = 1000 / ANIMATION_FRAME_RATE; // ~16.67ms for 60fps
const MAX_DELTA_TIME = TARGET_FRAME_TIME * 2; // Prevent large jumps
const POSITION_UPDATE_THRESHOLD = 0.5; // Lower threshold for smoother movement

// Game flow states
type GameFlow = 'mode_select' | 'playing' | 'paused' | 'game_over';

export default function StackTowerGame() {
  const params = useLocalSearchParams();
  const {
    gameState,
    startGame,
    dropBlock,
    resetGame,
    updateCurrentBlockPosition,
    updateTimer,
    setGameState,
  } = useGameState();

  const { highScore, updateHighScore } = useHighScore();
  const {
    themeState,
    spendCoins,
    addCoins,
    unlockTheme,
    setCurrentTheme,
    unlockBlockShape,
    setCurrentBlockShape,
    updateThemeState,
    completeChallengeLevel,
    getCurrentUnlockedLevel,
    updateHighScore: updateContextHighScore,
    getHighScore
  } = useTheme();

  // Sound management
  const { playSound, stopAllSounds, soundEnabled, toggleSound } = useSoundManager();

  // Refs and animated values
  const animationRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<number | null>(null);
  const cameraY = useSharedValue(0);
  const cameraScale = useSharedValue(1);

  // UI State
  const [gameFlow, setGameFlow] = useState<GameFlow>('mode_select');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedLevel, setSelectedLevel] = useState<ChallengeLevel | undefined>(undefined);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showBlockShapeSelector, setShowBlockShapeSelector] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [coinsEarnedThisGame, setCoinsEarnedThisGame] = useState(0);
  const [challengeStarsEarned, setChallengeStarsEarned] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [previousHighScore, setPreviousHighScore] = useState(0);

  // Performance optimization: Use refs for animation control
  const isAnimatingRef = useRef(false);
  const lastFrameTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0); // For consistent frame timing

  // Handle navigation from challenges screen
  useEffect(() => {
    if (params.mode === 'challenge' && params.levelId && params.autoStart === 'true') {
      const levelId = parseInt(params.levelId as string);
      const challengeLevel = CHALLENGE_LEVELS.find(l => l.id === levelId);

      if (challengeLevel) {
        setSelectedMode('challenge');
        setSelectedLevel(challengeLevel);
        startGame('challenge', challengeLevel);
      }
    }
    // only run when these specific values change
  }, [params.mode, params.levelId, params.autoStart]);

  // Handle app state changes for better performance
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Pause animations, save state, and stop sounds when app goes to background
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setIsPaused(true);

        // Stop all sounds when app goes to background
        stopAllSounds();

        // Save current game state
        runOnJS(() => {
          saveGameData({
            ...gameState,
            coins: themeState.coins,
            currentTheme: themeState.currentTheme,
            unlockedThemes: themeState.unlockedThemes,
          });
        })();
      } else if (nextAppState === 'active' && gameState.gameStarted && !gameState.gameOver) {
        // Resume animations when app becomes active
        setIsPaused(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [gameState, themeState, stopAllSounds]);

  // Load saved game data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await loadGameData();
      if (Object.keys(savedData).length > 0) {
        setGameState(prev => ({ ...prev, ...savedData }));
        updateThemeState({
          coins: savedData.coins || 0,
          currentTheme: savedData.currentTheme || 'default',
          unlockedThemes: savedData.unlockedThemes || ['default'],
        });
        setIsDataLoaded(true);
      }

      // Check for daily challenge
      const today = new Date().toDateString();
      if (savedData.lastDailyChallengeDate !== today) {
        const challenge = generateDailyChallenge();
        setDailyChallenge(challenge);
        setShowDailyChallenge(true);
      }
    };

    loadSavedData();
  }, []);

  // Optimized save with debouncing
  const saveGameDataDebounced = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save game data when relevant state changes
  useEffect(() => {
    if (!isDataLoaded) return; // ⬅ prevent overwriting before load
    // Debounce saves to prevent excessive storage operations
    if (saveGameDataDebounced.current) {
      clearTimeout(saveGameDataDebounced.current);
    }

    saveGameDataDebounced.current = setTimeout(() => {
      saveGameData({
        coins: themeState.coins,
        currentTheme: themeState.currentTheme,
        unlockedThemes: themeState.unlockedThemes,
        unlockedSkins: gameState.unlockedSkins,
        dailyChallengeCompleted: gameState.dailyChallengeCompleted,
        lastDailyChallengeDate: gameState.lastDailyChallengeDate,
        challengeProgress: themeState.challengeProgress,
        currentUnlockedLevel: themeState.currentUnlockedLevel,
        highScores: themeState.highScores,
        totalGamesPlayed: themeState.totalGamesPlayed,
      });
    }, 1500); // 500ms debounce

    return () => {
      if (saveGameDataDebounced.current) {
        clearTimeout(saveGameDataDebounced.current);
      }
    };
  }, [
    themeState.coins,
    themeState.currentTheme,
    themeState.unlockedThemes,
    gameState.dailyChallengeCompleted,
    gameState.lastDailyChallengeDate,
    themeState.challengeProgress,
    themeState.currentUnlockedLevel,
    themeState.highScores,
    themeState.totalGamesPlayed,
  ]);

  // Handle game state changes and flow transitions
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !isPaused) {
      setGameFlow('playing');
    } else if (gameState.gameStarted && !gameState.gameOver && isPaused) {
      setGameFlow('paused');
    } else if (gameState.gameOver) {
      setGameFlow('game_over');
      setIsPaused(false); // Reset pause state when game ends
    } else {
      setGameFlow('mode_select');
      setIsPaused(false); // Reset pause state when returning to menu
    }
  }, [gameState.gameStarted, gameState.gameOver, isPaused]);
  
  // Timer for time attack mode
  useEffect(() => {
    if ((gameState.mode === 'timeAttack' || (gameState.mode === 'challenge' && gameState.timeRemaining !== undefined)) && 
        gameState.gameStarted && !gameState.gameOver && !isPaused) {
      timerRef.current = setInterval(updateTimer, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState.mode, gameState.gameStarted, gameState.gameOver, isPaused, updateTimer]);

  // Optimized animation loop with frame rate control
  // Animate moving block
  // Optimized animation loop with interpolation for higher speeds
  useEffect(() => {
    if (!gameState.currentBlock || !gameState.currentBlock.isMoving) return;

    isAnimatingRef.current = true;
    lastFrameTimeRef.current = performance.now();
    accumulatedTimeRef.current = 0;

    const animateBlock = (currentTime: number) => {
      if (!isAnimatingRef.current || !gameState.currentBlock) return;

      const deltaTime = Math.min(currentTime - lastFrameTimeRef.current, MAX_DELTA_TIME);
      lastFrameTimeRef.current = currentTime;
      accumulatedTimeRef.current += deltaTime;

      // Fixed timestep for consistent movement at high speeds
      while (accumulatedTimeRef.current >= TARGET_FRAME_TIME) {
        const block = gameState.currentBlock;
        if (!block) break;

        let newX = block.x;
        let newDirection = block.direction;

        // Calculate movement with sub-pixel precision for smoothness
        const moveDistance = block.speed * (TARGET_FRAME_TIME / 16.67); // Normalize to 60fps baseline

        if (block.direction === 'right') {
          newX += moveDistance;
          if (newX + block.width >= GAME_CONFIG.SCREEN_WIDTH) {
            newDirection = 'left';
            newX = GAME_CONFIG.SCREEN_WIDTH - block.width;
          }
        } else {
          newX -= moveDistance;
          if (newX <= 0) {
            newDirection = 'right';
            newX = 0;
          }
        }

        // Update position with lower threshold for smoother movement
        if (Math.abs(newX - block.x) > POSITION_UPDATE_THRESHOLD || newDirection !== block.direction) {
          updateCurrentBlockPosition(newX, newDirection);
        }

        accumulatedTimeRef.current -= TARGET_FRAME_TIME;
      }

      if (gameState.gameStarted && !gameState.gameOver && !isPaused && isAnimatingRef.current) {
        animationRef.current = requestAnimationFrame(animateBlock);
      }
    };

    animationRef.current = requestAnimationFrame(animateBlock);

    return () => {
      isAnimatingRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.currentBlock, gameState.gameStarted, gameState.gameOver, isPaused, updateCurrentBlockPosition]);


  // Optimized camera animation with reduced frequency
  // Camera animation based on tower height
  // Optimized camera animation with faster response for high-speed gameplay
  useEffect(() => {
    const blockHeight = 40;
    const screenHeight = GAME_CONFIG.SCREEN_HEIGHT || 800;
    const halfScreenHeight = screenHeight / 2;
    const currentTowerHeightPixels = gameState.tower_height * blockHeight;

    let targetY = 0;
    let targetScale = 1;

    if (currentTowerHeightPixels > halfScreenHeight) {
      const excessHeight = currentTowerHeightPixels - halfScreenHeight;
      // Faster camera movement for high-speed gameplay
      const fastMovementFactor = 0.7; // Increased from 0.5
      targetY = excessHeight * fastMovementFactor;
      targetScale = Math.max(0.85, 1 - (excessHeight / screenHeight) * 0.15); // More zoom for better visibility
    }

    // Faster camera transitions for responsive feel
    cameraY.value = withTiming(targetY, {
      duration: 400, // Reduced from 600ms
      easing: Easing.out(Easing.cubic) // Smoother easing
    });
    cameraScale.value = withTiming(targetScale, {
      duration: 400, // Reduced from 600ms
      easing: Easing.out(Easing.cubic)
    });
  }, [gameState.tower_height]);

  // Enhanced game over handling with sound effects
  useEffect(() => {
    if (gameState.gameOver && gameState.score > 0 && !gameState.rewardsGranted) {
      // Get current high score for this mode
      const currentHighScore = getHighScore(gameState.mode);
      setPreviousHighScore(currentHighScore);
      
      // Update high score and check if it's new
      const isNewHighScore = updateContextHighScore(gameState.mode, gameState.score);

      // Also update the legacy high score hook for backward compatibility
      updateHighScore(gameState.score);

      // Save score record
      saveScore({
        mode: gameState.mode,
        score: gameState.score,
        date: new Date().toISOString(),
        level: gameState.level,
        blocks: gameState.tower_height - 1,
      });

      let totalCoinsEarned = 0;
      let starsEarned = 0;
      let challengeCompleted = false;

      // Handle challenge mode completion with sounds
      if (gameState.mode === 'challenge' && selectedLevel) {
        const blocksStacked = gameState.tower_height - 1;
        const perfectBlocks = gameState.combo; // This should be tracked properly
        challengeCompleted = blocksStacked >= selectedLevel.targetBlocks;

        if (challengeCompleted) {
          starsEarned = calculateChallengeStars(
            selectedLevel,
            gameState.score,
            blocksStacked,
            perfectBlocks,
            challengeCompleted
          );

          const previousStars = themeState.challengeProgress[selectedLevel.id]?.stars || 0;
          const isNewStars = starsEarned > previousStars;

          const challengeCoins = completeChallengeLevel(
            selectedLevel.id,
            starsEarned,
            gameState.score,
            isNewStars
          );

          totalCoinsEarned += challengeCoins;
          setChallengeStarsEarned(starsEarned);

          // Play success sound for challenge completion
          playSound('success', 0.9);
        } else {
          // Play failed sound for challenge failure
          playSound('failed', 0.8);
        }
      } else {
        // Award coins for other modes
        const coinsEarned = Math.floor(gameState.score / 1000) + Math.floor(gameState.combo / 2);
        if (coinsEarned > 0) {
          addCoins(coinsEarned);
          totalCoinsEarned += coinsEarned;
        }

        // Play appropriate sound based on high score
        if (isNewHighScore) {
          playSound('success', 0.9); // New high score
        } else {
          playSound('failed', 0.6); // Regular game over
        }
      }

      // Check daily challenge completion
      if (dailyChallenge && !gameState.dailyChallengeCompleted) {
        const challengeMet = checkDailyChallengeCompletion();
        if (challengeMet) {
          addCoins(dailyChallenge.reward);
          totalCoinsEarned += dailyChallenge.reward;
          playSound('chime', 0.8); // Daily challenge completed
        }
      }

      setCoinsEarnedThisGame(totalCoinsEarned);
      setGameState(prev => ({ ...prev, rewardsGranted: true }));
    }
  }, [gameState.gameOver, gameState.score, updateHighScore, addCoins, completeChallengeLevel, playSound, updateContextHighScore, getHighScore]);

  const checkDailyChallengeCompletion = (): boolean => {
    if (!dailyChallenge) return false;
    const blocksStacked = gameState.tower_height - 1;

    if (blocksStacked >= dailyChallenge.targetBlocks) {
      if (dailyChallenge.perfectBlocksRequired) {
        return gameState.combo >= dailyChallenge.perfectBlocksRequired;
      }
      return true;
    }
    return false;
  };
  // Memoized camera style to prevent unnecessary recalculations
  const cameraStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: cameraY.value },
        { scale: cameraScale.value },
      ],
    };
  }, []);

  // Game flow handlers with sound integration
  const handleModeSelect = (mode: GameMode) => {
    playSound('button', 0.7); // Play button sound on mode selection
    setSelectedMode(mode);

    if (mode === 'challenge') {
      const currentUnlockedLevel = getCurrentUnlockedLevel();
      const firstAvailableLevel = CHALLENGE_LEVELS.find(l => l.id === currentUnlockedLevel) || CHALLENGE_LEVELS[0];
      setSelectedLevel(firstAvailableLevel);
      startGame(mode, firstAvailableLevel);
    } else {
      setSelectedLevel(undefined);
      startGame(mode);
    }
  };

  const handlePlayAgain = () => {
    playSound('button', 0.7); // Play button sound

    // Reset camera
    cancelAnimation(cameraY);
    cancelAnimation(cameraScale);
    cameraY.value = withTiming(0, { duration: 300 });
    cameraScale.value = withTiming(1, { duration: 300 });

    // Reset coins and stars earned counters
    setCoinsEarnedThisGame(0);
    setChallengeStarsEarned(0);

    // Start same game mode
    if (selectedMode === 'challenge' && selectedLevel) {
      startGame(selectedMode, selectedLevel);
    } else {
      startGame(selectedMode);
    }
  };

  const handlePlayNextLevel = () => {
    playSound('button', 0.7); // Play button sound

    if (selectedMode === 'challenge' && selectedLevel) {
      const nextLevel = CHALLENGE_LEVELS.find(l => l.id === selectedLevel.id + 1);
      if (nextLevel) {
        setSelectedLevel(nextLevel);

        // Reset camera
        cancelAnimation(cameraY);
        cancelAnimation(cameraScale);
        cameraY.value = withTiming(0, { duration: 300 });
        cameraScale.value = withTiming(1, { duration: 300 });

        // Reset counters
        setCoinsEarnedThisGame(0);
        setChallengeStarsEarned(0);

        startGame(selectedMode, nextLevel);
      }
    }
  };

  const handleBackToModeSelect = () => {
    playSound('button', 0.7); // Play button sound

    // Reset everything
    resetGame();
    cancelAnimation(cameraY);
    cancelAnimation(cameraScale);
    cameraY.value = withTiming(0, { duration: 300 });
    cameraScale.value = withTiming(1, { duration: 300 });
    setCoinsEarnedThisGame(0);
    setChallengeStarsEarned(0);
    setGameFlow('mode_select');
  };

  const handleScreenTap = () => {
    if (gameFlow === 'playing' && gameState.currentBlock && gameState.currentBlock.isMoving && !isPaused) {
      dropBlock();
    }
  };

  // Pause/Resume handlers with sound
  const handlePause = () => {
    playSound('button', 0.7); // Play button sound
    setIsPaused(true);
  };

  const handleResume = () => {
    playSound('button', 0.7); // Play button sound
    setIsPaused(false);
  };

  const handlePauseRestart = () => {
    playSound('button', 0.7); // Play button sound

    // Reset camera
    cancelAnimation(cameraY);
    cancelAnimation(cameraScale);
    cameraY.value = withTiming(0, { duration: 300 });
    cameraScale.value = withTiming(1, { duration: 300 });

    // Reset coins earned counter
    setCoinsEarnedThisGame(0);
    setChallengeStarsEarned(0);

    // Reset pause state
    setIsPaused(false);

    // Start same game mode
    if (selectedMode === 'challenge' && selectedLevel) {
      startGame(selectedMode, selectedLevel);
    } else {
      startGame(selectedMode);
    }
  };

  const handlePauseHome = () => {
    playSound('button', 0.7); // Play button sound

    // Reset everything
    resetGame();
    cancelAnimation(cameraY);
    cancelAnimation(cameraScale);
    cameraY.value = withTiming(0, { duration: 300 });
    cameraScale.value = withTiming(1, { duration: 300 });
    setCoinsEarnedThisGame(0);
    setChallengeStarsEarned(0);
    setIsPaused(false);
    setGameFlow('mode_select');
  };

  const handleThemePurchase = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme && themeState.coins >= theme.cost) {
      playSound('purchase', 0.8); // Play purchase sound
      spendCoins(theme.cost);
      unlockTheme(themeId);
      setCurrentTheme(themeId);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    playSound('click', 0.6); // Play click sound for theme selection
    setCurrentTheme(themeId);
  };

  const handleDailyChallengeAccept = () => {
    playSound('button', 0.7); // Play button sound
    if (dailyChallenge) {
      setSelectedMode('classic');
      startGame('classic');
      setShowDailyChallenge(false);
    }
  };

  const handleThemePress = () => {
    playSound('button', 0.7); // Play button sound
    setShowThemeSelector(true);
  };

  const handleShapePress = () => {
    playSound('button', 0.7); // Play button sound
    setShowBlockShapeSelector(true);
  };

  const handleCloseModals = () => {
    playSound('click', 0.5); // Play subtle click sound
    setShowThemeSelector(false);
    setShowDailyChallenge(false);
    setShowBlockShapeSelector(false);
  };

  const getCurrentChallengeLevel = (): ChallengeLevel | undefined => {
    if (gameState.mode === 'challenge' && gameState.level) {
      return CHALLENGE_LEVELS.find(l => l.id === gameState.level);
    }
    return undefined;
  };

  // Check if next level exists
  const hasNextLevel = () => {
    if (selectedMode === 'challenge' && selectedLevel) {
      return CHALLENGE_LEVELS.some(l => l.id === selectedLevel.id + 1);
    }
    return false;
  };

  // Memoize expensive calculations
  const unlockedThemesList = React.useMemo(() =>
    THEMES.filter(theme =>
      themeState.unlockedThemes.includes(theme.id)
    ).map(theme => ({
      ...theme,
      unlocked: true,
    })), [themeState.unlockedThemes]
  );

  const renderGameUI = () => {
    const commonProps = {
      gameStarted: true,
      onPause: handlePause,
    };

    switch (gameState.mode) {
      case 'timeAttack':
        return (
          <TimeAttackUI
            timeRemaining={gameState.timeRemaining || 0}
            totalTime={GAME_CONFIG.TIME_ATTACK_DURATION}
            score={gameState.score}
            combo={gameState.combo}
            {...commonProps}
          />
        );
      case 'challenge':
        const challengeLevel = getCurrentChallengeLevel();
        if (challengeLevel) {
          return (
            <ChallengeUI
              level={challengeLevel}
              currentBlocks={gameState.tower_height - 1}
              score={gameState.score}
              combo={gameState.combo}
              timeRemaining={gameState.timeRemaining}
              {...commonProps}
            />
          );
        }
        break;
      default:
        return (
          <GameUI
            score={gameState.score}
            combo={gameState.combo}
            {...commonProps}
          />
        );
    }
  };

  // Determine if challenge level was completed
  const isChallengeCompleted = () => {
    if (gameState.mode === 'challenge' && selectedLevel) {
      return (gameState.tower_height - 1) >= selectedLevel.targetBlocks;
    }
    return false;
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenTap}>
      <View style={styles.container}>
        <Background towerHeight={gameState.tower_height} themeId={themeState.currentTheme} />

        <Animated.View style={[styles.gameArea, cameraStyle]}>
          {/* Static blocks */}
          {gameState.currentBlock && gameState.blocks.map((block) => (
            <Block 
              key={block.id} 
              block={block} 
              themeId={themeState.currentTheme}
              shapeId={themeState.currentBlockShape}
            />
          ))}

          {/* Moving block */}
          {gameState.currentBlock && (
            <Block 
              block={gameState.currentBlock} 
              themeId={themeState.currentTheme}
              shapeId={themeState.currentBlockShape}
            />
          )}
        </Animated.View>

        {/* Render UI based on game flow */}
        {gameFlow === 'mode_select' && (
          <ModeSelector
            visible={true}
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
            onClose={() => { }}
            coins={themeState.coins}
            onThemePress={handleThemePress}
            onShapePress={handleShapePress}
            showAsMainMenu={true}
            setSelectedMode={setSelectedMode}
            currentTheme={themeState.currentTheme}
            currentBlockShape={themeState.currentBlockShape}
          />
        )}

        {gameFlow === 'playing' && renderGameUI()}

        {gameFlow === 'paused' && (
          <PauseMenu
            visible={true}
            onResume={handleResume}
            onRestart={handlePauseRestart}
            onHome={handlePauseHome}
          />
        )}

        {gameFlow === 'game_over' && (
          <GameOverScreen
            visible={true}
            score={gameState.score}
            highScore={getHighScore(gameState.mode)}
            mode={gameState.mode}
            coinsEarned={coinsEarnedThisGame}
            challengeStars={challengeStarsEarned}
            challengeCompleted={isChallengeCompleted()}
            hasNextLevel={hasNextLevel()}
            onPlayAgain={handlePlayAgain}
            onPlayNextLevel={handlePlayNextLevel}
            onModeSelect={handleBackToModeSelect}
            onShare={() => {
              playSound('button', 0.7);
              /* Implement sharing */
            }}
          />
        )}

        <ThemeSelector
          visible={showThemeSelector}
          themes={unlockedThemesList}
          currentTheme={themeState.currentTheme}
          coins={themeState.coins}
          onThemeSelect={handleThemeSelect}
          onThemePurchase={handleThemePurchase}
          onClose={handleCloseModals}
        />

        <BlockShapeSelector
          visible={showBlockShapeSelector}
          currentShape={themeState.currentBlockShape}
          unlockedShapes={themeState.unlockedBlockShapes}
          currentTheme={themeState.currentTheme}
          onShapeSelect={(shapeId) => {
            playSound('button', 0.7);
            setCurrentBlockShape(shapeId);
          }}
          onClose={handleCloseModals}
        />

        <DailyChallengeModal
          visible={showDailyChallenge}
          challenge={dailyChallenge}
          onAccept={handleDailyChallengeAccept}
          onClose={handleCloseModals}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
});