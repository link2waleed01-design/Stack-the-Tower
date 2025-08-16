import { Dimensions } from 'react-native';
import { Platform } from 'react-native';
import { GameModeConfig, ChallengeLevel, Theme } from '../types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Platform-specific optimizations
// Platform-specific optimizations for high-speed gameplay
const IS_ANDROID = Platform.OS === 'android';
const PERFORMANCE_MULTIPLIER = IS_ANDROID ? 0.95 : 1.0; // Slight reduction for Android stability

export const GAME_CONFIG = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  BLOCK_HEIGHT: 40,
  INITIAL_BLOCK_WIDTH: 150, //120
  
  // Optimized speeds for smooth high-speed gameplay
  INITIAL_SPEED: 2.2 * PERFORMANCE_MULTIPLIER, // Slightly reduced from 2.5x for smoother start
  SPEED_INCREMENT: 0.35 * PERFORMANCE_MULTIPLIER, // Balanced progression
  MAX_SPEED: 9 * PERFORMANCE_MULTIPLIER, // Increased max speed with better control
  
  // Adjusted thresholds for high-speed gameplay
  PERFECT_THRESHOLD: 6, // Slightly increased for fairer high-speed play
  COMBO_MULTIPLIER: 12, // Increased to reward precision at speed
  BASE_SCORE: 120, // Increased base score
  
  TIME_ATTACK_DURATION: 20, // seconds
  DAILY_CHALLENGE_REWARD: 50,
  
  // Enhanced performance settings for smooth high-speed animation
  ANIMATION_FRAME_RATE: IS_ANDROID ? 50 : 60, // Slightly reduced for Android stability
  TARGET_FPS: 60,
  FRAME_TIME_MS: 16.67, // Target frame time in milliseconds
  MAX_FRAME_SKIP: 3, // Maximum frames to skip for stability
  
  // Smooth animation constants
  POSITION_INTERPOLATION: 0.8, // Smoothing factor for position updates
  CAMERA_SMOOTHING: 0.75, // Camera follow smoothing
  BOUNCE_DAMPING: 0.85, // Block bounce damping for stability
  
  // Visual feedback timing
  COLLISION_FEEDBACK_DURATION: 150, // ms
  PERFECT_FEEDBACK_DURATION: 200, // ms
  COMBO_DISPLAY_DURATION: 800, // ms
  
  // Performance optimizations
  PARTICLE_COUNT: IS_ANDROID ? 6 : 10, // Reduced for better performance at high speeds
  SHADOW_QUALITY: IS_ANDROID ? 'low' : 'medium', // Balanced visual quality
  RENDER_AHEAD_BLOCKS: 2, // Number of blocks to pre-render
  
  // Touch responsiveness for high-speed gameplay
  TOUCH_DEBOUNCE_MS: 50, // Prevent accidental double-taps
  MIN_TOUCH_DISTANCE: 10, // Minimum touch movement to register
} as const;

// Enhanced animation configuration for smooth high-speed gameplay
export const ANIMATION_CONFIG = {
  // Block movement animations
  BLOCK_EASING: 'linear', // Linear for consistent high-speed movement
  BLOCK_DURATION: 200, // ms - Quick but smooth transitions
  
  // Camera animations - faster for high-speed gameplay
  CAMERA_EASING: 'easeOutCubic',
  CAMERA_DURATION: 350, // Reduced from 600ms for responsive feel
  CAMERA_SPRING_CONFIG: {
    damping: 0.8,
    stiffness: 120,
    mass: 0.8,
  },
  
  // UI animations
  UI_FADE_DURATION: 200,
  UI_SLIDE_DURATION: 250,
  
  // Visual feedback animations for high-speed gameplay
  SCORE_POP_DURATION: 300,
  SCORE_POP_SCALE: 1.3,
  COMBO_BOUNCE_DURATION: 400,
  PERFECT_FLASH_DURATION: 150,
  
  // Collision effects - quick but noticeable
  COLLISION_SHAKE_DURATION: 100,
  COLLISION_SHAKE_INTENSITY: 3,
  
  // Screen transitions
  TRANSITION_DURATION: 300,
  MODAL_ANIMATION_DURATION: 250,
} as const;

// Performance thresholds for dynamic quality adjustment
export const PERFORMANCE_THRESHOLDS = {
  // FPS thresholds for quality adjustment
  HIGH_PERFORMANCE_FPS: 55,
  MEDIUM_PERFORMANCE_FPS: 45,
  LOW_PERFORMANCE_FPS: 30,
  
  // Automatic quality adjustment
  QUALITY_CHECK_INTERVAL: 2000, // ms
  PERFORMANCE_SAMPLES: 10,
  
  // Memory usage thresholds (MB)
  HIGH_MEMORY_USAGE: 150,
  CRITICAL_MEMORY_USAGE: 200,
} as const;

