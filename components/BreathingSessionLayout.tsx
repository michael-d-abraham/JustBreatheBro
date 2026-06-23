import BreathingControls from '@/components/BreathingControls';
import BreathingRing from '@/components/BreathingRing';
import ExerciseDetailSheet, { ExerciseDetailSheetHandle } from '@/components/ExerciseDetailSheet';
import SettingsSheet, { SettingsSheetHandle } from '@/components/SettingsSheet';
import { useWallpaperForeground } from "@/components/Theme";
import { BreathingPhase } from "@/hooks/useBreathingCycle";
import { Exercise } from "@/lib/storage";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { SharedValue } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface BreathingSessionLayoutProps {
  backgroundImage: string | null;
  currentExercise: Exercise | null;
  phase: BreathingPhase;
  radius: SharedValue<number>;
  strokeWidth: SharedValue<number>;
  isRunning: boolean;
  isUIVisible: boolean;
  isSheetOpen: boolean;
  uiAnimatedStyle: StyleProp<ViewStyle>;
  sheetRef: React.RefObject<ExerciseDetailSheetHandle | null>;
  settingsSheetRef: React.RefObject<SettingsSheetHandle | null>;
  onScreenTap: () => void;
  onRingInnerPress: () => void;
  onStopAndExit: () => void;
  onInfoPress: () => void;
  onSettingsPress: () => void;
  onPlayPause: () => void;
  onCloseSheet: () => void;
  onSheetChange: (index: number) => void;
  onSheetDismiss: () => void;
}

export default function BreathingSessionLayout({
  backgroundImage,
  currentExercise,
  phase,
  radius,
  strokeWidth,
  isRunning,
  isUIVisible,
  isSheetOpen,
  uiAnimatedStyle,
  sheetRef,
  settingsSheetRef,
  onScreenTap,
  onRingInnerPress,
  onStopAndExit,
  onInfoPress,
  onSettingsPress,
  onPlayPause,
  onCloseSheet,
  onSheetChange,
  onSheetDismiss,
}: BreathingSessionLayoutProps) {
  const wallpaperFg = useWallpaperForeground();
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: backgroundImage ? 'transparent' : '#FFFFFF' }}>
          
          {/* Main Content Area - Tap to toggle UI */}
          <Pressable 
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            onPress={onScreenTap}
          >
            {/* Breathing Animation */}
            <BreathingRing
              phase={phase}
              radius={radius}
              strokeWidth={strokeWidth}
              onInnerPress={onRingInnerPress}
            />
          </Pressable>

          {/* Header - Back Arrow (Left) and Info Icon (Right) - Overlay, only visible when UI is shown */}
          <Animated.View style={[
            { 
              position: 'absolute',
              top: insets.top,
              left: 0,
              right: 0,
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 8,
              pointerEvents: isUIVisible ? 'auto' : 'none',
            },
            uiAnimatedStyle
          ]}>
            {/* Back Arrow */}
            <Pressable onPress={onStopAndExit}>
              <Text style={{ color: wallpaperFg, fontSize: 28 }}>←</Text>
            </Pressable>
            
            {/* Info Icon */}
            <Pressable onPress={onInfoPress} style={{ 
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: wallpaperFg,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: wallpaperFg, fontSize: 16, fontWeight: '600' }}>i</Text>
            </Pressable>
          </Animated.View>

          {/* Bottom Control Buttons Row - Overlay, only visible when UI is shown */}
          <BreathingControls
            isRunning={isRunning}
            isUIVisible={isUIVisible}
            animatedStyle={uiAnimatedStyle}
            onSettingsPress={onSettingsPress}
            onPlayPause={onPlayPause}
            onStopPress={onStopAndExit}
          />

          {/* Blurred backdrop (tap to dismiss) */}
          {isSheetOpen && (
            <Pressable onPress={onCloseSheet} style={StyleSheet.absoluteFill}>
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

          {/* Bottom Sheet Modals */}
          <ExerciseDetailSheet 
            ref={sheetRef} 
            exercise={currentExercise}
            onChange={onSheetChange}
            onDismiss={onSheetDismiss}
          />
          
          <SettingsSheet 
            ref={settingsSheetRef}
            onChange={onSheetChange}
            onDismiss={onSheetDismiss}
          />
    </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
