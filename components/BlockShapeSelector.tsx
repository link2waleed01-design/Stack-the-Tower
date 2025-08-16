import React from 'react';
+import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
+import { LinearGradient } from 'expo-linear-gradient';
+import { Check, Box } from 'lucide-react-native';
+import { BlockShape } from '../types/game';
+import { BLOCK_SHAPES } from '../constants/game';
+import { getBlockColors } from '../utils/gameLogic';
+
+interface BlockShapeSelectorProps {
+  visible: boolean;
+  currentShape: string;
+  unlockedShapes: string[];
+  currentTheme: string;
+  onShapeSelect: (shapeId: string) => void;
+  onClose: () => void;
+}
+
+// Block Shape Preview Component
+const BlockShapePreview: React.FC<{
+  shape: BlockShape;
+  themeId: string;
+  size?: number;
+}> = ({ shape, themeId, size = 80 }) => {
+  const scaleX = size / shape.preview.width;
+  const scaleY = (size * 0.6) / shape.preview.height;
+
+  const renderElement = (element: any, index: number) => {
+    const colors = getBlockColors(element.colorIndex, themeId);
+    const elementStyle = {
+      position: 'absolute' as const,
+      left: element.x * scaleX,
+      top: element.y * scaleY,
+      width: element.width * scaleX,
+      height: element.height * scaleY,
+      opacity: element.opacity || 1,
+    };
+
+    switch (element.type) {
+      case 'triangle':
+        return (
+          <View
+            key={`${element.id}-${index}`}
+            style={[
+              elementStyle,
+              {
+                width: 0,
+                height: 0,
+                backgroundColor: 'transparent',
+                borderStyle: 'solid',
+                borderLeftWidth: (element.width * scaleX) / 2,
+                borderRightWidth: (element.width * scaleX) / 2,
+                borderBottomWidth: element.height * scaleY,
+                borderLeftColor: 'transparent',
+                borderRightColor: 'transparent',
+                borderBottomColor: colors[0],
+              },
+            ]}
+          />
+        );
+      case 'circle':
+        return (
+          <View
+            key={`${element.id}-${index}`}
+            style={[
+              elementStyle,
+              {
+                backgroundColor: colors[0],
+                borderRadius: (element.width * scaleX) / 2,
+              },
+            ]}
+          />
+        );
+      case 'rect':
+      default:
+        return (
+          <LinearGradient
+            key={`${element.id}-${index}`}
+            colors={[colors[0], colors[1]]}
+            style={[
+              elementStyle,
+              {
+                borderRadius: (element.borderRadius || 0) * Math.min(scaleX, scaleY),
+              },
+            ]}
+            start={{ x: 0, y: 0 }}
+            end={{ x: 1, y: 1 }}
+          />
+        );
+    }
+  };
+
+  return (
+    <View style={{ width: size, height: size * 0.6, position: 'relative' }}>
+      {shape.preview.elements.map(renderElement)}
+    </View>
+  );
+};
+
+export const BlockShapeSelector: React.FC<BlockShapeSelectorProps> = ({
+  visible,
+  currentShape,
+  unlockedShapes,
+  currentTheme,
+  onShapeSelect,
+  onClose,
+}) => {
+  if (!visible) return null;
+
+  const unlockedShapesList = BLOCK_SHAPES.filter(shape =>
+    unlockedShapes.includes(shape.id)
+  );
+
+  return (
+    <View style={styles.overlay}>
+      <View style={styles.container}>
+        <LinearGradient
+          colors={['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.8)']}
+          style={styles.background}
+        />
+        
+        <View style={styles.header}>
+          <Box size={24} color="#fff" />
+          <Text style={styles.title}>Select Block Shape</Text>
+          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
+            <Text style={styles.closeText}>×</Text>
+          </TouchableOpacity>
+        </View>
+
+        <ScrollView style={styles.shapesContainer} showsVerticalScrollIndicator={false}>
+          <Text style={styles.subtitle}>Your Unlocked Shapes</Text>
+          {unlockedShapesList.length === 0 ? (
+            <View style={styles.emptyState}>
+              <Text style={styles.emptyText}>No shapes unlocked yet!</Text>
+              <Text style={styles.emptySubtext}>Visit the shop to purchase new block shapes</Text>
+            </View>
+          ) : (
+            unlockedShapesList.map((shape) => (
+              <TouchableOpacity
+                key={shape.id}
+                style={[
+                  styles.shapeCard,
+                  currentShape === shape.id && styles.selectedShapeCard,
+                ]}
+                onPress={() => onShapeSelect(shape.id)}
+              >
+                <View style={styles.shapePreview}>
+                  <BlockShapePreview 
+                    shape={shape} 
+                    themeId={currentTheme}
+                    size={60}
+                  />
+                </View>
                 
-                          <Coins size={14} color="#FFD700" />
-                          <Text style={styles.buyButtonText}>{theme.cost}</Text>
-                        </TouchableOpacity>
-                      ) : (
-                        <TouchableOpacity 
-                          style={styles.cantAffordContainer}
-                          onPress={() => playSound('failed', 0.4)}
+                <View style={styles.shapeInfo}>
+                  <Text style={styles.shapeName}>{shape.name}</Text>
+                  <Text style={styles.shapeDescription} numberOfLines={2}>
+                    {shape.description}
+                  </Text>
+                  
+                  {currentShape === shape.id ? (
+                    <View style={styles.selectedBadge}>
+                      <Check size={16} color="#4facfe" />
+                      <Text style={styles.selectedText}>Selected</Text>
+                    </View>
+                  ) : (
+                    <TouchableOpacity
+                      style={styles.selectButton}
+                      onPress={() => onShapeSelect(shape.id)}
+                    >
+                      <Text style={styles.selectButtonText}>Select</Text>
+                    </TouchableOpacity>
+                  )}
+                </View>
+              </TouchableOpacity>
+            ))
+          )}
+          
+          <View style={styles.shopPrompt}>
+            <Text style={styles.shopPromptText}>
+              Want more shapes? Visit the Premium Shop!
+            </Text>
+          </View>
+        </ScrollView>
+      </View>
+    </View>
+  );
+};
+
+const styles = StyleSheet.create({
+  overlay: {
+    position: 'absolute',
+    top: 0,
+    left: 0,
+    right: 0,
+    bottom: 0,
+    justifyContent: 'center',
+    alignItems: 'center',
+    zIndex: 1000,
+  },
+  container: {
+    width: '90%',
+    maxWidth: 400,
+    height: '80%',
+    borderRadius: 20,
+    overflow: 'hidden',
+  },
+  background: {
+    ...StyleSheet.absoluteFillObject,
+  },
+  header: {
+    flexDirection: 'row',
+    justifyContent: 'space-between',
+    alignItems: 'center',
+    padding: 20,
+    paddingBottom: 10,
+  },
+  title: {
+    fontSize: 24,
+    fontWeight: 'bold',
+    color: '#fff',
+    flex: 1,
+    marginLeft: 10,
+  },
+  subtitle: {
+    fontSize: 16,
+    color: 'rgba(255, 255, 255, 0.8)',
+    marginBottom: 15,
+    textAlign: 'center',
+  },
+  closeButton: {
+    width: 30,
+    height: 30,
+    borderRadius: 15,
+    backgroundColor: 'rgba(255, 255, 255, 0.2)',
+    justifyContent: 'center',
+    alignItems: 'center',
+  },
+  closeText: {
+    fontSize: 20,
+    color: '#fff',
+    fontWeight: 'bold',
+  },
+  shapesContainer: {
+    flex: 1,
+    paddingHorizontal: 20,
+    paddingBottom: 20,
+  },
+  emptyState: {
+    flex: 1,
+    justifyContent: 'center',
+    alignItems: 'center',
+    paddingVertical: 40,
+  },
+  emptyText: {
+    fontSize: 18,
+    color: 'rgba(255, 255, 255, 0.8)',
+    textAlign: 'center',
+    marginBottom: 10,
+  },
+  emptySubtext: {
+    fontSize: 14,
+    color: 'rgba(255, 255, 255, 0.6)',
+    textAlign: 'center',
+  },
+  shapeCard: {
+    flexDirection: 'row',
+    marginBottom: 15,
+    borderRadius: 15,
+    backgroundColor: 'rgba(255, 255, 255, 0.1)',
+    overflow: 'hidden',
+  },
+  selectedShapeCard: {
+    borderWidth: 2,
+    borderColor: '#4facfe',
+  },
+  shapePreview: {
+    width: 80,
+    height: 80,
+    justifyContent: 'center',
+    alignItems: 'center',
+    backgroundColor: 'rgba(0, 0, 0, 0.3)',
+  },
+  shapeInfo: {
+    flex: 1,
+    padding: 15,
+    justifyContent: 'space-between',
+  },
+  shapeName: {
+    fontSize: 16,
+    fontWeight: 'bold',
+    color: '#fff',
+    marginBottom: 5,
+  },
+  shapeDescription: {
+    fontSize: 12,
+    color: 'rgba(255, 255, 255, 0.7)',
+    marginBottom: 10,
+    lineHeight: 16,
+  },
+  selectedBadge: {
+    flexDirection: 'row',
+    alignItems: 'center',
+  },
+  selectedText: {
+    color: '#4facfe',
+    fontSize: 14,
+    fontWeight: '600',
+    marginLeft: 5,
+  },
+  selectButton: {
+    backgroundColor: '#4facfe',
+    paddingHorizontal: 15,
+    paddingVertical: 6,
+    borderRadius: 12,
+    alignSelf: 'flex-start',
+  },
+  selectButtonText: {
+    color: '#fff',
+    fontSize: 14,
+    fontWeight: '600',
+  },
+  shopPrompt: {
+    marginTop: 20,
+    padding: 15,
+    backgroundColor: 'rgba(79, 172, 254, 0.1)',
+    borderRadius: 10,
+    borderWidth: 1,
+    borderColor: 'rgba(79, 172, 254, 0.3)',
+  },
+  shopPromptText: {
+    color: '#4facfe',
+    fontSize: 14,
+    textAlign: 'center',
+    fontWeight: '500',
+  },
+});
+