// High-speed gameplay specific constants
export const HIGH_SPEED_CONFIG = {
  // Speed-based adjustments
  SPEED_THRESHOLD_MEDIUM: 4,
  SPEED_THRESHOLD_HIGH: 6,
  SPEED_THRESHOLD_EXTREME: 8,
  
  // Visual aids for high-speed gameplay
  MOTION_BLUR_INTENSITY: 0.3,
  TRAIL_LENGTH: 3, // Number of trail segments
  PREDICTION_LINE_LENGTH: 50, // pixels
  
  // Audio feedback timing (ms)
  AUDIO_FEEDBACK_DELAY: 20,
  AUDIO_FEEDBACK_PITCH_SCALE: 1.2,
  
  // Haptic feedback intensity
  HAPTIC_INTENSITY_LIGHT: 0.3,
  HAPTIC_INTENSITY_MEDIUM: 0.6,
  HAPTIC_INTENSITY_STRONG: 0.9,
} as const;

export const COLORS = {
  themes: {
    default: {
      background: ['#667eea', '#764ba2'] as const,
      blocks: [
        ['#FF6B6B', '#FF8E8E'] as const,
        ['#4ECDC4', '#6FE3DC'] as const,
        ['#45B7D1', '#6BC5E8'] as const,
        ['#96CEB4', '#B8D8C7'] as const,
        ['#FFEAA7', '#FFDD94'] as const,
        ['#DDA0DD', '#E6B3E6'] as const,
        ['#FF9FF3', '#FFB3F7'] as const,
        ['#54A0FF', '#74B9FF'] as const,
      ] as const,
    },
    neon: {
      background: ['#0f0f23', '#1a1a2e'] as const,
      blocks: [
        ['#ff0080', '#ff4da6'] as const,
        ['#00ff80', '#4dff9f'] as const,
        ['#8000ff', '#a64dff'] as const,
        ['#ff8000', '#ff9f4d'] as const,
        ['#0080ff', '#4d9fff'] as const,
        ['#ff0040', '#ff4d73'] as const,
        ['#40ff00', '#73ff4d'] as const,
        ['#0040ff', '#4d73ff'] as const,
      ] as const,
    },
    ocean: {
      background: ['#1e3c72', '#2a5298'] as const,
      blocks: [
        ['#00b4db', '#0083b0'] as const,
        ['#74b9ff', '#0984e3'] as const,
        ['#81ecec', '#00cec9'] as const,
        ['#a29bfe', '#6c5ce7'] as const,
        ['#fd79a8', '#e84393'] as const,
        ['#fdcb6e', '#e17055'] as const,
        ['#55a3ff', '#2d3436'] as const,
        ['#00b894', '#00a085'] as const,
      ] as const,
    },
    sunset: {
      background: ['#ff7e5f', '#feb47b'] as const,
      blocks: [
        ['#ff6b6b', '#ee5a52'] as const,
        ['#ffa726', '#ff9800'] as const,
        ['#ffee58', '#ffeb3b'] as const,
        ['#66bb6a', '#4caf50'] as const,
        ['#42a5f5', '#2196f3'] as const,
        ['#ab47bc', '#9c27b0'] as const,
        ['#ef5350', '#f44336'] as const,
        ['#26c6da', '#00bcd4'] as const,
      ] as const,
    },
    forest: {
      background: ['#134e5e', '#71b280'] as const,
      blocks: [
        ['#2d5016', '#3e6b1f'] as const,
        ['#8fbc8f', '#9acd32'] as const,
        ['#228b22', '#32cd32'] as const,
        ['#6b8e23', '#9acd32'] as const,
        ['#556b2f', '#6b8e23'] as const,
        ['#8b4513', '#a0522d'] as const,
        ['#daa520', '#ffd700'] as const,
        ['#ff6347', '#ff7f50'] as const,
      ] as const,
    },
    volcanic: {
      background: ['#2c1810', '#8b0000'] as const,
      blocks: [
        ['#ff4500', '#ff6347'] as const,
        ['#dc143c', '#ff1493'] as const,
        ['#b22222', '#ff0000'] as const,
        ['#8b0000', '#dc143c'] as const,
        ['#ff8c00', '#ffa500'] as const,
        ['#ff6347', '#ff7f50'] as const,
        ['#cd853f', '#daa520'] as const,
        ['#a0522d', '#d2691e'] as const,
      ] as const,
    },
    arctic: {
      background: ['#e6f3ff', '#b3d9ff'] as const,
      blocks: [
        ['#87ceeb', '#b0e0e6'] as const,
        ['#add8e6', '#e0f6ff'] as const,
        ['#b0c4de', '#d6efff'] as const,
        ['#87cefa', '#b6e2ff'] as const,
        ['#4682b4', '#6ca6cd'] as const,
        ['#1e90ff', '#4fb3d9'] as const,
        ['#00bfff', '#33ccff'] as const,
        ['#40e0d0', '#5ee6d3'] as const,
      ] as const,
    },
    galaxy: {
      background: ['#0c0c0c', '#2d1b69'] as const,
      blocks: [
        ['#9c27b0', '#e1bee7'] as const,
        ['#673ab7', '#d1c4e9'] as const,
        ['#3f51b5', '#c5cae9'] as const,
        ['#2196f3', '#bbdefb'] as const,
        ['#03a9f4', '#b3e5fc'] as const,
        ['#00bcd4', '#b2ebf2'] as const,
        ['#ff5722', '#ffccbc'] as const,
        ['#ff9800', '#ffe0b2'] as const,
      ] as const,
    },
    rainbow: {
      background: ['#ff9a9e', '#fecfef'] as const,
      blocks: [
        ['#ff0000', '#ff4d4d'] as const,
        ['#ff7f00', '#ffb366'] as const,
        ['#ffff00', '#ffff66'] as const,
        ['#00ff00', '#66ff66'] as const,
        ['#0000ff', '#6666ff'] as const,
        ['#4b0082', '#8a4fbe'] as const,
        ['#9400d3', '#b84fe6'] as const,
        ['#ff69b4', '#ff8cc8'] as const,
      ] as const,
    },
    golden: {
      background: ['#f7971e', '#ffd200'] as const,
      blocks: [
        ['#ffd700', '#ffed4e'] as const,
        ['#ffb347', '#ffc966'] as const,
        ['#daa520', '#e6c547'] as const,
        ['#b8860b', '#d4af37'] as const,
        ['#cd853f', '#daa566'] as const,
        ['#f4a460', '#f7b787'] as const,
        ['#ff8c00', '#ffb347'] as const,
        ['#ffa500', '#ffb84d'] as const,
      ] as const,
    },
    diamond: {
      background: ['#ffffff', '#f0f8ff'] as const,
      blocks: [
        ['#e0e0e0', '#f5f5f5'] as const,
        ['#c0c0c0', '#dcdcdc'] as const,
        ['#a0a0a0', '#c8c8c8'] as const,
        ['#808080', '#b0b0b0'] as const,
        ['#b0e0e6', '#d6efff'] as const,
        ['#e6e6fa', '#f0f0ff'] as const,
        ['#ffd1dc', '#ffe4e8'] as const,
        ['#f0fff0', '#f8fff8'] as const,
      ] as const,
    },
  },
  // Backward compatibility - keep the old structure for existing code
  blocks: [
    ['#FF6B6B', '#FF8E8E'] as const,
    ['#4ECDC4', '#6FE3DC'] as const,
    ['#45B7D1', '#6BC5E8'] as const,
    ['#96CEB4', '#B8D8C7'] as const,
    ['#FFEAA7', '#FFDD94'] as const,
    ['#DDA0DD', '#E6B3E6'] as const,
    ['#FF9FF3', '#FFB3F7'] as const,
    ['#54A0FF', '#74B9FF'] as const,
  ] as const,
  background: {
    start: '#667eea',
    end: '#764ba2',
  },
} as const;

