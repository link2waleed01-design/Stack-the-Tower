import React from 'react';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Block as BlockType, BlockShape, BlockShapeElement } from '../types/game';
import { getBlockColors } from '../utils/gameLogic';
import { BLOCK_SHAPES } from '../constants/game';

interface ShapedBlockProps {
  block: BlockType;
  isDropping?: boolean;
  themeId?: string;
  shapeId?: string;
}

// Triangle component for house roofs
const TriangleElement: React.FC<{
  element: BlockShapeElement;
  colors: readonly [string, string];
  style: any;
}> = ({ element, colors, style }) => {
  return (
    <View
      style={[
        style,
        {
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: element.width / 2,
          borderRightWidth: element.width / 2,
          borderBottomWidth: element.height,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: colors[0],
        },
      ]}
    />
  );
};

// Circle component for pizza toppings
const CircleElement: React.FC<{
  element: BlockShapeElement;
  colors: readonly [string, string];
  style: any;
}> = ({ element, colors, style }) => {
  return (
    <View
      style={[
        style,
        {
          backgroundColor: colors[0],
          borderRadius: element.width / 2,
        },
      ]}
    />
  );
};

// Rectangle component with gradient
const RectElement: React.FC<{
  element: BlockShapeElement;
  colors: readonly [string, string];
  style: any;
}> = ({ element, colors, style }) => {
  return (
    <LinearGradient
      colors={[colors[0], colors[1]]}
      style={[
        style,
        {
          borderRadius: element.borderRadius || 0,
        },
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
};

const ShapedBlockComponent: React.FC<ShapedBlockProps> = ({ 
  block, 
  isDropping = false, 
  themeId = 'default',
  shapeId = 'rectangle'
}) => {
  // Use shared values with optimized precision for better performance
  const translateX = useSharedValue(block.x);
  const translateY = useSharedValue(block.y);
  const blockWidth = useSharedValue(block.width);
  const blockScale = useSharedValue(1);

  // Find the block shape definition
  const blockShape = useMemo(() => 
    BLOCK_SHAPES.find(shape => shape.id === shapeId) || BLOCK_SHAPES[0]
  , [shapeId]);

  // Optimized animation parameters
  const ANIMATION_CONFIG = useMemo(() => ({
    duration: block.isMoving ? 0 : 150,
    spring: { damping: 18, stiffness: 450, mass: 0.8 },
  }), [block.isMoving]);

  // Ultra-fast position updates
  React.useEffect(() => {
    if (block.isMoving) {
      translateX.value = block.x;
      translateY.value = block.y;
      blockWidth.value = block.width;
    } else {
      translateX.value = withTiming(block.x, { duration: ANIMATION_CONFIG.duration });
      translateY.value = withTiming(block.y, { duration: ANIMATION_CONFIG.duration });
      blockWidth.value = withTiming(block.width, { duration: ANIMATION_CONFIG.duration });
    }
  }, [block.x, block.y, block.width, block.isMoving, ANIMATION_CONFIG.duration]);

  // Drop animation
  React.useEffect(() => {
    if (isDropping) {
      blockScale.value = withSpring(1.03, ANIMATION_CONFIG.spring);
      
      const timer = setTimeout(() => {
        blockScale.value = withSpring(1, ANIMATION_CONFIG.spring);
      }, 120);
      
      return () => clearTimeout(timer);
    }
  }, [isDropping, ANIMATION_CONFIG.spring]);

  // Main animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: blockScale.value },
      ],
      width: blockWidth.value,
      height: block.height,
      opacity: block.type === 'slippery' ? 0.88 : 1,
    };
  }, [block.type, block.height]);

  // Calculate scale factors for responsive sizing
  const scaleX = useMemo(() => block.width / blockShape.preview.width, [block.width, blockShape.preview.width]);
  const scaleY = useMemo(() => block.height / blockShape.preview.height, [block.height, blockShape.preview.height]);

  // Render shape elements
  const renderShapeElement = (element: BlockShapeElement, index: number) => {
    const colorIndex = element.colorIndex % 8;
    const colors = getBlockColors(colorIndex, themeId);
    
    const elementStyle = {
      position: 'absolute' as const,
      left: element.x * scaleX,
      top: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY,
      opacity: element.opacity || 1,
    };

    switch (element.type) {
      case 'triangle':
        return (
          <TriangleElement
            key={`${element.id}-${index}`}
            element={{
              ...element,
              width: element.width * scaleX,
              height: element.height * scaleY,
            }}
            colors={colors}
            style={elementStyle}
          />
        );
      case 'circle':
        return (
          <CircleElement
            key={`${element.id}-${index}`}
            element={element}
            colors={colors}
            style={elementStyle}
          />
        );
      case 'rect':
      default:
        return (
          <RectElement
            key={`${element.id}-${index}`}
            element={element}
            colors={colors}
            style={elementStyle}
          />
        );
    }
  };

  // Dynamic shadow styles based on theme
  const dynamicShadowStyle = useMemo(() => {
    const shadowColors = {
      neon: '#00ffff',
      volcanic: '#ff4500',
      golden: '#ffd700',
      galaxy: '#9370db',
      default: '#000',
    };
    
    const shadowColor = shadowColors[themeId as keyof typeof shadowColors] || shadowColors.default;
    
    return {
      shadowColor,
      shadowOpacity: themeId === 'neon' || themeId === 'galaxy' ? 0.4 : 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
    };
  }, [themeId]);

  return (
    <Animated.View style={[styles.block, animatedStyle, dynamicShadowStyle]}>
      <View style={styles.shapeContainer}>
        {blockShape.preview.elements.map(renderShapeElement)}
      </View>
    </Animated.View>
  );
};

// Enhanced memoization
export const ShapedBlock = memo(ShapedBlockComponent, (prevProps, nextProps) => {
  return (
    prevProps.block.id === nextProps.block.id &&
    Math.abs(prevProps.block.x - nextProps.block.x) < 0.5 &&
    Math.abs(prevProps.block.y - nextProps.block.y) < 0.5 &&
    Math.abs(prevProps.block.width - nextProps.block.width) < 0.5 &&
    prevProps.block.isMoving === nextProps.block.isMoving &&
    prevProps.block.type === nextProps.block.type &&
    prevProps.isDropping === nextProps.isDropping &&
    prevProps.themeId === nextProps.themeId &&
    prevProps.shapeId === nextProps.shapeId
  );
});

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 6,
  },
  shapeContainer: {
    flex: 1,
    position: 'relative',
  },
});