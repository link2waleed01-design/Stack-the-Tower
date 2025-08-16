import React from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Block as BlockType } from '../types/game';
import { getBlockColors } from '../utils/gameLogic';
import { ShapedBlock } from './ShapedBlock';

interface BlockProps {
  block: BlockType;
  isDropping?: boolean;
  themeId?: string;
  shapeId?: string;
}

// Memoized style calculations for better performance
const getOptimizedBorderColor = (blockType: BlockType['type'], themeId: string) => {
  if (blockType === 'slippery') {
    return 'rgba(255, 255, 255, 0.7)';
  } else if (blockType === 'heavy') {
    return themeId === 'golden' || themeId === 'diamond' 
      ? 'rgba(255, 215, 0, 0.9)' 
      : 'rgba(255, 215, 0, 0.8)';
  } else {
    switch (themeId) {
      case 'neon': return 'rgba(0, 255, 255, 0.4)';
      case 'volcanic': return 'rgba(255, 69, 0, 0.4)';
      case 'arctic': return 'rgba(135, 206, 235, 0.4)';
      case 'galaxy': return 'rgba(147, 112, 219, 0.4)';
      case 'diamond': return 'rgba(192, 192, 192, 0.6)';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  }
};

const getOptimizedBorderWidth = (blockType: BlockType['type']) => {
  return blockType === 'heavy' ? 3 : 2;
};

const getOptimizedShadowColor = (themeId: string) => {
  switch (themeId) {
    case 'neon': return '#00ffff';
    case 'volcanic': return '#ff4500';
    case 'golden': return '#ffd700';
    case 'galaxy': return '#9370db';
    default: return '#000';
  }
};

// Pre-calculated shadow styles for performance
const shadowStyles = {
  neon: { shadowOpacity: 0.4, shadowRadius: 8 },
  volcanic: { shadowOpacity: 0.3, shadowRadius: 8 },
  golden: { shadowOpacity: 0.4, shadowRadius: 8 },
  galaxy: { shadowOpacity: 0.3, shadowRadius: 12 },
  diamond: { shadowOpacity: 0.3, shadowRadius: 8 },
  default: { shadowOpacity: 0.3, shadowRadius: 8 },
};

const BlockComponent: React.FC<BlockProps> = ({ 
  block, 
  isDropping = false, 
  themeId = 'default',
  shapeId = 'rectangle'
}) => {
  // If using a custom shape, render the ShapedBlock component
  if (shapeId !== 'rectangle') {
    return (
      <ShapedBlock
        block={block}
        isDropping={isDropping}
        themeId={themeId}
        shapeId={shapeId}
      />
    );
  }

  // Otherwise, render the classic rectangular block
  const colorIndex = block.id === 'base' ? 0 : parseInt(block.id.split('-')[1] || '0') % 8;
  const [startColor, endColor] = getBlockColors(colorIndex, themeId);

  // Use shared values with optimized precision for better performance
  const translateX = useSharedValue(block.x);
  const translateY = useSharedValue(block.y);
  const blockWidth = useSharedValue(block.width);
  const blockScale = useSharedValue(1);

  // Optimized animation parameters
  const ANIMATION_CONFIG = useMemo(() => ({
    duration: block.isMoving ? 0 : 150, // Reduced duration for snappier feel
    spring: { damping: 18, stiffness: 450, mass: 0.8 }, // Optimized spring values
  }), [block.isMoving]);

  // Ultra-fast position updates with reduced animation overhead
  React.useEffect(() => {
    if (block.isMoving) {
      // Immediate updates for moving blocks for ultra-smooth movement
      translateX.value = block.x;
      translateY.value = block.y;
      blockWidth.value = block.width;
    } else {
      // Smooth transitions for placed blocks
      translateX.value = withTiming(block.x, { duration: ANIMATION_CONFIG.duration });
      translateY.value = withTiming(block.y, { duration: ANIMATION_CONFIG.duration });
      blockWidth.value = withTiming(block.width, { duration: ANIMATION_CONFIG.duration });
    }
  }, [block.x, block.y, block.width, block.isMoving, ANIMATION_CONFIG.duration]);

  // Optimized drop animation with reduced duration
  React.useEffect(() => {
    if (isDropping) {
      blockScale.value = withSpring(1.03, ANIMATION_CONFIG.spring); // Reduced scale for subtler effect
      
      // Use setTimeout for better performance than multiple spring animations
      const timer = setTimeout(() => {
        blockScale.value = withSpring(1, ANIMATION_CONFIG.spring);
      }, 120); // Reduced timeout for snappier feel
      
      return () => clearTimeout(timer);
    }
  }, [isDropping, ANIMATION_CONFIG.spring]);

  // Ultra-optimized animated style with minimal calculations
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: blockScale.value },
      ],
      width: blockWidth.value,
      height: block.height,
      opacity: block.type === 'slippery' ? 0.88 : 1, // Slightly increased for better visibility
    };
  }, [block.type, block.height]);

  // Memoized style objects for better performance
  const borderColor = useMemo(() => getOptimizedBorderColor(block.type, themeId), [block.type, themeId]);
  const borderWidth = useMemo(() => getOptimizedBorderWidth(block.type), [block.type]);
  const shadowColor = useMemo(() => getOptimizedShadowColor(themeId), [themeId]);
  const shadowConfig = useMemo(() => shadowStyles[themeId as keyof typeof shadowStyles] || shadowStyles.default, [themeId]);

  // Pre-calculated gradient style
  const gradientStyle = useMemo(() => ({
    ...styles.gradient,
    borderWidth,
    borderColor,
  }), [borderWidth, borderColor]);

  // Pre-calculated dynamic shadow styles
  const dynamicShadowStyle = useMemo(() => ({
    shadowColor,
    ...shadowConfig,
  }), [shadowColor, shadowConfig]);

  // Determine if special overlay is needed
  const needsSpecialOverlay = useMemo(() => 
    themeId === 'diamond' || themeId === 'golden'
  , [themeId]);

  return (
    <Animated.View style={[styles.block, animatedStyle, dynamicShadowStyle]}>
      <LinearGradient
        colors={[startColor, endColor]}
        style={gradientStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Conditionally render special effect overlay only when needed */}
      {needsSpecialOverlay && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.25)', 'transparent', 'rgba(255, 255, 255, 0.15)']}
          style={styles.shineOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
    </Animated.View>
  );
};

// Enhanced memoization with more specific prop comparison for better performance
export const Block = memo(BlockComponent, (prevProps, nextProps) => {
  // Only re-render if essential properties change
  return (
    prevProps.block.id === nextProps.block.id &&
    Math.abs(prevProps.block.x - nextProps.block.x) < 0.5 && // Tolerance for micro-movements
    Math.abs(prevProps.block.y - nextProps.block.y) < 0.5 &&
    Math.abs(prevProps.block.width - nextProps.block.width) < 0.5 &&
    prevProps.block.isMoving === nextProps.block.isMoving &&
    prevProps.block.type === nextProps.block.type &&
    prevProps.isDropping === nextProps.isDropping &&
    prevProps.themeId === nextProps.themeId &&
    prevProps.shapeId === nextProps.shapeId
  );
});

// Optimized styles with reduced complexity
const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 6, // Slightly reduced for better performance on some devices
    shadowOffset: {
      width: 0,
      height: 3, // Reduced for better performance
    },
    elevation: 6, // Reduced for better performance on Android
  },
  gradient: {
    flex: 1,
    borderRadius: 6,
  },
  shineOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    opacity: 0.5, // Slightly reduced for subtler effect
  },
});