// export const ANIMATION_CONFIG = {
//   DURATION: IS_ANDROID ? 200 : 300,
//   BOUNCE_DURATION: IS_ANDROID ? 100 : 150,
//   CAMERA_SCALE_FACTOR: 0.02,
//   CAMERA_PAN_FACTOR: 5,
// } as const;

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Endless stacking with increasing difficulty',
    icon: 'infinity',
    unlocked: true,
  },
  {
    id: 'timeAttack',
    name: 'Time Attack',
    description: 'Stack as many blocks as possible in 60 seconds',
    icon: 'clock',
    unlocked: true,
  },
  {
    id: 'challenge',
    name: 'Challenge',
    description: 'Complete levels with unique objectives',
    icon: 'target',
    unlocked: true,
  },
];

export const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    id: 1,
    name: 'Perfect Start',
    description: 'Stack 5 blocks perfectly',
    objective: 'Stack 5 blocks with perfect alignment',
    targetBlocks: 5,
    completed: false,
    stars: 0,
  },
  {
    id: 2,
    name: 'Speed Demon',
    description: 'Stack 10 blocks in 30 seconds',
    objective: 'Stack 10 blocks within 30 seconds',
    targetBlocks: 10,
    timeLimit: 30,
    completed: false,
    stars: 0,
  },
  {
    id: 3,
    name: 'Slippery Slope',
    description: 'Handle slippery blocks',
    objective: 'Stack 8 blocks including slippery ones',
    targetBlocks: 8,
    specialBlocks: ['slippery'],
    completed: false,
    stars: 0,
  },
  {
    id: 4,
    name: 'Heavy Duty',
    description: 'Stack heavy blocks',
    objective: 'Stack 6 heavy blocks perfectly',
    targetBlocks: 6,
    specialBlocks: ['heavy'],
    completed: false,
    stars: 0,
  },
  {
    id: 5,
    name: 'Master Builder',
    description: 'Ultimate challenge',
    objective: 'Stack 15 blocks with mixed types',
    targetBlocks: 15,
    specialBlocks: ['slippery', 'heavy', 'irregular'],
    completed: false,
    stars: 0,
  },
  {
    id: 6,
    name: 'Lightning Fast',
    description: 'Quick stacking challenge',
    objective: 'Stack 12 blocks in 25 seconds',
    targetBlocks: 12,
    timeLimit: 25,
    completed: false,
    stars: 0,
  },
  {
    id: 7,
    name: 'Precision Master',
    description: 'Perfect alignment required',
    objective: 'Stack 8 blocks with 100% perfect alignment',
    targetBlocks: 8,
    perfectBlocksRequired: 8,
    completed: false,
    stars: 0,
  },
  {
    id: 8,
    name: 'Ice Breaker',
    description: 'Slippery ice blocks',
    objective: 'Stack 10 slippery blocks',
    targetBlocks: 10,
    specialBlocks: ['slippery'],
    completed: false,
    stars: 0,
  },
  {
    id: 9,
    name: 'Heavy Metal',
    description: 'All heavy blocks',
    objective: 'Stack 8 heavy blocks perfectly',
    targetBlocks: 8,
    specialBlocks: ['heavy'],
    perfectBlocksRequired: 6,
    completed: false,
    stars: 0,
  },
  {
    id: 10,
    name: 'Time Crunch',
    description: 'Ultimate speed test',
    objective: 'Stack 20 blocks in 45 seconds',
    targetBlocks: 20,
    timeLimit: 45,
    completed: false,
    stars: 0,
  },
  {
    id: 11,
    name: 'Mixed Madness',
    description: 'All block types',
    objective: 'Stack 12 blocks with all special types',
    targetBlocks: 12,
    specialBlocks: ['slippery', 'heavy', 'irregular'],
    completed: false,
    stars: 0,
  },
  {
    id: 12,
    name: 'Perfectionist',
    description: 'No mistakes allowed',
    objective: 'Stack 10 blocks with perfect alignment',
    targetBlocks: 10,
    perfectBlocksRequired: 10,
    completed: false,
    stars: 0,
  },
  {
    id: 13,
    name: 'Endurance Test',
    description: 'Long tower challenge',
    objective: 'Stack 25 blocks successfully',
    targetBlocks: 25,
    completed: false,
    stars: 0,
  },
  {
    id: 14,
    name: 'Slippery Slope Pro',
    description: 'Advanced slippery challenge',
    objective: 'Stack 15 slippery blocks in 60 seconds',
    targetBlocks: 15,
    timeLimit: 60,
    specialBlocks: ['slippery'],
    completed: false,
    stars: 0,
  },
  {
    id: 15,
    name: 'Heavy Lifter',
    description: 'Maximum weight challenge',
    objective: 'Stack 12 heavy blocks with 8 perfect',
    targetBlocks: 12,
    specialBlocks: ['heavy'],
    perfectBlocksRequired: 8,
    completed: false,
    stars: 0,
  },
  {
    id: 16,
    name: 'Speed Perfectionist',
    description: 'Fast and perfect',
    objective: 'Stack 15 blocks perfectly in 40 seconds',
    targetBlocks: 15,
    timeLimit: 40,
    perfectBlocksRequired: 15,
    completed: false,
    stars: 0,
  },
  {
    id: 17,
    name: 'Chaos Theory',
    description: 'Random block madness',
    objective: 'Stack 18 blocks with irregular patterns',
    targetBlocks: 18,
    specialBlocks: ['irregular'],
    completed: false,
    stars: 0,
  },
  {
    id: 18,
    name: 'Ultimate Speed',
    description: 'Lightning fast stacking',
    objective: 'Stack 30 blocks in 60 seconds',
    targetBlocks: 30,
    timeLimit: 60,
    completed: false,
    stars: 0,
  },
  {
    id: 19,
    name: 'Master of All',
    description: 'Complete mastery test',
    objective: 'Stack 20 mixed blocks with 15 perfect',
    targetBlocks: 20,
    specialBlocks: ['slippery', 'heavy', 'irregular'],
    perfectBlocksRequired: 15,
    completed: false,
    stars: 0,
  },
  {
    id: 20,
    name: 'Legend Builder',
    description: 'The ultimate challenge',
    objective: 'Stack 35 blocks with all conditions',
    targetBlocks: 35,
    timeLimit: 90,
    specialBlocks: ['slippery', 'heavy', 'irregular'],
    perfectBlocksRequired: 25,
    completed: false,
    stars: 0,
  },
];

