import BreathingSessionLayout from '@/components/BreathingSessionLayout';
import { ExerciseDetailSheetHandle } from '@/components/ExerciseDetailSheet';
import { SettingsSheetHandle } from '@/components/SettingsSheet';
import { useBreathing } from "@/contexts/breathingContext";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { useBreathingAnimation } from "@/hooks/useBreathingAnimation";
import { useBreathingAudio } from "@/hooks/useBreathingAudio";
import { BreathingPhase, useBreathingCycle } from "@/hooks/useBreathingCycle";
import { BeginBreathingPhaseHapticsArgs, useBreathingHaptics } from "@/hooks/useBreathingHaptics";
import { trackBreathingEntered, trackBreathingExited, trackBreathingStarted } from "@/utils/sentryTracking";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, StatusBar } from "react-native";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const BREATHING_PHASE_HAPTICS: Record<
  "inhale" | "hold" | "exhale",
  Omit<BeginBreathingPhaseHapticsArgs, "durationMs" | "resumeMidPhase">
> = {
  inhale: {
    targetIntervalMs: 800,
    pulseIntensity: Haptics.ImpactFeedbackStyle.Soft,
    transitionIntensity: Haptics.ImpactFeedbackStyle.Medium,
  },
  hold: {
    targetIntervalMs: 800,
    pulseIntensity: Haptics.ImpactFeedbackStyle.Soft,
    transitionIntensity: Haptics.ImpactFeedbackStyle.Light,
  },
  exhale: {
    targetIntervalMs: 800,
    pulseIntensity: Haptics.ImpactFeedbackStyle.Soft,
    transitionIntensity: Haptics.ImpactFeedbackStyle.Medium,
  },
};

function hapticArgsForBreathingPhase(
  phase: BreathingPhase,
  durationMs: number,
  resumeMidPhase: boolean
): BeginBreathingPhaseHapticsArgs | null {
  if (phase === "idle") return null;
  const base =
    phase === "inhale"
      ? BREATHING_PHASE_HAPTICS.inhale
      : phase === "exhale"
        ? BREATHING_PHASE_HAPTICS.exhale
        : BREATHING_PHASE_HAPTICS.hold;
  return { ...base, durationMs, resumeMidPhase };
}

