import ExerciseDetailSheet, { ExerciseDetailSheetHandle } from '@/components/ExerciseDetailSheet';
import SettingsSheet, { SettingsSheetHandle } from '@/components/SettingsSheet';
import { useBreathingAnimationTokens, useWallpaperForeground } from "@/components/Theme";
import { useBreathing } from "@/contexts/breathingContext";
import { useApp } from "@/contexts/themeContext";
import { useBreathingAnimation } from "@/hooks/useBreathingAnimation";
import { useBreathingAudio } from "@/hooks/useBreathingAudio";
import { useBreathingCycle } from "@/hooks/useBreathingCycle";
import { useBreathingHaptics } from "@/hooks/useBreathingHaptics";
import { defaultExercises } from "@/lib/storage";
import { trackBreathingEntered, trackBreathingExited, trackBreathingStarted } from "@/utils/sentryTracking";
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from 'expo-blur';
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function BreathingPage() {
  const breathingAnim = useBreathingAnimationTokens();
  const wallpaperFg = useWallpaperForeground();
  const { currentExercise } = useBreathing();
  const { settings, backgroundImage } = useApp();
  const { autoStart } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUIVisible, setIsUIVisible] = useState(false);
  const sheetRef = useRef<ExerciseDetailSheetHandle>(null);
  const settingsSheetRef = useRef<SettingsSheetHandle>(null);
  const hasAutoStarted = useRef(false);
  const uiHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownInitialUI = useRef(false);
  const shouldHideImmediatelyRef = useRef(false);
  const uiOpacity = useSharedValue(0);
  
  // Tracking refs
  const sessionStartTimeRef = useRef<number | null>(null);
  const breathingReadyTimeRef = useRef<number | null>(null);
  const hasExitedRef = useRef(false);
  const hasTrackedEnteredRef = useRef(false);
  const hasTrackedStartedRef = useRef(false);
  
  const exercise = currentExercise || { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
  const { inhale, hold1, exhale, hold2 } = exercise;
  
  // Get Deep Breathing exercise for info sheet (id: "1")
  const deepBreathingExercise = defaultExercises.find(ex => ex.id === "1") || defaultExercises[0];

  // Initialize custom hooks
  const { radius, strokeWidth, animateInhale, animateExhale, pause: pauseAnimation, resume: resumeAnimation, reset } = useBreathingAnimation();
  
  // Use refs to store callbacks so they can be accessed before hooks are defined
  const playInhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const playExhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const triggerHapticRef = useRef<((style: Haptics.ImpactFeedbackStyle) => Promise<void>) | null>(null);
  const startContinuousVibrationRef = useRef<(() => void) | null>(null);
  const stopVibrationRef = useRef<(() => void) | null>(null);
  const stopSoundRef = useRef<(() => void) | null>(null);
  const forceStopSoundRef = useRef<(() => void) | null>(null);
  const forceStopHapticsRef = useRef<(() => void) | null>(null);
  const pauseAnimationRef = useRef<(() => void) | null>(null);
  const resumeAnimationRef = useRef<((phase: 'inhale' | 'exhale' | 'hold1' | 'hold2', remainingDuration: number) => void) | null>(null);
  
  const { phase, timeLeft, isRunning, isPaused, start, pause, resume, stop } = useBreathingCycle({
    exercise,
    onPhaseChange: async (phase, duration) => {
      // Handle animations and sounds based on phase
      if (phase === 'inhale') {
        animateInhale(duration);
        startContinuousVibrationRef.current?.();
        // Play inhale sound
        await playInhaleSoundRef.current?.();
      } else if (phase === 'exhale') {
        animateExhale(duration);
        // Play exhale sound
        await playExhaleSoundRef.current?.();
      }
      
      // Stop vibration after inhale phase completes
      if (phase === 'hold1') {
        stopVibrationRef.current?.();
      }
    },
    onCycleStart: async () => {
      // Play haptic at cycle start
      await triggerHapticRef.current?.(Haptics.ImpactFeedbackStyle.Medium);
    }
  });
  
  const { playInhaleSound, playExhaleSound, stopSound, forceStop: forceStopSound } = useBreathingAudio({
    soundEnabled: settings.soundEnabled,
    isRunning,
    soundType: settings.soundType
  });
  
  const { triggerHaptic, startContinuousVibration, stopVibration, forceStop: forceStopHaptics } = useBreathingHaptics({
    hapticsEnabled: settings.hapticsEnabled,
    isRunning
  });
  
  // Update refs when callbacks are available
  useEffect(() => {
    playInhaleSoundRef.current = playInhaleSound;
    playExhaleSoundRef.current = playExhaleSound;
    stopSoundRef.current = stopSound;
    forceStopSoundRef.current = forceStopSound;
    triggerHapticRef.current = triggerHaptic;
    startContinuousVibrationRef.current = startContinuousVibration;
    stopVibrationRef.current = stopVibration;
    forceStopHapticsRef.current = forceStopHaptics;
    pauseAnimationRef.current = pauseAnimation;
    resumeAnimationRef.current = resumeAnimation;
    
    // Track breathing_ready when all hooks are initialized
    if (breathingReadyTimeRef.current === null) {
      breathingReadyTimeRef.current = Date.now();
    }
  }, [playInhaleSound, playExhaleSound, stopSound, forceStopSound, triggerHaptic, startContinuousVibration, stopVibration, forceStopHaptics, pauseAnimation, resumeAnimation]);

  // Sync uiOpacity shared value with isUIVisible state (moved from render to effect)
  useEffect(() => {
    // Clear existing timeout when visibility changes
    if (uiHideTimeoutRef.current) {
      clearTimeout(uiHideTimeoutRef.current);
      uiHideTimeoutRef.current = null;
    }

    if (isUIVisible) {
      // Show UI with animation
      uiOpacity.value = withTiming(1, { duration: 300 });
      
      // Auto-hide after delay (3 seconds for initial start, 5 seconds for manual toggle)
      const hideDelay = hasShownInitialUI.current ? 3500 : 3000;
      uiHideTimeoutRef.current = setTimeout(() => {
        uiOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(() => {
          setIsUIVisible(false);
          uiHideTimeoutRef.current = null;
        }, 300);
      }, hideDelay);
    } else {
      // Hide UI with animation (or immediately if needed)
      if (shouldHideImmediatelyRef.current) {
        uiOpacity.value = 0; // Set immediately without animation
        shouldHideImmediatelyRef.current = false;
      } else {
        uiOpacity.value = withTiming(0, { duration: 300 });
      }
    }

    // Cleanup timeout on unmount or when isUIVisible changes
    return () => {
      if (uiHideTimeoutRef.current) {
        clearTimeout(uiHideTimeoutRef.current);
        uiHideTimeoutRef.current = null;
      }
    };
  }, [isUIVisible]);

  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,
    strokeWidth: strokeWidth.value,
  }));

  const uiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
  }));

  const handleStart = () => {
    start();
    
    // Track breathing_started (only once per session)
    if (!hasTrackedStartedRef.current) {
      hasTrackedStartedRef.current = true;
      sessionStartTimeRef.current = Date.now();
      trackBreathingStarted(settings.soundEnabled, settings.hapticsEnabled);
    }
    
    // Show UI on first start, then fade away after 3 seconds
    if (!hasShownInitialUI.current) {
      hasShownInitialUI.current = true;
      setIsUIVisible(true);
    }
  };

  const handlePause = () => {
    // Pause everything: cycle, animation, sounds, haptics
    pause();
    pauseAnimationRef.current?.();
    stopVibration();
    stopSound();
  };

  const handleResume = () => {
    // Resume from where we paused
    resume();
    
    // Resume animation from current position to target for current phase
    // Calculate remaining duration from timeLeft (convert seconds to milliseconds)
    const remainingDuration = timeLeft * 1000;
    if (remainingDuration > 0 && (phase === 'inhale' || phase === 'exhale')) {
      resumeAnimationRef.current?.(phase, remainingDuration);
    }
    // For hold phases, animation stays at current position (no animation needed)
    
    // Sounds and haptics will resume when cycle continues
  };

  const handleStopAndExit = () => {
    // Track exit before stopping
    if (!hasExitedRef.current) {
      hasExitedRef.current = true;
      const elapsedSeconds = sessionStartTimeRef.current 
        ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
        : 0;
      const breathingReadyMs = breathingReadyTimeRef.current && sessionStartTimeRef.current
        ? sessionStartTimeRef.current - breathingReadyTimeRef.current
        : undefined;
      
      trackBreathingExited(
        settings.soundEnabled,
        settings.hapticsEnabled,
        elapsedSeconds,
        'user_exit',
        breathingReadyMs
      );
    }
    
    // Force stop everything immediately, even mid-sound
    stop();
    pauseAnimationRef.current?.();
    forceStopHapticsRef.current?.();
    forceStopSoundRef.current?.();
    reset();
    
    // Immediately hide UI controls to prevent them from lingering
    if (uiHideTimeoutRef.current) {
      clearTimeout(uiHideTimeoutRef.current);
      uiHideTimeoutRef.current = null;
    }
    shouldHideImmediatelyRef.current = true;
    setIsUIVisible(false);
    
    // Small delay to ensure everything is stopped before navigation
    setTimeout(() => {
      router.push('/');
    }, 50);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      handlePause();
    } else if (isPaused) {
      handleResume();
    } else {
      handleStart();
    }
  };

  const handleInfoPress = () => {
    setIsSheetOpen(true);
    sheetRef.current?.open();
  };

  const handleSettingsPress = () => {
    setIsSheetOpen(true);
    settingsSheetRef.current?.open();
  };

  const handleSheetChange = useCallback((index: number) => {
    setIsSheetOpen(index >= 0);
  }, []);

  const handleSheetDismiss = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const closeSheet = () => {
    sheetRef.current?.close();
    settingsSheetRef.current?.close();
  };

  const handleScreenTap = () => {
    // Only toggle UI visibility, do not pause/resume exercise
    // Clear existing timeout
    if (uiHideTimeoutRef.current) {
      clearTimeout(uiHideTimeoutRef.current);
      uiHideTimeoutRef.current = null;
    }
    
    setIsUIVisible(prev => !prev);
  };

  // Track breathing_entered when component mounts
  useEffect(() => {
    if (!hasTrackedEnteredRef.current) {
      hasTrackedEnteredRef.current = true;
      breathingReadyTimeRef.current = Date.now();
      trackBreathingEntered(settings.soundEnabled, settings.hapticsEnabled);
    }
  }, [settings.soundEnabled, settings.hapticsEnabled]);

  // Auto-start breathing exercise if navigating from index page
  useEffect(() => {
    if (autoStart === 'true' && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      // Use a small delay to ensure all hooks are initialized
      const timer = setTimeout(() => {
        start();
        
        // Track breathing_started for auto-start
        if (!hasTrackedStartedRef.current) {
          hasTrackedStartedRef.current = true;
          sessionStartTimeRef.current = Date.now();
          trackBreathingStarted(settings.soundEnabled, settings.hapticsEnabled);
        }
        
        // Show UI on first start, then fade away after 3 seconds
        if (!hasShownInitialUI.current) {
          hasShownInitialUI.current = true;
          setIsUIVisible(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoStart, start, settings.soundEnabled, settings.hapticsEnabled]);

  // Hide status bar when screen is focused, restore when screen loses focus
  // Using useFocusEffect ensures it works reliably with Expo Router navigation
  useFocusEffect(
    useCallback(() => {
      // Hide status bar when entering breathing screen
      StatusBar.setHidden(true, 'fade');
      
      // Restore status bar when leaving breathing screen
      return () => {
        StatusBar.setHidden(false, 'fade');
      };
    }, [])
  );

  // Track AppState changes for background detection
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Track exit due to backgrounding
        if (!hasExitedRef.current && sessionStartTimeRef.current) {
          hasExitedRef.current = true;
          const elapsedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
          const breathingReadyMs = breathingReadyTimeRef.current && sessionStartTimeRef.current
            ? sessionStartTimeRef.current - breathingReadyTimeRef.current
            : undefined;
          
          trackBreathingExited(
            settings.soundEnabled,
            settings.hapticsEnabled,
            elapsedSeconds,
            'background',
            breathingReadyMs
          );
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [settings.soundEnabled, settings.hapticsEnabled]);

  // Cleanup on unmount - force stop everything
  useEffect(() => {
    return () => {
      // Track exit due to unmount (if not already tracked)
      if (!hasExitedRef.current && sessionStartTimeRef.current) {
        hasExitedRef.current = true;
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        const breathingReadyMs = breathingReadyTimeRef.current && sessionStartTimeRef.current
          ? sessionStartTimeRef.current - breathingReadyTimeRef.current
          : undefined;
        
        trackBreathingExited(
          settings.soundEnabled,
          settings.hapticsEnabled,
          elapsedSeconds,
          'unmount',
          breathingReadyMs
        );
      }
      
      // Force stop everything when component unmounts
      stop();
      pauseAnimationRef.current?.();
      forceStopHapticsRef.current?.();
      forceStopSoundRef.current?.();
      
      // Clear UI hide timeout and immediately hide UI
      if (uiHideTimeoutRef.current) {
        clearTimeout(uiHideTimeoutRef.current);
        uiHideTimeoutRef.current = null;
      }
      shouldHideImmediatelyRef.current = true;
      setIsUIVisible(false);
      // Note: uiOpacity.value will be set to 0 in useEffect when isUIVisible becomes false
    };
  }, [stop, settings.soundEnabled, settings.hapticsEnabled]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: backgroundImage ? 'transparent' : '#FFFFFF' }}>
          
          {/* Main Content Area - Tap to toggle UI */}
          <Pressable 
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            onPress={handleScreenTap}
          >
            {/* Breathing Animation */}
            <View style={{ alignItems: 'center', position: 'relative' }}>
              <Svg width={400} height={400}>
                {/* Outer circle */}
                <Circle cx={200} cy={200} r={180} stroke={breathingAnim.guideOuterStroke} strokeWidth={1} fill="none" opacity={0.6} />
                {/* Middle circle */}
                <Circle cx={200} cy={200} r={65} stroke={breathingAnim.guideInnerStroke} strokeWidth={1} fill="none" opacity={0.6} />
                {/* Inner animated circle */}
                <AnimatedCircle 
                  cx={200} 
                  cy={200} 
                  animatedProps={animatedProps} 
                  stroke={breathingAnim.mainStroke} 
                  fill={breathingAnim.mainFill} 
                  strokeLinecap="round"
                  opacity={0.8}
                />
              </Svg>
              
              {/* Phase text overlay */}
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ 
                  color: wallpaperFg, 
                  fontSize: 32, 
                  fontWeight: '300',
                  letterSpacing: 2,
                  textTransform: 'uppercase'
                }}>
                  {phase === 'inhale' ? 'Inhale' : 
                   phase === 'hold1' ? 'Hold' : 
                   phase === 'exhale' ? 'Exhale' : 
                   phase === 'hold2' ? 'Hold' : ''}
                </Text>
              </View>
              
              {/* Inner circle tap area - only the small inner circle is tappable */}
              <Pressable 
                onPress={() => {
                  handlePlayPause();
                  // Also show UI when pausing/resuming for better UX
                  if (!isUIVisible) {
                    // Clear existing timeout
                    if (uiHideTimeoutRef.current) {
                      clearTimeout(uiHideTimeoutRef.current);
                    }
                    setIsUIVisible(true);
                  }
                }}
                style={{
                  position: 'absolute',
                  width: 140, // Slightly larger than minimum inner circle (radius 66 = diameter 132) for easier tapping
                  height: 140,
                  borderRadius: 70,
                  top: '50%',
                  left: '50%',
                  marginTop: -70, // Center the pressable (half of height)
                  marginLeft: -70, // Center the pressable (half of width)
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            </View>
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
            <Pressable onPress={handleStopAndExit}>
              <Text style={{ color: wallpaperFg, fontSize: 28 }}>←</Text>
            </Pressable>
            
            {/* Info Icon */}
            <Pressable onPress={handleInfoPress} style={{ 
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
          <Animated.View style={[
            { 
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 40,
              paddingBottom: 50,
              paddingHorizontal: 24,
              pointerEvents: isUIVisible ? 'auto' : 'none',
            },
            uiAnimatedStyle
          ]}>
            {/* Settings Button - Left */}
            <Pressable
              onPress={handleSettingsPress}
              style={{
                width: 80,
                height: 80,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons 
                name="options" 
                size={38} 
                color={wallpaperFg} 
              />
            </Pressable>
            
            {/* Play/Pause Button - Middle */}
            <Pressable
              onPress={handlePlayPause}
              style={{
                width: 70,
                height: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isRunning ? (
                <Ionicons 
                  name="pause" 
                  size={38} 
                  color={wallpaperFg} 
                />
              ) : (
                <Ionicons 
                  name="play" 
                  size={38} 
                  color={wallpaperFg} 
                />
              )}
            </Pressable>
            
            {/* Stop Button - Right */}
            <Pressable
              onPress={handleStopAndExit}
              style={{
                width: 70,
                height: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons 
                name="stop" 
                size={38} 
                color={wallpaperFg} 
              />
            </Pressable>
          </Animated.View>

          {/* Blurred backdrop (tap to dismiss) */}
          {isSheetOpen && (
            <Pressable onPress={closeSheet} style={StyleSheet.absoluteFill}>
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

          {/* Bottom Sheet Modals */}
          <ExerciseDetailSheet 
            ref={sheetRef} 
            exercise={deepBreathingExercise}
            onChange={handleSheetChange}
            onDismiss={handleSheetDismiss}
          />
          
          <SettingsSheet 
            ref={settingsSheetRef}
            onChange={handleSheetChange}
            onDismiss={handleSheetDismiss}
          />
    </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