// Theme-specific UI colors for main menu and other screens
export const THEME_UI_COLORS = {
  default: {
    cardBackground: 'rgba(255, 255, 255, 0.15)',
    cardBorder: 'rgba(255, 255, 255, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#e0e0e0',
    textTertiary: '#b0b0b0',
    accent: '#4facfe',
    accentSecondary: '#667eea',
    buttonPrimary: ['#4facfe', '#00f2fe'],
    buttonSecondary: 'rgba(255, 255, 255, 0.2)',
    iconTint: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  neon: {
    cardBackground: 'rgba(0, 255, 255, 0.1)',
    cardBorder: 'rgba(0, 255, 255, 0.4)',
    textPrimary: '#00ffff',
    textSecondary: '#80ffff',
    textTertiary: '#40cccc',
    accent: '#ff0080',
    accentSecondary: '#00ff80',
    buttonPrimary: ['#ff0080', '#ff4da6'],
    buttonSecondary: 'rgba(0, 255, 255, 0.2)',
    iconTint: '#00ffff',
    shadow: 'rgba(0, 255, 255, 0.5)',
  },
  ocean: {
    cardBackground: 'rgba(116, 185, 255, 0.15)',
    cardBorder: 'rgba(116, 185, 255, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#b3d9ff',
    textTertiary: '#80c7ff',
    accent: '#00b4db',
    accentSecondary: '#74b9ff',
    buttonPrimary: ['#00b4db', '#0083b0'],
    buttonSecondary: 'rgba(116, 185, 255, 0.2)',
    iconTint: '#74b9ff',
    shadow: 'rgba(0, 180, 219, 0.4)',
  },
  sunset: {
    cardBackground: 'rgba(255, 167, 38, 0.15)',
    cardBorder: 'rgba(255, 167, 38, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#ffe0b3',
    textTertiary: '#ffcc80',
    accent: '#ff6b6b',
    accentSecondary: '#ffa726',
    buttonPrimary: ['#ff6b6b', '#ee5a52'],
    buttonSecondary: 'rgba(255, 167, 38, 0.2)',
    iconTint: '#ffa726',
    shadow: 'rgba(255, 107, 107, 0.4)',
  },
  forest: {
    cardBackground: 'rgba(113, 178, 128, 0.15)',
    cardBorder: 'rgba(113, 178, 128, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#c8e6c9',
    textTertiary: '#a5d6a7',
    accent: '#2d5016',
    accentSecondary: '#8fbc8f',
    buttonPrimary: ['#2d5016', '#3e6b1f'],
    buttonSecondary: 'rgba(113, 178, 128, 0.2)',
    iconTint: '#8fbc8f',
    shadow: 'rgba(45, 80, 22, 0.4)',
  },
  volcanic: {
    cardBackground: 'rgba(255, 69, 0, 0.15)',
    cardBorder: 'rgba(255, 69, 0, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#ffb3b3',
    textTertiary: '#ff8080',
    accent: '#ff4500',
    accentSecondary: '#dc143c',
    buttonPrimary: ['#ff4500', '#ff6347'],
    buttonSecondary: 'rgba(255, 69, 0, 0.2)',
    iconTint: '#ff6347',
    shadow: 'rgba(255, 69, 0, 0.5)',
  },
  arctic: {
    cardBackground: 'rgba(135, 206, 235, 0.15)',
    cardBorder: 'rgba(135, 206, 235, 0.3)',
    textPrimary: '#2c3e50',
    textSecondary: '#34495e',
    textTertiary: '#5d6d7e',
    accent: '#4682b4',
    accentSecondary: '#87ceeb',
    buttonPrimary: ['#4682b4', '#6ca6cd'],
    buttonSecondary: 'rgba(135, 206, 235, 0.3)',
    iconTint: '#4682b4',
    shadow: 'rgba(70, 130, 180, 0.3)',
  },
  galaxy: {
    cardBackground: 'rgba(156, 39, 176, 0.15)',
    cardBorder: 'rgba(156, 39, 176, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#e1bee7',
    textTertiary: '#ce93d8',
    accent: '#9c27b0',
    accentSecondary: '#673ab7',
    buttonPrimary: ['#9c27b0', '#e1bee7'],
    buttonSecondary: 'rgba(156, 39, 176, 0.2)',
    iconTint: '#e1bee7',
    shadow: 'rgba(156, 39, 176, 0.5)',
  },
  rainbow: {
    cardBackground: 'rgba(255, 105, 180, 0.15)',
    cardBorder: 'rgba(255, 105, 180, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#ffb3d9',
    textTertiary: '#ff80cc',
    accent: '#ff69b4',
    accentSecondary: '#ff1493',
    buttonPrimary: ['#ff69b4', '#ff8cc8'],
    buttonSecondary: 'rgba(255, 105, 180, 0.2)',
    iconTint: '#ff69b4',
    shadow: 'rgba(255, 105, 180, 0.4)',
  },
  golden: {
    cardBackground: 'rgba(255, 215, 0, 0.15)',
    cardBorder: 'rgba(255, 215, 0, 0.4)',
    textPrimary: '#2c1810',
    textSecondary: '#8b4513',
    textTertiary: '#a0522d',
    accent: '#ffd700',
    accentSecondary: '#daa520',
    buttonPrimary: ['#ffd700', '#ffed4e'],
    buttonSecondary: 'rgba(255, 215, 0, 0.3)',
    iconTint: '#b8860b',
    shadow: 'rgba(255, 215, 0, 0.5)',
  },
  diamond: {
    cardBackground: 'rgba(192, 192, 192, 0.2)',
    cardBorder: 'rgba(192, 192, 192, 0.4)',
    textPrimary: '#2c3e50',
    textSecondary: '#34495e',
    textTertiary: '#5d6d7e',
    accent: '#c0c0c0',
    accentSecondary: '#e0e0e0',
    buttonPrimary: ['#c0c0c0', '#dcdcdc'],
    buttonSecondary: 'rgba(192, 192, 192, 0.3)',
    iconTint: '#808080',
    shadow: 'rgba(192, 192, 192, 0.4)',
  },
} as const;

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Classic',
    backgroundColors: ['#667eea', '#764ba2'] as const,
    blockColors: [
      ['#FF6B6B', '#FF8E8E'] as const,
      ['#4ECDC4', '#6FE3DC'] as const,
      ['#45B7D1', '#6BC5E8'] as const,
      ['#96CEB4', '#B8D8C7'] as const,
      ['#FFEAA7', '#FFDD94'] as const,
      ['#DDA0DD', '#E6B3E6'] as const,
      ['#FF9FF3', '#FFB3F7'] as const,
      ['#54A0FF', '#74B9FF'] as const,
    ] as const,
    unlocked: true,
    cost: 0,
    rarity: 'common',
    description: 'The original classic theme'
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    backgroundColors: ['#0f0f23', '#1a1a2e'] as const,
    blockColors: [
      ['#ff0080', '#ff4da6'] as const,
      ['#00ff80', '#4dff9f'] as const,
      ['#8000ff', '#a64dff'] as const,
      ['#ff8000', '#ff9f4d'] as const,
      ['#0080ff', '#4d9fff'] as const,
      ['#ff0040', '#ff4d73'] as const,
      ['#40ff00', '#73ff4d'] as const,
      ['#0040ff', '#4d73ff'] as const,
    ] as const,
    unlocked: false,
    cost: 100,
    rarity: 'common',
    description: 'Cyberpunk vibes with electric colors'
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    backgroundColors: ['#1e3c72', '#2a5298'] as const,
    blockColors: [
      ['#00b4db', '#0083b0'] as const,
      ['#74b9ff', '#0984e3'] as const,
      ['#81ecec', '#00cec9'] as const,
      ['#a29bfe', '#6c5ce7'] as const,
      ['#fd79a8', '#e84393'] as const,
      ['#fdcb6e', '#e17055'] as const,
      ['#55a3ff', '#2d3436'] as const,
      ['#00b894', '#00a085'] as const,
    ] as const,
    unlocked: false,
    cost: 150,
    rarity: 'common',
    description: 'Dive into underwater tranquility'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    backgroundColors: ['#ff7e5f', '#feb47b'] as const,
    blockColors: [
      ['#ff6b6b', '#ee5a52'] as const,
      ['#ffa726', '#ff9800'] as const,
      ['#ffee58', '#ffeb3b'] as const,
      ['#66bb6a', '#4caf50'] as const,
      ['#42a5f5', '#2196f3'] as const,
      ['#ab47bc', '#9c27b0'] as const,
      ['#ef5350', '#f44336'] as const,
      ['#26c6da', '#00bcd4'] as const,
    ] as const,
    unlocked: false,
    cost: 200,
    rarity: 'rare',
    description: 'Golden hour warmth and beauty'
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    backgroundColors: ['#134e5e', '#71b280'] as const,
    blockColors: [
      ['#2d5016', '#3e6b1f'] as const,
      ['#8fbc8f', '#9acd32'] as const,
      ['#228b22', '#32cd32'] as const,
      ['#6b8e23', '#9acd32'] as const,
      ['#556b2f', '#6b8e23'] as const,
      ['#8b4513', '#a0522d'] as const,
      ['#daa520', '#ffd700'] as const,
      ['#ff6347', '#ff7f50'] as const,
    ] as const,
    unlocked: false,
    cost: 250,
    rarity: 'rare',
    description: 'Mystical woodland adventure'
  },
  {
    id: 'volcanic',
    name: 'Volcanic Fury',
    backgroundColors: ['#2c1810', '#8b0000'] as const,
    blockColors: [
      ['#ff4500', '#ff6347'] as const,
      ['#dc143c', '#ff1493'] as const,
      ['#b22222', '#ff0000'] as const,
      ['#8b0000', '#dc143c'] as const,
      ['#ff8c00', '#ffa500'] as const,
      ['#ff6347', '#ff7f50'] as const,
      ['#cd853f', '#daa520'] as const,
      ['#a0522d', '#d2691e'] as const,
    ] as const,
    unlocked: false,
    cost: 300,
    rarity: 'rare',
    description: 'Explosive molten power'
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    backgroundColors: ['#e6f3ff', '#b3d9ff'] as const,
    blockColors: [
      ['#87ceeb', '#b0e0e6'] as const,
      ['#add8e6', '#e0f6ff'] as const,
      ['#b0c4de', '#d6efff'] as const,
      ['#87cefa', '#b6e2ff'] as const,
      ['#4682b4', '#6ca6cd'] as const,
      ['#1e90ff', '#4fb3d9'] as const,
      ['#00bfff', '#33ccff'] as const,
      ['#40e0d0', '#5ee6d3'] as const,
    ] as const,
    unlocked: false,
    cost: 350,
    rarity: 'epic',
    description: 'Pristine frozen wilderness'
  },
  {
    id: 'galaxy',
    name: 'Cosmic Galaxy',
    backgroundColors: ['#0c0c0c', '#2d1b69'] as const,
    blockColors: [
      ['#9c27b0', '#e1bee7'] as const,
      ['#673ab7', '#d1c4e9'] as const,
      ['#3f51b5', '#c5cae9'] as const,
      ['#2196f3', '#bbdefb'] as const,
      ['#03a9f4', '#b3e5fc'] as const,
      ['#00bcd4', '#b2ebf2'] as const,
      ['#ff5722', '#ffccbc'] as const,
      ['#ff9800', '#ffe0b2'] as const,
    ] as const,
    unlocked: false,
    cost: 400,
    rarity: 'epic',
    description: 'Journey through infinite space'
  },
  {
    id: 'rainbow',
    name: 'Rainbow Dreams',
    backgroundColors: ['#ff9a9e', '#fecfef'] as const,
    blockColors: [
      ['#ff0000', '#ff4d4d'] as const,
      ['#ff7f00', '#ffb366'] as const,
      ['#ffff00', '#ffff66'] as const,
      ['#00ff00', '#66ff66'] as const,
      ['#0000ff', '#6666ff'] as const,
      ['#4b0082', '#8a4fbe'] as const,
      ['#9400d3', '#b84fe6'] as const,
      ['#ff69b4', '#ff8cc8'] as const,
    ] as const,
    unlocked: false,
    cost: 500,
    rarity: 'epic',
    description: 'Pure magical spectrum'
  },
  {
    id: 'golden',
    name: 'Golden Majesty',
    backgroundColors: ['#f7971e', '#ffd200'] as const,
    blockColors: [
      ['#ffd700', '#ffed4e'] as const,
      ['#ffb347', '#ffc966'] as const,
      ['#daa520', '#e6c547'] as const,
      ['#b8860b', '#d4af37'] as const,
      ['#cd853f', '#daa566'] as const,
      ['#f4a460', '#f7b787'] as const,
      ['#ff8c00', '#ffb347'] as const,
      ['#ffa500', '#ffb84d'] as const,
    ] as const,
    unlocked: false,
    cost: 750,
    rarity: 'legendary',
    description: 'Luxurious royal elegance'
  },
  {
    id: 'diamond',
    name: 'Diamond Elite',
    backgroundColors: ['#ffffff', '#f0f8ff'] as const,
    blockColors: [
      ['#e0e0e0', '#f5f5f5'] as const,
      ['#c0c0c0', '#dcdcdc'] as const,
      ['#a0a0a0', '#c8c8c8'] as const,
      ['#808080', '#b0b0b0'] as const,
      ['#b0e0e6', '#d6efff'] as const,
      ['#e6e6fa', '#f0f0ff'] as const,
      ['#ffd1dc', '#ffe4e8'] as const,
      ['#f0fff0', '#f8fff8'] as const,
    ] as const,
    unlocked: false,
    cost: 1000,
    rarity: 'legendary',
    description: 'Ultimate prestige and brilliance'
  },
];