export default function BreathingPage() {
  const { currentExercise } = useBreathing();
  const { settings, backgroundImage } = useAppSettings();
  const { autoStart } = useLocalSearchParams();
  
  // ==========================================================================
  // State/setup
  // ==========================================================================
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
  
  // Current exercise pattern (fallback to a safe default)
  const exercise = currentExercise || { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };

  // ==========================================================================
  // Animation logic (breathing ring)
  // ==========================================================================
  // Initialize custom hooks
  const { radius, strokeWidth, animateInhale, animateExhale, pause: pauseAnimation, resume: resumeAnimation, reset } = useBreathingAnimation();
  
  // ==========================================================================
  // Side-effect callback refs (audio/haptics/animation driven from phase changes)
  // ==========================================================================
  // Use refs to store callbacks so they can be accessed from inside `useBreathingCycle` config.
  const playInhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const playExhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const beginPhaseHapticsRef = useRef<((args: BeginBreathingPhaseHapticsArgs) => void) | null>(null);
  const stopSoundRef = useRef<(() => void) | null>(null);
  const forceStopSoundRef = useRef<(() => void) | null>(null);
  const pauseAnimationRef = useRef<(() => void) | null>(null);
  const resumeAnimationRef = useRef<((phase: 'inhale' | 'exhale' | 'hold1' | 'hold2', remainingDuration: number) => void) | null>(null);
  
  // ==========================================================================
  // Core logic (breathing cycle state machine)
  // ==========================================================================
  const { phase, timeLeft, isRunning, isPaused, start, pause, resume, stop } = useBreathingCycle({
    exercise,
    onPhaseChange: async (phase, duration) => {
      const hapticArgs = hapticArgsForBreathingPhase(phase, duration, false);
      if (hapticArgs) {
        beginPhaseHapticsRef.current?.(hapticArgs);
      }

      if (phase === 'inhale') {
        animateInhale(duration);
        await playInhaleSoundRef.current?.();
      } else if (phase === 'exhale') {
        animateExhale(duration);
        await playExhaleSoundRef.current?.();
      }
    },
  });
  
  // ==========================================================================
  // Audio logic (inhale/exhale sounds)
  // ==========================================================================
  const { playInhaleSound, playExhaleSound, stopSound, forceStop: forceStopSound } = useBreathingAudio({
    soundEnabled: settings.soundEnabled,
    isRunning,
    soundType: settings.soundType
  });
  
  // ==========================================================================
  // Haptics logic (quantized phase pulses + transitions)
  // ==========================================================================
  const { beginPhase: beginPhaseHaptics, cancel: cancelHaptics } = useBreathingHaptics({
    hapticsEnabled: settings.hapticsEnabled,
  });
  beginPhaseHapticsRef.current = beginPhaseHaptics;
  
  // ==========================================================================
  // Effects (wiring: keep latest callbacks in refs)
  // ==========================================================================
  useEffect(() => {
    playInhaleSoundRef.current = playInhaleSound;
    playExhaleSoundRef.current = playExhaleSound;
    stopSoundRef.current = stopSound;
    forceStopSoundRef.current = forceStopSound;
    pauseAnimationRef.current = pauseAnimation;
    resumeAnimationRef.current = resumeAnimation;
    
    // Track breathing_ready when all hooks are initialized
    if (breathingReadyTimeRef.current === null) {
      breathingReadyTimeRef.current = Date.now();
    }
  }, [playInhaleSound, playExhaleSound, stopSound, forceStopSound, pauseAnimation, resumeAnimation]);

  // ==========================================================================
  // Effects (UI visibility controller)
  // ==========================================================================
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
  }, [isUIVisible, uiOpacity]);

  // ==========================================================================
  // Derived animated values
  // ==========================================================================
  const uiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
  }));

  // ==========================================================================
  // Event handlers (session controls)
  // ==========================================================================
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
    cancelHaptics();
    stopSound();
  };

  const handleResume = () => {
    resume();

    const remainingDuration = timeLeft * 1000;
    if (remainingDuration > 0 && (phase === 'inhale' || phase === 'exhale')) {
      resumeAnimationRef.current?.(phase, remainingDuration);
    }

    if (remainingDuration > 0 && phase !== 'idle') {
      const args = hapticArgsForBreathingPhase(phase, remainingDuration, true);
      if (args) {
        beginPhaseHaptics(args);
      }
    }
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
    cancelHaptics();
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

  // ==========================================================================
  // Event handlers (bottom sheets)
  // ==========================================================================
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

  // ==========================================================================
  // Effects (analytics + auto-start)
  // ==========================================================================
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

  // ==========================================================================
  // Effects (navigation/system UI)
  // ==========================================================================
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

  // ==========================================================================
  // Effects (session exit tracking)
  // ==========================================================================
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

  // Cleanup on unmount - force stop everything (and track unmount exit)
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
      cancelHaptics();
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
  }, [stop, settings.soundEnabled, settings.hapticsEnabled, cancelHaptics]);

  // ==========================================================================
  // Main render
  // ==========================================================================
  return (
    <BreathingSessionLayout
      backgroundImage={backgroundImage}
      currentExercise={currentExercise}
      phase={phase}
      radius={radius}
      strokeWidth={strokeWidth}
      isRunning={isRunning}
      isUIVisible={isUIVisible}
      isSheetOpen={isSheetOpen}
      uiAnimatedStyle={uiAnimatedStyle}
      sheetRef={sheetRef}
      settingsSheetRef={settingsSheetRef}
      onScreenTap={handleScreenTap}
      onRingInnerPress={() => {
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
      onStopAndExit={handleStopAndExit}
      onInfoPress={handleInfoPress}
      onSettingsPress={handleSettingsPress}
      onPlayPause={handlePlayPause}
      onCloseSheet={closeSheet}
      onSheetChange={handleSheetChange}
      onSheetDismiss={handleSheetDismiss}
    />
  );
}
