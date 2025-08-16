import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Coins, Lock, Check, Star, Crown, Zap, Gift, ShoppingBag, Palette, Box } from 'lucide-react-native';
import { Theme, BlockShape } from '@/types/game';
import { THEMES, BLOCK_SHAPES } from '@/constants/game';
import { useTheme } from '@/contexts/GameContext';
import { useSoundManager } from '@/hooks/useSoundManager';
import { getBlockColors } from '@/utils/gameLogic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return '#9e9e9e';
    case 'rare': return '#2196f3';
    case 'epic': return '#9c27b0';
    case 'legendary': return '#ff9800';
    default: return '#9e9e9e';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'rare': return <Star size={16} color="#2196f3" />;
    case 'epic': return <Zap size={16} color="#9c27b0" />;
    case 'legendary': return <Crown size={16} color="#ff9800" />;
    default: return null;
  }
};

// Block Shape Preview Component
const BlockShapePreview: React.FC<{
  shape: BlockShape;
  themeId: string;
  size?: number;
}> = ({ shape, themeId, size = 60 }) => {
  const scaleX = size / shape.preview.width;
  const scaleY = (size * 0.6) / shape.preview.height;

  const renderElement = (element: any, index: number) => {
    const colors = getBlockColors(element.colorIndex, themeId);
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
                borderBottomColor: colors[0],
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
                backgroundColor: colors[0],
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
            colors={[colors[0], colors[1]]}
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
  };

  return (
    <View style={{ width: size, height: size * 0.6, position: 'relative' }}>
      {shape.preview.elements.map(renderElement)}
    </View>
  );
};

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('themes');
  const { playSound } = useSoundManager();
  
  // Use global theme context instead of local state
  const { 
    themeState, 
    spendCoins, 
    unlockTheme, 
    setCurrentTheme,
    unlockBlockShape,
    setCurrentBlockShape
  } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    // Play button sound for theme selection
    playSound('button', 0.7);
    
    // Only allow selection if theme is unlocked
    if (themeState.unlockedThemes.includes(themeId)) {
      setCurrentTheme(themeId);
    }
  };

  const handleThemePurchase = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme && themeState.coins >= theme.cost) {
      // Play purchase sound
      playSound('purchase', 0.8);
      
      spendCoins(theme.cost);
      unlockTheme(themeId);
      setCurrentTheme(themeId);
    } else {
      // Play failed sound if not enough coins
      playSound('failed', 0.5);
    }
  };

  const handleBlockShapeSelect = (shapeId: string) => {
    // Play button sound for shape selection
    playSound('button', 0.7);
    
    // Only allow selection if shape is unlocked
    if (themeState.unlockedBlockShapes.includes(shapeId)) {
      setCurrentBlockShape(shapeId);
    }
  };

  const handleBlockShapePurchase = (shapeId: string) => {
    const shape = BLOCK_SHAPES.find(s => s.id === shapeId);
    if (shape && themeState.coins >= shape.cost) {
      // Play purchase sound
      playSound('purchase', 0.8);
      
      spendCoins(shape.cost);
      unlockBlockShape(shapeId);
      setCurrentBlockShape(shapeId);
    } else {
      // Play failed sound if not enough coins
      playSound('failed', 0.5);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    // Play button sound for category selection
    playSound('button', 0.6);
    setSelectedCategory(categoryId);
  };

  const categories = [
    { id: 'themes', name: 'Themes', icon: <Palette size={16} color="#fff" /> },
    { id: 'shapes', name: 'Block Shapes', icon: <Box size={16} color="#fff" /> },
  ];

  const updatedThemes = THEMES.map(theme => ({
    ...theme,
    unlocked: themeState.unlockedThemes.includes(theme.id)
  }));

  const updatedBlockShapes = BLOCK_SHAPES.map(shape => ({
    ...shape,
    unlocked: themeState.unlockedBlockShapes.includes(shape.id)
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)']}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ShoppingBag size={24} color="#fff" />
          <Text style={styles.title}>Premium Shop</Text>
        </View>
        <View style={styles.coinsContainer}>
          <Coins size={20} color="#FFD700" />
          <Text style={styles.coinsText}>{themeState.coins}</Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategoryButton,
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            {category.icon}
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content based on selected category */}
      <ScrollView style={styles.themesContainer} showsVerticalScrollIndicator={false}>
        {selectedCategory === 'themes' && (
          <View style={styles.themesGrid}>
            {updatedThemes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  themeState.currentTheme === theme.id && styles.selectedThemeCard,
                ]}
                onPress={() => {
                  if (theme.unlocked) {
                    handleThemeSelect(theme.id);
                  } else if (themeState.coins >= theme.cost) {
                    handleThemePurchase(theme.id);
                  } else {
                    // Play failed sound if can't afford
                    playSound('failed', 0.5);
                  }
                }}
                disabled={!theme.unlocked && themeState.coins < theme.cost}
              >
                {/* Rarity Border */}
                <View style={[
                  styles.rarityBorder,
                  { borderColor: getRarityColor(theme.rarity || 'common') }
                ]} />
                
                {/* Theme Preview */}
                <LinearGradient
                  colors={theme.backgroundColors}
                  style={styles.themePreview}
                >
                  <View style={styles.blockPreview}>
                    {theme.blockColors.slice(0, 6).map((colors, index) => (
                      <LinearGradient
                        key={index}
                        colors={colors}
                        style={styles.miniBlock}
                      />
                    ))}
                  </View>
                  
                  {/* Locked Overlay */}
                  {!theme.unlocked && (
                    <View style={styles.lockedOverlay}>
                      <Lock size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                  )}
                </LinearGradient>
                
                {/* Theme Info */}
                <View style={styles.themeInfo}>
                  <View style={styles.themeHeader}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    {getRarityIcon(theme.rarity || 'common')}
                  </View>
                  
                  <Text style={styles.themeDescription} numberOfLines={2}>
                    {theme.description}
                  </Text>
                  
                  {/* Status/Action */}
                  <View style={styles.themeAction}>
                    {themeState.currentTheme === theme.id ? (
                      <View style={styles.selectedBadge}>
                        <Check size={14} color="#4facfe" />
                        <Text style={styles.selectedText}>Active</Text>
                      </View>
                    ) : theme.unlocked ? (
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => handleThemeSelect(theme.id)}
                      >
                        <Text style={styles.selectButtonText}>Select</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.priceContainer}>
                        {themeState.coins >= theme.cost ? (
                          <TouchableOpacity
                            style={styles.buyButton}
                            onPress={() => handleThemePurchase(theme.id)}
                          >
                            <Coins size={14} color="#FFD700" />
                            <Text style={styles.buyButtonText}>{theme.cost}</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            style={styles.cantAffordContainer}
                            onPress={() => playSound('failed', 0.4)}
                          >
                            <Coins size={14} color="#666" />
                            <Text style={styles.cantAffordText}>{theme.cost}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedCategory === 'shapes' && (
          <View style={styles.themesGrid}>
            {updatedBlockShapes.map((shape) => (
              <TouchableOpacity
                key={shape.id}
                style={[
                  styles.themeCard,
                  themeState.currentBlockShape === shape.id && styles.selectedThemeCard,
                ]}
                onPress={() => {
                  if (shape.unlocked) {
                    handleBlockShapeSelect(shape.id);
                  } else if (themeState.coins >= shape.cost) {
                    handleBlockShapePurchase(shape.id);
                  } else {
                    // Play failed sound if can't afford
                    playSound('failed', 0.5);
                  }
                }}
                disabled={!shape.unlocked && themeState.coins < shape.cost}
              >
                {/* Rarity Border */}
                <View style={[
                  styles.rarityBorder,
                  { borderColor: getRarityColor(shape.rarity || 'common') }
                ]} />
                
                {/* Shape Preview */}
                <View style={styles.shapePreviewContainer}>
                  <BlockShapePreview 
                    shape={shape} 
                    themeId={themeState.currentTheme}
                    size={80}
                  />
                  
                  {/* Locked Overlay */}
                  {!shape.unlocked && (
                    <View style={styles.lockedOverlay}>
                      <Lock size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                  )}
                </View>
                
                {/* Shape Info */}
                <View style={styles.themeInfo}>
                  <View style={styles.themeHeader}>
                    <Text style={styles.themeName}>{shape.name}</Text>
                    {getRarityIcon(shape.rarity || 'common')}
                  </View>
                  
                  <Text style={styles.themeDescription} numberOfLines={2}>
                    {shape.description}
                  </Text>
                  
                  {/* Status/Action */}
                  <View style={styles.themeAction}>
                    {themeState.currentBlockShape === shape.id ? (
                      <View style={styles.selectedBadge}>
                        <Check size={14} color="#4facfe" />
                        <Text style={styles.selectedText}>Active</Text>
                      </View>
                    ) : shape.unlocked ? (
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => handleBlockShapeSelect(shape.id)}
                      >
                        <Text style={styles.selectButtonText}>Select</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.priceContainer}>
                        {themeState.coins >= shape.cost ? (
                          <TouchableOpacity
                            style={styles.buyButton}
                            onPress={() => handleBlockShapePurchase(shape.id)}
                          >
                            <Coins size={14} color="#FFD700" />
                            <Text style={styles.buyButtonText}>{shape.cost}</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity 
                            style={styles.cantAffordContainer}
                            onPress={() => playSound('failed', 0.4)}
                          >
                            <Coins size={14} color="#666" />
                            <Text style={styles.cantAffordText}>{shape.cost}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60, // Account for status bar
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  coinsText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  categoryContainer: {
    maxHeight: 50,
    marginBottom: 15,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: 'rgba(79, 172, 254, 0.3)',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  selectedCategoryText: {
    color: '#4facfe',
  },
  themesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  selectedThemeCard: {
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
  },
  rarityBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#9e9e9e',
  },
  themePreview: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shapePreviewContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  blockPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBlock: {
    width: 18,
    height: 18,
    margin: 1,
    borderRadius: 3,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeInfo: {
    padding: 12,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  themeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    lineHeight: 16,
  },
  themeAction: {
    alignItems: 'flex-start',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 172, 254, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  selectedText: {
    color: '#4facfe',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  selectButton: {
    backgroundColor: '#4facfe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buyButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cantAffordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cantAffordText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    height: 20,
  },
});

                        >
                          <Coins size={14} color="#FFD700" />
                          <Text style={styles.buyButtonText}>{theme.cost}</Text>