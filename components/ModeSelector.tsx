import React, { useEffect, useState } from 'react';
import { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
  interpolate,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Infinity, Clock, Target, Lock, Palette, Coins, Settings, Zap, Trophy, Star, Gamepad2, Box } from 'lucide-react-native';
import { GameMode, GameModeConfig } from '../types/game';
import { GAME_MODES, THEMES, BLOCK_SHAPES } from '../constants/game';
import { getBlockColors } from '../utils/gameLogic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModeSelectorProps {
  selectedMode: GameMode;
  visible: boolean;
  onModeSelect: (mode: GameMode) => void;
  onClose: () => void;
  coins?: number;
  onThemePress?: () => void;
  onShapePress?: () => void;
  showAsMainMenu?: boolean;
  setSelectedMode?: (mode: GameMode) => void;
  currentTheme?: string;
  currentBlockShape?: string;
}

const ModeIcon = ({ mode, size = 32, color = '#fff' }: { mode: GameMode; size?: number; color?: string }) => {
  switch (mode) {
    case 'classic':
      return <Infinity size={size} color={color} />;
    case 'timeAttack':
      return <Clock size={size} color={color} />;
    case 'challenge':
      return <Target size={size} color={color} />;
    default:
      return <Infinity size={size} color={color} />;
  }
};