export const BLOCK_SHAPES: import('../types/game').BlockShape[] = [
  {
    id: 'rectangle',
    name: 'Classic',
    description: 'The original rectangular block',
    cost: 0,
    unlocked: true,
    rarity: 'common',
    preview: {
      width: 60,
      height: 20,
      elements: [
        {
          id: 'main',
          type: 'rect',
          x: 0,
          y: 0,
          width: 60,
          height: 20,
          colorIndex: 0,
          borderRadius: 6,
        }
      ]
    }
  },
  {
    id: 'house',
    name: 'House',
    description: 'Cozy home blocks with roof and windows',
    cost: 200,
    unlocked: false,
    rarity: 'common',
    preview: {
      width: 60,
      height: 24,
      elements: [
        // Roof
        {
          id: 'roof',
          type: 'triangle',
          x: 10,
          y: 0,
          width: 40,
          height: 12,
          colorIndex: 1,
        },
        // Main house body
        {
          id: 'body',
          type: 'rect',
          x: 5,
          y: 8,
          width: 50,
          height: 16,
          colorIndex: 0,
          borderRadius: 2,
        },
        // Door
        {
          id: 'door',
          type: 'rect',
          x: 25,
          y: 14,
          width: 10,
          height: 10,
          colorIndex: 2,
          borderRadius: 1,
        },
        // Windows
        {
          id: 'window1',
          type: 'rect',
          x: 12,
          y: 12,
          width: 8,
          height: 6,
          colorIndex: 3,
          borderRadius: 1,
        },
        {
          id: 'window2',
          type: 'rect',
          x: 40,
          y: 12,
          width: 8,
          height: 6,
          colorIndex: 3,
          borderRadius: 1,
        }
      ]
    }
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Sweet candy blocks with wrapper',
    cost: 300,
    unlocked: false,
    rarity: 'rare',
    preview: {
      width: 60,
      height: 20,
      elements: [
        // Candy wrapper
        {
          id: 'wrapper',
          type: 'rect',
          x: 0,
          y: 0,
          width: 60,
          height: 20,
          colorIndex: 0,
          borderRadius: 10,
        },
        // Candy filling
        {
          id: 'filling',
          type: 'rect',
          x: 8,
          y: 4,
          width: 44,
          height: 12,
          colorIndex: 1,
          borderRadius: 6,
        },
        // Candy stripes
        {
          id: 'stripe1',
          type: 'rect',
          x: 15,
          y: 2,
          width: 4,
          height: 16,
          colorIndex: 2,
          borderRadius: 2,
        },
        {
          id: 'stripe2',
          type: 'rect',
          x: 25,
          y: 2,
          width: 4,
          height: 16,
          colorIndex: 2,
          borderRadius: 2,
        },
        {
          id: 'stripe3',
          type: 'rect',
          x: 35,
          y: 2,
          width: 4,
          height: 16,
          colorIndex: 2,
          borderRadius: 2,
        }
      ]
    }
  },
  {
    id: 'pizza',
    name: 'Pizza',
    description: 'Delicious pizza slices with toppings',
    cost: 400,
    unlocked: false,
    rarity: 'epic',
    preview: {
      width: 60,
      height: 20,
      elements: [
        // Pizza base
        {
          id: 'base',
          type: 'rect',
          x: 0,
          y: 0,
          width: 60,
          height: 20,
          colorIndex: 0,
          borderRadius: 8,
        },
        // Cheese layer
        {
          id: 'cheese',
          type: 'rect',
          x: 3,
          y: 3,
          width: 54,
          height: 14,
          colorIndex: 1,
          borderRadius: 6,
        },
        // Pepperoni
        {
          id: 'pepperoni1',
          type: 'circle',
          x: 12,
          y: 6,
          width: 8,
          height: 8,
          colorIndex: 2,
        },
        {
          id: 'pepperoni2',
          type: 'circle',
          x: 30,
          y: 8,
          width: 6,
          height: 6,
          colorIndex: 2,
        },
        {
          id: 'pepperoni3',
          type: 'circle',
          x: 45,
          y: 6,
          width: 7,
          height: 7,
          colorIndex: 2,
        }
      ]
    }
  }
];