// Animated Block Component for Home Screen with Shape Support
const AnimatedBlock = ({ 
  width, 
  height = 32, 
  x, 
  y, 
  colors, 
  delay = 0, 
  themeId = 'default',
  shapeId = 'rectangle'
}: {
  width: number;
  height?: number;
  x: number;
  y: number;
  colors: readonly [string, string];
  delay?: number;
  themeId?: string;
  shapeId?: string;
}) => {
  const scaleValue = useSharedValue(0);
  const glowValue = useSharedValue(0);

  useEffect(() => {
    scaleValue.value = withDelay(
      delay,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    glowValue.value = withDelay(
      delay + 200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = scaleValue.value;
    const glow = glowValue.value;
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
      ],
      shadowOpacity: themeId === 'neon' || themeId === 'galaxy' ? glow * 0.8 : 0.3,
    };
  });

  const getBorderColor = () => {
    switch (themeId) {
      case 'neon': return 'rgba(0, 255, 255, 0.6)';
      case 'volcanic': return 'rgba(255, 69, 0, 0.6)';
      case 'arctic': return 'rgba(135, 206, 235, 0.6)';
      case 'galaxy': return 'rgba(147, 112, 219, 0.6)';
      case 'diamond': return 'rgba(192, 192, 192, 0.8)';
      case 'golden': return 'rgba(255, 215, 0, 0.8)';
      default: return 'rgba(255, 255, 255, 0.4)';
    }
  };

  // Render shaped block if not rectangle
  if (shapeId !== 'rectangle') {
    const blockShape = BLOCK_SHAPES.find(shape => shape.id === shapeId);
    if (blockShape) {
      const scaleX = width / blockShape.preview.width;
      const scaleY = height / blockShape.preview.height;

      return (
        <Animated.View
          style={[
            styles.animatedBlock,
            {
              width,
              height,
              shadowColor: themeId === 'neon' ? '#00ffff' : 
                          themeId === 'volcanic' ? '#ff4500' : 
                          themeId === 'golden' ? '#ffd700' : '#000',
            },
            animatedStyle,
          ]}
        >
          {blockShape.preview.elements.map((element, index) => {
            const elementColors = getBlockColors(element.colorIndex, themeId);
            const elementStyle = {
              position: 'absolute' as const,
              left: element.x * scaleX,
              top: element.y * scaleY,
              width: element.width * scaleX,
              height: element.height * scaleY,
            };

            switch (element.type) {
              case 'triangle':
                return (
                  <View
                    key={`${element.id}-${index}`}
                    style={[
                      elementStyle,
                      {
                        width: 0,
                        height: 0,
                        backgroundColor: 'transparent',
                        borderStyle: 'solid',
                        borderLeftWidth: (element.width * scaleX) / 2,
                        borderRightWidth: (element.width * scaleX) / 2,
                        borderBottomWidth: element.height * scaleY,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderBottomColor: elementColors[0],
                      },
                    ]}
                  />
                );
              case 'circle':
                return (
                  <View
                    key={`${element.id}-${index}`}
                    style={[
                      elementStyle,
                      {
                        backgroundColor: elementColors[0],
                        borderRadius: (element.width * scaleX) / 2,
                      },
                    ]}
                  />
                );
              case 'rect':
              default:
                return (
                  <LinearGradient
                    key={`${element.id}-${index}`}
                    colors={[elementColors[0], elementColors[1]]}
                    style={[
                      elementStyle,
                      {
                        borderRadius: (element.borderRadius || 0) * Math.min(scaleX, scaleY),
                      },
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                );
            }
          })}
        </Animated.View>
      );
    }
  }

  // Default rectangular block
  return (
    <Animated.View
      style={[
        styles.animatedBlock,
        {
          width,
          height,
          shadowColor: themeId === 'neon' ? '#00ffff' : 
                      themeId === 'volcanic' ? '#ff4500' : 
                      themeId === 'golden' ? '#ffd700' : '#000',
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[colors[0], colors[1]]}
        style={[
          styles.blockGradient,
          {
            borderColor: getBorderColor(),
            borderWidth: themeId === 'diamond' || themeId === 'golden' ? 2.5 : 2,
          }
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {(themeId === 'diamond' || themeId === 'golden') && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'transparent', 'rgba(255, 255, 255, 0.3)']}
          style={styles.blockShine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
    </Animated.View>
  );
};

// Memoized AnimatedBlock to prevent unnecessary re-renders
const MemoizedAnimatedBlock = memo(AnimatedBlock);

// Enhanced Floating Particles Component
const FloatingParticles = memo(({ themeId = 'default' }: { themeId?: string }) => {
  const particles = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []); // Reduced particles for performance
  
  return (
    <View style={styles.particlesContainer}>
      {particles.map((particle) => {
        const ParticleComponent = () => {
          const translateY = useSharedValue(0);
          const translateX = useSharedValue(0);
          const opacity = useSharedValue(0);
          const scale = useSharedValue(0.5);
          
          useEffect(() => {
            const startAnimation = () => {
              translateY.value = SCREEN_HEIGHT + 50;
              translateX.value = 0;
              opacity.value = 0;
              scale.value = 0.5;
              
              translateY.value = withDelay(
                Math.random() * 4000,
                withTiming(-100, { duration: 8000 + Math.random() * 4000 }) // Reduced duration
              );
              
              translateX.value = withDelay(
                Math.random() * 4000,
                withTiming((Math.random() - 0.5) * 100, { duration: 8000 + Math.random() * 4000 })
              );
              
              opacity.value = withDelay(
                Math.random() * 4000,
                withSequence(
                  withTiming(0.7, { duration: 1000 }),
                  withTiming(0.7, { duration: 6000 }),
                  withTiming(0, { duration: 1000 })
                )
              );

              scale.value = withDelay(
                Math.random() * 4000,
                withTiming(1 + Math.random() * 0.3, { duration: 1500 })
              );
              
              setTimeout(startAnimation, 8000 + Math.random() * 4000);
            };
            
            startAnimation();
          }, []);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [
              { translateY: translateY.value },
              { translateX: translateX.value },
              { scale: scale.value }
            ],
            opacity: opacity.value,
          }));

          const getParticleColor = () => {
            switch (themeId) {
              case 'neon': return '#00ffff';
              case 'volcanic': return '#ff4500';
              case 'galaxy': return '#9370db';
              case 'golden': return '#ffd700';
              case 'diamond': return '#e0e0e0';
              default: return '#ffffff';
            }
          };

          const isSpecialParticle = particle % 6 === 0;

          return (
            <Animated.View
              style={[
                isSpecialParticle ? styles.specialParticle : styles.particle,
                {
                  left: Math.random() * SCREEN_WIDTH,
                  backgroundColor: getParticleColor(),
                },
                animatedStyle,
              ]}
            />
          );
        };
        
        return <ParticleComponent key={particle} />;
      })}
    </View>
  );
});

// Memoize theme styles calculation
const getThemeStyles = useMemo(() => (themeId: string = 'default') => {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const [primaryColor, secondaryColor] = theme.backgroundColors;
  
  return {
    primary: primaryColor,
    secondary: secondaryColor,
    cardOverlay: themeId === 'diamond' || themeId === 'arctic' 
      ? 'rgba(0, 0, 0, 0.15)' 
      : 'rgba(255, 255, 255, 0.15)',
    textPrimary: themeId === 'diamond' || themeId === 'arctic' ? '#333' : '#fff',
    textSecondary: themeId === 'diamond' || themeId === 'arctic' ? '#666' : '#ccc',
    accent: theme.blockColors[0][0],
    glowColor: themeId === 'neon' ? '#00ffff' : 
               themeId === 'volcanic' ? '#ff4500' : 
               themeId === 'galaxy' ? '#9370db' : 
               themeId === 'golden' ? '#ffd700' : theme.blockColors[0][0],
  };
}, []);

const ModeSelectorComponent: React.FC<ModeSelectorProps> = ({
  selectedMode,
  visible,
  onModeSelect,
  onClose,
  coins = 0,
  onThemePress,
  onShapePress,
  showAsMainMenu = false,
  setSelectedMode,
  currentTheme = 'default',
  currentBlockShape = 'rectangle'
}) => {
  const [titleScale] = useState(useSharedValue(0));
  const [stackOffset] = useState(useSharedValue(50));
  const [gamepadGlow] = useState(useSharedValue(0));

  if (!visible) return null;

  useEffect(() => {
    if (showAsMainMenu) {
      titleScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 100 }));
      stackOffset.value = withDelay(600, withSpring(0, { damping: 10, stiffness: 80 }));
      
      // Gamepad glow animation
      gamepadGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [showAsMainMenu]);

  const containerStyle = showAsMainMenu ? styles.mainMenuContainer : styles.modalContainer;
  const overlayStyle = showAsMainMenu ? styles.mainMenuOverlay : styles.modalOverlay;
  const themeStyles = getThemeStyles(currentTheme);

  // Get theme-appropriate block colors for the tower display
  const blockColors = useMemo(() => {
    const currentThemeData = THEMES.find(t => t.id === currentTheme) || THEMES[0];
    return currentThemeData.blockColors;
  }, [currentTheme]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const stackAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: stackOffset.value }],
  }));

  const gamepadAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gamepadGlow.value * 0.8 + 0.2,
    transform: [{ scale: 0.9 + gamepadGlow.value * 0.1 }],
  }));

  return (
    <View style={overlayStyle}>
      {/* Enhanced Floating Particles */}
      {showAsMainMenu && <FloatingParticles themeId={currentTheme} />}
      
      <View style={containerStyle}>
        {/* Top Bar - Coins and Settings */}
        {showAsMainMenu && (
          <View style={styles.topBar}>
            <View style={styles.coinsContainer}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.4)', 'rgba(255, 215, 0, 0.15)']}
                style={[
                  styles.coinsDisplay,
                  currentTheme === 'neon' && styles.neonGlow,
                ]}
              >
                <Coins size={24} color="#FFD700" />
                <Text style={styles.coinsText}>{coins.toLocaleString()}</Text>
                {currentTheme === 'neon' && (
                  <View style={[styles.glowEffect, { shadowColor: '#FFD700' }]} />
                )}
              </LinearGradient>
            </View>
            
            <View style={styles.topRightButtons}>
              <TouchableOpacity onPress={onThemePress} style={styles.settingsButton}>
                <LinearGradient
                  colors={[themeStyles.cardOverlay, 'rgba(255, 255, 255, 0.08)']}
                  style={styles.settingsGradient}
                >
                  <Palette size={24} color={themeStyles.textPrimary} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={onShapePress} style={styles.settingsButton}>
                <LinearGradient
                  colors={[themeStyles.cardOverlay, 'rgba(255, 255, 255, 0.08)']}
                  style={styles.settingsGradient}
                >
                  <Box size={24} color={themeStyles.accent} />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingsButton}>
                <LinearGradient
                  colors={[themeStyles.cardOverlay, 'rgba(255, 255, 255, 0.08)']}
                  style={styles.settingsGradient}
                >
                  <Trophy size={24} color={themeStyles.accent} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Game Title with Animated Tower ABOVE text */}
        {showAsMainMenu && (
          <Animated.View style={[styles.titleSection, titleAnimatedStyle]}>
            {/* Animated Block Stack Display - NOW ABOVE THE TEXT */}
            <Animated.View style={[styles.blockStackContainer, stackAnimatedStyle]}>
              <MemoizedAnimatedBlock
                width={120} //increased by 30
                height={31} //increased by 5
                x={0}
                y={0}
                colors={blockColors[0]}
                delay={800}
                themeId={currentTheme}
                shapeId={currentBlockShape}
              />
              <MemoizedAnimatedBlock
                width={105}
                height={31}
                x={7.5}
                y={-28}
                colors={blockColors[1]}
                delay={1000}
                themeId={currentTheme}
                shapeId={currentBlockShape}
              />
              <MemoizedAnimatedBlock
                width={125}
                height={31}
                x={-2.5}
                y={-56}
                colors={blockColors[2]}
                delay={1200}
                themeId={currentTheme}
                shapeId={currentBlockShape}
              />
              <MemoizedAnimatedBlock
                width={95} 
                height={31}
                x={12.5}
                y={-84}
                colors={blockColors[3]}
                delay={1400}
                themeId={currentTheme}
                shapeId={currentBlockShape}
              />
            </Animated.View>

            {/* Title Text - NOW BELOW THE TOWER */}
            <View style={styles.titleContainer}>
              <Text style={[styles.gameTitle, { color: themeStyles.textPrimary }]}>
                STACK
              </Text>
              <Text style={[styles.gameTitleSecond, { color: themeStyles.accent }]}>
                TOWER
              </Text>
            </View>
            
            <Text style={[styles.gameSubtitle, { color: themeStyles.textSecondary }]}>
              Stack blocks to build the ultimate tower
            </Text>
          </Animated.View>
        )}

        {/* Modal Header */}
        {!showAsMainMenu && (
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Game Mode</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Game Modes - SMALLER CARDS */}
        <ScrollView 
          style={styles.modesContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modesContent}
        >
          {GAME_MODES.map((mode, index) => {
            const isSelected = selectedMode === mode.id;
            return (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.modeCard,
                  isSelected && styles.selectedModeCard,
                  !mode.unlocked && styles.lockedModeCard,
                ]}
                onPress={() => mode.unlocked && (showAsMainMenu ? setSelectedMode?.(mode.id) : onModeSelect(mode.id))}
                disabled={!mode.unlocked}
              >
                <LinearGradient
                  colors={
                    isSelected
                      ? [themeStyles.accent, themeStyles.primary]
                      : mode.unlocked
                      ? [themeStyles.cardOverlay, 'rgba(255, 255, 255, 0.08)']
                      : ['rgba(100, 100, 100, 0.2)', 'rgba(60, 60, 60, 0.2)']
                  }
                  style={[
                    styles.modeCardGradient,
                    isSelected && currentTheme === 'neon' && styles.neonModeCard,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.modeCardContent}>
                    <View style={[
                      styles.modeIconContainer,
                      isSelected && styles.selectedIconContainer,
                    ]}>
                      {mode.unlocked ? (
                        <>
                          <ModeIcon 
                            mode={mode.id} 
                            size={32} 
                            color={isSelected ? '#fff' : themeStyles.textPrimary} 
                          />
                          {isSelected && (
                            <View style={[
                              styles.iconGlow,
                              { backgroundColor: themeStyles.glowColor }
                            ]} />
                          )}
                        </>
                      ) : (
                        <Lock size={32} color="#666" />
                      )}
                    </View>
                    
                    <View style={styles.modeInfo}>
                      <View style={styles.modeNameContainer}>
                        <Text style={[
                          styles.modeName, 
                          { color: isSelected ? '#fff' : themeStyles.textPrimary },
                          !mode.unlocked && styles.lockedText
                        ]}>
                          {mode.name}
                        </Text>
                        {mode.unlocked && index === 0 && (
                          <View style={styles.popularBadge}>
                            <Star size={10} color="#FFD700" />
                            <Text style={styles.popularText}>HOT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[
                        styles.modeDescription, 
                        { color: isSelected ? 'rgba(255, 255, 255, 0.9)' : themeStyles.textSecondary },
                        !mode.unlocked && styles.lockedText
                      ]}>
                        {mode.unlocked ? mode.description : 'Locked - Coming Soon!'}
                      </Text>
                    </View>

                    {/* Enhanced Selection Indicator */}
                    {isSelected && (
                      <View style={styles.selectionIndicator}>
                        <LinearGradient
                          colors={['#fff', 'rgba(255, 255, 255, 0.7)']}
                          style={styles.selectionDot}
                        />
                        <Zap size={14} color="#fff" style={styles.selectionIcon} />
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Enhanced Start Game Button with Gaming Pad */}
        {showAsMainMenu && (
          <View style={styles.startSection}>
            <TouchableOpacity 
              style={[styles.startButton, !selectedMode && styles.disabledButton]} 
              onPress={() => selectedMode && onModeSelect(selectedMode)}
              disabled={!selectedMode}
            >
              <LinearGradient
                colors={selectedMode 
                  ? [themeStyles.accent, themeStyles.primary, themeStyles.accent] 
                  : ['#666', '#444', '#666']
                }
                style={[
                  styles.startButtonGradient,
                  selectedMode && currentTheme === 'neon' && styles.neonStartButton,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.startButtonContent}>
                  {/* {selectedMode && (
                    <Animated.View style={[styles.gamepadIcon, gamepadAnimatedStyle]}>
                      <Gamepad2 size={22} color="#fff" />
                    </Animated.View>
                  )} */}
                  <Text style={[styles.startButtonText, selectedMode && styles.activeStartText]}>
                    {selectedMode ? 'START GAME' : 'SELECT A MODE'}
                  </Text>
                  {selectedMode && (
                    <Animated.View style={[styles.gamepadIconRight, gamepadAnimatedStyle]}>
                      <Gamepad2 size={22} color="#fff" />
                    </Animated.View>
                  )}
                </View>
                
                {selectedMode && (
                  <View style={[
                    styles.startButtonGlow,
                    { shadowColor: themeStyles.glowColor }
                  ]} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// Memoize the entire component for better performance
export const ModeSelector = memo(ModeSelectorComponent, (prevProps, nextProps) => {
  return (
    prevProps.selectedMode === nextProps.selectedMode &&
    prevProps.visible === nextProps.visible &&
    prevProps.coins === nextProps.coins &&
    prevProps.currentTheme === nextProps.currentTheme &&
    prevProps.showAsMainMenu === nextProps.showAsMainMenu &&
    prevProps.currentBlockShape === nextProps.currentBlockShape
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mainMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    height: '70%',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainMenuContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 15, //20
    paddingBottom: 20, //40
  },
  
  // Enhanced Particles
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
  specialParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.9,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 25,
    zIndex: 10,
  },
  coinsContainer: {
    flex: 1,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    alignSelf: 'flex-start',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 19,
    fontWeight: '900',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: 10, //14
  },
  settingsButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsGradient: {
    padding: 16,
    borderRadius: 24,
  },

  // Title Section with Tower - REORGANIZED
  titleSection: {
    alignItems: 'center',
    paddingBottom: 10, //40
    zIndex: 10,
    paddingTop:25
  },
  blockStackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Space between tower and text
    marginRight:25,
    marginTop:30
  },
  titleContainer: {
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
  },
  gameTitleSecond: {
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 5,
    marginTop: -10,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
  },
  gameSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.85,
    fontWeight: '600',
    letterSpacing: 0.8,
    margin: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Animated Blocks
  animatedBlock: {
    position: 'absolute',
    borderRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 16,
  },
  blockGradient: {
    flex: 1,
    borderRadius: 8,
  },
  blockShine: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    opacity: 0.7,
  },

  // Modal Header
  modalHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Game Modes - SMALLER SIZE
  modesContainer: {
    flex: 1,
    zIndex: 5,
  },
  modesContent: {
    gap: 12, // Reduced gap
    paddingBottom: 20,
  },
  modeCard: {
    borderRadius: 16, // Slightly smaller radius
    overflow: 'hidden',
  },
  selectedModeCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  lockedModeCard: {
    opacity: 0.6,
  },
  modeCardGradient: {
    paddingVertical: 16, // Reduced padding
    paddingHorizontal: 18,
  },
  neonModeCard: {
    shadowColor: '#00ffff',
    shadowOpacity: 0.7,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  modeIconContainer: {
    marginRight: 16, // Reduced margin
    width: 48, // Smaller icon container
    alignItems: 'center',
    position: 'relative',
  },
  selectedIconContainer: {
    transform: [{ scale: 1.15 }],
  },
  iconGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.25,
  },
  modeInfo: {
    flex: 1,
  },
  modeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, // Reduced margin
  },
  modeName: {
    fontSize: 18, // Smaller font
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 2,
  },
  modeDescription: {
    fontSize: 13, // Smaller font
    lineHeight: 18,
    fontWeight: '500',
  },
  selectionIndicator: {
    width: 28, // Smaller indicator
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectionIcon: {
    position: 'absolute',
  },
  lockedText: {
    color: '#666',
  },

  // Enhanced Start Button with Gaming Elements
  startSection: {
    marginTop: 5, //25
    zIndex: 10,
  },
  startButton: {
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  startButtonGradient: {
    paddingVertical: 22,
    alignItems: 'center',
    position: 'relative',
  },
  neonStartButton: {
    shadowColor: '#00ffff',
    shadowOpacity: 0.9,
    shadowRadius: 25,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gamepadIcon: {
    marginRight: 12,
  },
  gamepadIconRight: {
    marginLeft: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  activeStartText: {
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  startButtonGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.4,
    shadowOpacity: 0.9,
    shadowRadius: 25,
  },

  // Enhanced Effects
  neonGlow: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    opacity: 0.4,
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
});