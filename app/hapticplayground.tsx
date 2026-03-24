import CustomSlider from "@/components/Slider";
import { useTheme } from "@/components/Theme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PhasePatternConfig = {
  durationMs: number;
  intensity: Haptics.ImpactFeedbackStyle;
  interval: number;
};

export default function HapticPlayground() {
  const { tokens } = useTheme();
  const [continuousVibration, setContinuousVibration] = useState(false);
  const [customInterval, setCustomInterval] = useState(100);
  const [customIntensity, setCustomIntensity] = useState<Haptics.ImpactFeedbackStyle>(Haptics.ImpactFeedbackStyle.Medium);
  const [inhalePattern, setInhalePattern] = useState<PhasePatternConfig>({
    durationMs: 4000,
    intensity: Haptics.ImpactFeedbackStyle.Light,
    interval: 200,
  });
  const [holdPattern, setHoldPattern] = useState<PhasePatternConfig>({
    durationMs: 4000,
    intensity: Haptics.ImpactFeedbackStyle.Soft,
    interval: 80,
  });
  const [exhalePattern, setExhalePattern] = useState<PhasePatternConfig>({
    durationMs: 4000,
    intensity: Haptics.ImpactFeedbackStyle.Light,
    interval: 170,
  });
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [transitionIntensity, setTransitionIntensity] = useState<Haptics.ImpactFeedbackStyle>(
    Haptics.ImpactFeedbackStyle.Heavy
  );
  const [isPlayingDynamicPattern, setIsPlayingDynamicPattern] = useState(false);
  const [isPlayingPattern9, setIsPlayingPattern9] = useState(false);
  const [isPlayingPattern10, setIsPlayingPattern10] = useState(false);
  const [isPlayingPattern11, setIsPlayingPattern11] = useState(false);
  const [previewSection, setPreviewSection] = useState<"inhale" | "hold" | "exhale" | "transition" | null>(null);
  const vibrationIntervalRef = useRef<number | null>(null);
  const patternTimeoutRef = useRef<number | null>(null);
  const dynamicPatternCancelRef = useRef<boolean>(false);
  const breathingLoopCancelRef = useRef<boolean>(false);
  const previewCancelRef = useRef<boolean>(false);

  // Impact Feedback Styles
  const triggerImpact = async (style: Haptics.ImpactFeedbackStyle) => {
    await Haptics.impactAsync(style);
  };

  // Notification Feedback Types
  const triggerNotification = async (type: Haptics.NotificationFeedbackType) => {
    await Haptics.notificationAsync(type);
  };

  // Selection Feedback
  const triggerSelection = async () => {
    await Haptics.selectionAsync();
  };

  // Continuous Vibration Patterns
  const startContinuousPattern = (interval: number, style: Haptics.ImpactFeedbackStyle) => {
    stopContinuousPattern();
    setContinuousVibration(true);
    
    vibrationIntervalRef.current = setInterval(() => {
      Haptics.impactAsync(style);
    }, interval);
  };

  // Start custom continuous pattern with current settings
  const startCustomContinuousPattern = () => {
    startContinuousPattern(customInterval, customIntensity);
  };

  const stopContinuousPattern = () => {
    if (vibrationIntervalRef.current !== null) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    setContinuousVibration(false);
  };

  // Dynamic Pattern Builder Player - inhale -> hold -> exhale -> hold
  const playDynamicPattern = async () => {
    stopAllHaptics();
    setIsPlayingDynamicPattern(true);
    dynamicPatternCancelRef.current = false;

    const phases: PhasePatternConfig[] = [
      inhalePattern,
      holdPattern,
      exhalePattern,
      holdPattern,
    ];

    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
      if (dynamicPatternCancelRef.current) break;
      const phase = phases[phaseIndex];
      const phaseStart = Date.now();

      while (!dynamicPatternCancelRef.current && Date.now() - phaseStart < phase.durationMs) {
        await Haptics.impactAsync(phase.intensity);
        const elapsed = Date.now() - phaseStart;
        const remaining = phase.durationMs - elapsed;
        if (remaining <= 0) break;
        await new Promise((resolve) => setTimeout(resolve, Math.min(phase.interval, remaining)));
      }

      const isLastPhase = phaseIndex === phases.length - 1;
      if (!dynamicPatternCancelRef.current && transitionEnabled && !isLastPhase) {
        await Haptics.impactAsync(transitionIntensity);
      }
    }
    
    setIsPlayingDynamicPattern(false);
  };

  const stopDynamicPattern = () => {
    dynamicPatternCancelRef.current = true;
    setIsPlayingDynamicPattern(false);
  };

  const playPhasePreview = async (
    section: "inhale" | "hold" | "exhale",
    phase: PhasePatternConfig
  ) => {
    stopAllHaptics();
    previewCancelRef.current = false;
    setPreviewSection(section);
    const phaseStart = Date.now();

    while (!previewCancelRef.current && Date.now() - phaseStart < phase.durationMs) {
      await Haptics.impactAsync(phase.intensity);
      const elapsed = Date.now() - phaseStart;
      const remaining = phase.durationMs - elapsed;
      if (remaining <= 0) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.min(phase.interval, remaining)));
    }

    setPreviewSection((current) => (current === section ? null : current));
  };

  const playTransitionPreview = async () => {
    stopAllHaptics();
    previewCancelRef.current = false;
    setPreviewSection("transition");
    await Haptics.impactAsync(transitionIntensity);
    if (!previewCancelRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    setPreviewSection((current) => (current === "transition" ? null : current));
  };

  const stopPreview = () => {
    previewCancelRef.current = true;
    setPreviewSection(null);
  };

  const runPhaseFixed = async ({
    durationMs,
    intensity,
    intervalMs,
  }: {
    durationMs: number;
    intensity: Haptics.ImpactFeedbackStyle;
    intervalMs: number;
  }) => {
    let elapsed = 0;
    while (!breathingLoopCancelRef.current && elapsed < durationMs) {
      await Haptics.impactAsync(intensity);
      const waitMs = Math.min(intervalMs, durationMs - elapsed);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      elapsed += waitMs;
    }
  };

  const waitUntil = async (targetTimeMs: number) => {
    while (!breathingLoopCancelRef.current) {
      const remaining = targetTimeMs - Date.now();
      if (remaining <= 0) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.min(remaining, 20)));
    }
  };

  const runPhaseAligned = async ({
    phaseStartMs,
    durationMs,
    intensity,
    intervalMs,
  }: {
    phaseStartMs: number;
    durationMs: number;
    intensity: Haptics.ImpactFeedbackStyle;
    intervalMs: number;
  }) => {
    const phaseEndMs = phaseStartMs + durationMs;
    for (let hitAt = phaseStartMs; hitAt < phaseEndMs && !breathingLoopCancelRef.current; hitAt += intervalMs) {
      await waitUntil(hitAt);
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(intensity);
    }
    await waitUntil(phaseEndMs);
  };


  const playPattern9 = async () => {
    stopAllHaptics();
    breathingLoopCancelRef.current = false;
    setIsPlayingPattern9(true);

    while (!breathingLoopCancelRef.current) {
      await runPhaseFixed({
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Light,
        intervalMs: 800,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      await runPhaseFixed({
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Soft,
        intervalMs: 800,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      await runPhaseFixed({
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Light,
        intervalMs: 800,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      await runPhaseFixed({
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Soft,
        intervalMs: 800,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setIsPlayingPattern9(false);
  };

  const stopPattern9 = () => {
    breathingLoopCancelRef.current = true;
    setIsPlayingPattern9(false);
  };

  const playPattern10 = async () => {
    stopAllHaptics();
    breathingLoopCancelRef.current = false;
    setIsPlayingPattern10(true);

    while (!breathingLoopCancelRef.current) {
      const cycleStartMs = Date.now();

      // Inhale 0s -> 4s (Light 800ms)
      await runPhaseAligned({
        phaseStartMs: cycleStartMs,
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Medium,
        intervalMs: 800,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Hold 4s -> 8s (Soft 200ms, 4x pulse rate)
      await runPhaseAligned({
        phaseStartMs: cycleStartMs + 4000,
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Soft,
        intervalMs: 200,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Exhale 8s -> 12s (Light 800ms)
      await runPhaseAligned({
        phaseStartMs: cycleStartMs + 8000,
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Medium,
        intervalMs: 800,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Hold 12s -> 16s (Soft 200ms, 4x pulse rate)
      await runPhaseAligned({
        phaseStartMs: cycleStartMs + 12000,
        durationMs: 4000,
        intensity: Haptics.ImpactFeedbackStyle.Soft,
        intervalMs: 200,
      });
      if (breathingLoopCancelRef.current) break;
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setIsPlayingPattern10(false);
  };

  const stopPattern10 = () => {
    breathingLoopCancelRef.current = true;
    setIsPlayingPattern10(false);
  };

  const playPattern11 = async () => {
    stopAllHaptics();
    breathingLoopCancelRef.current = false;
    setIsPlayingPattern11(true);

    while (!breathingLoopCancelRef.current) {
      const cycleStartMs = Date.now();
      const cycleLengthMs = 15200;
      const events: Array<{ atOffsetMs: number; style: Haptics.ImpactFeedbackStyle }> = [
        // Inhale
        { atOffsetMs: 0, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 800, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 1600, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 2400, style: Haptics.ImpactFeedbackStyle.Light },

        // Transition (replaces beat hit at this time)
        { atOffsetMs: 3200, style: Haptics.ImpactFeedbackStyle.Heavy },

        // Hold 1
        { atOffsetMs: 4000, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 4400, style: Haptics.ImpactFeedbackStyle.Soft },
        { atOffsetMs: 4800, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 5200, style: Haptics.ImpactFeedbackStyle.Soft },
        { atOffsetMs: 5600, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 6000, style: Haptics.ImpactFeedbackStyle.Soft },
        { atOffsetMs: 6400, style: Haptics.ImpactFeedbackStyle.Light },

        // Transition (replaces beat hit at this time)
        { atOffsetMs: 7200, style: Haptics.ImpactFeedbackStyle.Heavy },

        // Exhale
        { atOffsetMs: 8000, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 8800, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 9600, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 10400, style: Haptics.ImpactFeedbackStyle.Light },

        // Transition (replaces beat hit at this time)
        { atOffsetMs: 11200, style: Haptics.ImpactFeedbackStyle.Heavy },

        // Hold 2
        { atOffsetMs: 12000, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 12400, style: Haptics.ImpactFeedbackStyle.Soft },
        { atOffsetMs: 12800, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 13200, style: Haptics.ImpactFeedbackStyle.Soft },
        { atOffsetMs: 13600, style: Haptics.ImpactFeedbackStyle.Light },
        { atOffsetMs: 14000, style: Haptics.ImpactFeedbackStyle.Soft },
        { atOffsetMs: 14400, style: Haptics.ImpactFeedbackStyle.Light },
      ];

      for (const event of events) {
        if (breathingLoopCancelRef.current) break;
        await waitUntil(cycleStartMs + event.atOffsetMs);
        if (breathingLoopCancelRef.current) break;
        await Haptics.impactAsync(event.style);
      }

      if (breathingLoopCancelRef.current) break;
      await waitUntil(cycleStartMs + cycleLengthMs);
    }

    setIsPlayingPattern11(false);
  };

  const stopPattern11 = () => {
    breathingLoopCancelRef.current = true;
    setIsPlayingPattern11(false);
  };


  const getIntensityLabel = (intensity: Haptics.ImpactFeedbackStyle) =>
    intensity === Haptics.ImpactFeedbackStyle.Light
      ? "Light"
      : intensity === Haptics.ImpactFeedbackStyle.Soft
      ? "Soft"
      : intensity === Haptics.ImpactFeedbackStyle.Medium
      ? "Medium"
      : intensity === Haptics.ImpactFeedbackStyle.Heavy
      ? "Heavy"
      : "Rigid";

  // Stop all haptics - clears intervals and timeouts
  const stopAllHaptics = () => {
    // Stop continuous vibration
    stopContinuousPattern();
    
    // Stop dynamic pattern
    stopDynamicPattern();
    stopPattern9();
    stopPattern10();
    stopPattern11();
    stopPreview();
    
    // Clear any pending pattern timeouts
    if (patternTimeoutRef.current !== null) {
      clearTimeout(patternTimeoutRef.current);
      patternTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAllHaptics();
    };
  }, []);

  // Breathing-like pattern (gradual intensity)
  const triggerBreathingPattern = async () => {
    stopContinuousPattern();
    setContinuousVibration(true);
    
    // Simulate inhale: soft to medium intensity
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const intensity = i < 5 
        ? Haptics.ImpactFeedbackStyle.Soft 
        : Haptics.ImpactFeedbackStyle.Medium;
      await Haptics.impactAsync(intensity);
    }
    
    // Brief pause (hold)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate exhale: medium to soft intensity
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const intensity = i < 5 
        ? Haptics.ImpactFeedbackStyle.Medium 
        : Haptics.ImpactFeedbackStyle.Soft;
      await Haptics.impactAsync(intensity);
    }
    
    setContinuousVibration(false);
  };

  // Pulse pattern (quick bursts)
  const triggerPulsePattern = async () => {
    stopContinuousPattern();
    setContinuousVibration(true);
    
    for (let i = 0; i < 5; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setContinuousVibration(false);
  };

  // Wave pattern (crescendo then decrescendo)
  const triggerWavePattern = async () => {
    stopContinuousPattern();
    setContinuousVibration(true);
    
    const styles = [
      Haptics.ImpactFeedbackStyle.Light,
      Haptics.ImpactFeedbackStyle.Soft,
      Haptics.ImpactFeedbackStyle.Medium,
      Haptics.ImpactFeedbackStyle.Heavy,
      Haptics.ImpactFeedbackStyle.Medium,
      Haptics.ImpactFeedbackStyle.Soft,
      Haptics.ImpactFeedbackStyle.Light,
    ];
    
    for (const style of styles) {
      await Haptics.impactAsync(style);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    setContinuousVibration(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.sceneBackground,
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      color: tokens.textOnAccent,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 16,
    },
    button: {
      backgroundColor: tokens.accentMuted,
      borderWidth: 2,
      borderColor: tokens.accentPrimary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
    },
    buttonActive: {
      backgroundColor: tokens.accentPrimary,
    },
    buttonText: {
      color: tokens.textOnAccent,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    smallButton: {
      backgroundColor: tokens.accentMuted,
      borderWidth: 2,
      borderColor: tokens.accentPrimary,
      borderRadius: 8,
      padding: 12,
      minWidth: 100,
      alignItems: 'center',
    },
    smallButtonText: {
      color: tokens.textOnAccent,
      fontSize: 14,
      fontWeight: '500',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      color: tokens.textOnAccent,
      fontSize: 28,
    },
    headerTitle: {
      color: tokens.textOnAccent,
      fontSize: 28,
      fontWeight: '700',
      marginLeft: 16,
      flex: 1,
    },
    stopAllButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: tokens.accentPrimary,
    },
    stopAllButtonText: {
      color: tokens.textOnAccent,
      fontSize: 14,
      fontWeight: '600',
    },
    controlLabel: {
      color: tokens.textOnAccent,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      marginTop: 8,
    },
    intensityRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    intensityButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: tokens.accentMuted,
      borderWidth: 2,
      borderColor: tokens.accentPrimary,
      minWidth: 70,
      alignItems: 'center',
    },
    intensityButtonActive: {
      backgroundColor: tokens.accentPrimary,
    },
    intensityButtonText: {
      color: tokens.textOnAccent,
      fontSize: 14,
      fontWeight: '500',
      opacity: 0.7,
    },
    intensityButtonTextActive: {
      opacity: 1,
      fontWeight: '700',
    },
    settingsDisplay: {
      backgroundColor: tokens.accentMuted,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      alignItems: 'center',
    },
    settingsText: {
      color: tokens.textOnAccent,
      fontSize: 14,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonTextDisabled: {
      opacity: 0.5,
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    presetButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: tokens.accentMuted,
      borderWidth: 1,
      borderColor: tokens.accentPrimary,
    },
    presetButtonText: {
      color: tokens.textOnAccent,
      fontSize: 12,
      fontWeight: '500',
    },
    patternStepContainer: {
      backgroundColor: tokens.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: tokens.accentPrimary,
    },
    patternStepHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    patternStepLabel: {
      color: tokens.textOnAccent,
      fontSize: 18,
      fontWeight: '700',
    },
    removeStepButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: tokens.accentMuted,
      borderWidth: 1,
      borderColor: tokens.accentPrimary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeStepButtonText: {
      color: tokens.textOnAccent,
      fontSize: 20,
      fontWeight: '700',
    },
    patternStepControls: {
      gap: 12,
    },
    patternControlGroup: {
      marginBottom: 8,
    },
    patternControlLabel: {
      color: tokens.textOnAccent,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    addStepButton: {
      backgroundColor: tokens.accentMuted,
      borderWidth: 2,
      borderColor: tokens.accentPrimary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginBottom: 16,
    },
    addStepButtonText: {
      color: tokens.textOnAccent,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Haptic Playground</Text>
        <Pressable onPress={stopAllHaptics} style={styles.stopAllButton}>
          <Text style={styles.stopAllButtonText}>Stop All</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Impact Feedback Styles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impact Feedback</Text>
          <Pressable
            style={styles.button}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={styles.buttonText}>Light Impact</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Text style={styles.buttonText}>Medium Impact</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Heavy)}
          >
            <Text style={styles.buttonText}>Heavy Impact</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Soft)}
          >
            <Text style={styles.buttonText}>Soft Impact</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Rigid)}
          >
            <Text style={styles.buttonText}>Rigid Impact</Text>
          </Pressable>
        </View>

        {/* Notification Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Feedback</Text>
          <Pressable
            style={styles.button}
            onPress={() => triggerNotification(Haptics.NotificationFeedbackType.Success)}
          >
            <Text style={styles.buttonText}>Success</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => triggerNotification(Haptics.NotificationFeedbackType.Warning)}
          >
            <Text style={styles.buttonText}>Warning</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => triggerNotification(Haptics.NotificationFeedbackType.Error)}
          >
            <Text style={styles.buttonText}>Error</Text>
          </Pressable>
        </View>

        {/* Selection Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selection Feedback</Text>
          <Pressable
            style={styles.button}
            onPress={triggerSelection}
          >
            <Text style={styles.buttonText}>Selection Tap</Text>
          </Pressable>
        </View>

        {/* Continuous Patterns - Customizable */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continuous Patterns (Customizable)</Text>
          
          {/* Intensity Selection */}
          <Text style={styles.controlLabel}>Intensity:</Text>
          <View style={styles.intensityRow}>
            <Pressable
              style={[styles.intensityButton, customIntensity === Haptics.ImpactFeedbackStyle.Light && styles.intensityButtonActive]}
              onPress={() => setCustomIntensity(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[styles.intensityButtonText, customIntensity === Haptics.ImpactFeedbackStyle.Light && styles.intensityButtonTextActive]}>Light</Text>
            </Pressable>
            <Pressable
              style={[styles.intensityButton, customIntensity === Haptics.ImpactFeedbackStyle.Soft && styles.intensityButtonActive]}
              onPress={() => setCustomIntensity(Haptics.ImpactFeedbackStyle.Soft)}
            >
              <Text style={[styles.intensityButtonText, customIntensity === Haptics.ImpactFeedbackStyle.Soft && styles.intensityButtonTextActive]}>Soft</Text>
            </Pressable>
            <Pressable
              style={[styles.intensityButton, customIntensity === Haptics.ImpactFeedbackStyle.Medium && styles.intensityButtonActive]}
              onPress={() => setCustomIntensity(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={[styles.intensityButtonText, customIntensity === Haptics.ImpactFeedbackStyle.Medium && styles.intensityButtonTextActive]}>Medium</Text>
            </Pressable>
            <Pressable
              style={[styles.intensityButton, customIntensity === Haptics.ImpactFeedbackStyle.Heavy && styles.intensityButtonActive]}
              onPress={() => setCustomIntensity(Haptics.ImpactFeedbackStyle.Heavy)}
            >
              <Text style={[styles.intensityButtonText, customIntensity === Haptics.ImpactFeedbackStyle.Heavy && styles.intensityButtonTextActive]}>Heavy</Text>
            </Pressable>
            <Pressable
              style={[styles.intensityButton, customIntensity === Haptics.ImpactFeedbackStyle.Rigid && styles.intensityButtonActive]}
              onPress={() => setCustomIntensity(Haptics.ImpactFeedbackStyle.Rigid)}
            >
              <Text style={[styles.intensityButtonText, customIntensity === Haptics.ImpactFeedbackStyle.Rigid && styles.intensityButtonTextActive]}>Rigid</Text>
            </Pressable>
          </View>

          {/* Interval Slider */}
          <Text style={styles.controlLabel}>Interval: {customInterval}ms</Text>
          <CustomSlider
            label=""
            value={customInterval}
            min={10}
            max={1000}
            step={10}
            onValueChange={setCustomInterval}
            unit="ms"
          />

          {/* Current Settings Display */}
          <View style={styles.settingsDisplay}>
            <Text style={styles.settingsText}>
              Current: {customIntensity === Haptics.ImpactFeedbackStyle.Light ? 'Light' :
                       customIntensity === Haptics.ImpactFeedbackStyle.Soft ? 'Soft' :
                       customIntensity === Haptics.ImpactFeedbackStyle.Medium ? 'Medium' :
                       customIntensity === Haptics.ImpactFeedbackStyle.Heavy ? 'Heavy' : 'Rigid'} @ {customInterval}ms
            </Text>
          </View>

          {/* Control Buttons */}
          <Pressable
            style={[styles.button, continuousVibration && styles.buttonActive]}
            onPress={startCustomContinuousPattern}
          >
            <Text style={styles.buttonText}>
              {continuousVibration ? 'Restart Pattern' : 'Start Continuous Pattern'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.button, !continuousVibration && styles.buttonDisabled]}
            onPress={stopContinuousPattern}
            disabled={!continuousVibration}
          >
            <Text style={[styles.buttonText, !continuousVibration && styles.buttonTextDisabled]}>
              Stop Continuous
            </Text>
          </Pressable>

          {/* Quick Presets */}
          <Text style={styles.controlLabel}>Quick Presets:</Text>
          <View style={styles.presetRow}>
            <Pressable
              style={styles.presetButton}
              onPress={() => {
                setCustomInterval(50);
                setCustomIntensity(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.presetButtonText}>Fast Light</Text>
            </Pressable>
            <Pressable
              style={styles.presetButton}
              onPress={() => {
                setCustomInterval(100);
                setCustomIntensity(Haptics.ImpactFeedbackStyle.Soft);
              }}
            >
              <Text style={styles.presetButtonText}>Soft Pulse</Text>
            </Pressable>
            <Pressable
              style={styles.presetButton}
              onPress={() => {
                setCustomInterval(200);
                setCustomIntensity(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Text style={styles.presetButtonText}>Medium</Text>
            </Pressable>
            <Pressable
              style={styles.presetButton}
              onPress={() => {
                setCustomInterval(500);
                setCustomIntensity(Haptics.ImpactFeedbackStyle.Heavy);
              }}
            >
              <Text style={styles.presetButtonText}>Slow Heavy</Text>
            </Pressable>
          </View>
        </View>

        {/* Dynamic Pattern Builder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dynamic Pattern Builder</Text>
          <Text style={styles.controlLabel}>
            Configure inhale, hold, and exhale. Play runs inhale - hold - exhale - hold.
          </Text>

          {/* Inhale */}
          <View style={styles.patternStepContainer}>
            <View style={styles.patternStepHeader}>
              <Text style={styles.patternStepLabel}>Inhale</Text>
              <Pressable
                style={[styles.presetButton, previewSection === "inhale" && styles.intensityButtonActive]}
                onPress={
                  previewSection === "inhale"
                    ? stopPreview
                    : () => playPhasePreview("inhale", inhalePattern)
                }
              >
                <Text style={styles.presetButtonText}>
                  {previewSection === "inhale" ? "Stop Preview" : "Preview"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.patternStepControls}>
              <View style={styles.patternControlGroup}>
                <Text style={styles.patternControlLabel}>Duration: {inhalePattern.durationMs}ms</Text>
                <CustomSlider
                  label=""
                  value={inhalePattern.durationMs}
                  min={500}
                  max={10000}
                  step={100}
                  onValueChange={(value) => setInhalePattern({ ...inhalePattern, durationMs: value })}
                  unit="ms"
                />
              </View>
              <View style={styles.patternControlGroup}>
                <Text style={styles.patternControlLabel}>Interval: {inhalePattern.interval}ms</Text>
                <CustomSlider
                  label=""
                  value={inhalePattern.interval}
                  min={20}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setInhalePattern({ ...inhalePattern, interval: value })}
                  unit="ms"
                />
              </View>
              <Text style={styles.patternControlLabel}>Intensity: {getIntensityLabel(inhalePattern.intensity)}</Text>
              <View style={styles.intensityRow}>
                {[
                  Haptics.ImpactFeedbackStyle.Light,
                  Haptics.ImpactFeedbackStyle.Soft,
                  Haptics.ImpactFeedbackStyle.Medium,
                  Haptics.ImpactFeedbackStyle.Heavy,
                  Haptics.ImpactFeedbackStyle.Rigid,
                ].map((intensity) => (
                  <Pressable
                    key={`inhale-${intensity}`}
                    style={[
                      styles.intensityButton,
                      inhalePattern.intensity === intensity && styles.intensityButtonActive,
                    ]}
                    onPress={() => setInhalePattern({ ...inhalePattern, intensity })}
                  >
                    <Text
                      style={[
                        styles.intensityButtonText,
                        inhalePattern.intensity === intensity && styles.intensityButtonTextActive,
                      ]}
                    >
                      {getIntensityLabel(intensity)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Hold */}
          <View style={styles.patternStepContainer}>
            <View style={styles.patternStepHeader}>
              <Text style={styles.patternStepLabel}>Hold (used for both holds)</Text>
              <Pressable
                style={[styles.presetButton, previewSection === "hold" && styles.intensityButtonActive]}
                onPress={
                  previewSection === "hold"
                    ? stopPreview
                    : () => playPhasePreview("hold", holdPattern)
                }
              >
                <Text style={styles.presetButtonText}>
                  {previewSection === "hold" ? "Stop Preview" : "Preview"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.patternStepControls}>
              <View style={styles.patternControlGroup}>
                <Text style={styles.patternControlLabel}>Duration: {holdPattern.durationMs}ms</Text>
                <CustomSlider
                  label=""
                  value={holdPattern.durationMs}
                  min={500}
                  max={10000}
                  step={100}
                  onValueChange={(value) => setHoldPattern({ ...holdPattern, durationMs: value })}
                  unit="ms"
                />
              </View>
              <View style={styles.patternControlGroup}>
                <Text style={styles.patternControlLabel}>Interval: {holdPattern.interval}ms</Text>
                <CustomSlider
                  label=""
                  value={holdPattern.interval}
                  min={20}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setHoldPattern({ ...holdPattern, interval: value })}
                  unit="ms"
                />
              </View>
              <Text style={styles.patternControlLabel}>Intensity: {getIntensityLabel(holdPattern.intensity)}</Text>
              <View style={styles.intensityRow}>
                {[
                  Haptics.ImpactFeedbackStyle.Light,
                  Haptics.ImpactFeedbackStyle.Soft,
                  Haptics.ImpactFeedbackStyle.Medium,
                  Haptics.ImpactFeedbackStyle.Heavy,
                  Haptics.ImpactFeedbackStyle.Rigid,
                ].map((intensity) => (
                  <Pressable
                    key={`hold-${intensity}`}
                    style={[
                      styles.intensityButton,
                      holdPattern.intensity === intensity && styles.intensityButtonActive,
                    ]}
                    onPress={() => setHoldPattern({ ...holdPattern, intensity })}
                  >
                    <Text
                      style={[
                        styles.intensityButtonText,
                        holdPattern.intensity === intensity && styles.intensityButtonTextActive,
                      ]}
                    >
                      {getIntensityLabel(intensity)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Exhale */}
          <View style={styles.patternStepContainer}>
            <View style={styles.patternStepHeader}>
              <Text style={styles.patternStepLabel}>Exhale</Text>
              <Pressable
                style={[styles.presetButton, previewSection === "exhale" && styles.intensityButtonActive]}
                onPress={
                  previewSection === "exhale"
                    ? stopPreview
                    : () => playPhasePreview("exhale", exhalePattern)
                }
              >
                <Text style={styles.presetButtonText}>
                  {previewSection === "exhale" ? "Stop Preview" : "Preview"}
                </Text>
              </Pressable>
            </View>
            <View style={styles.patternStepControls}>
              <View style={styles.patternControlGroup}>
                <Text style={styles.patternControlLabel}>Duration: {exhalePattern.durationMs}ms</Text>
                <CustomSlider
                  label=""
                  value={exhalePattern.durationMs}
                  min={500}
                  max={10000}
                  step={100}
                  onValueChange={(value) => setExhalePattern({ ...exhalePattern, durationMs: value })}
                  unit="ms"
                />
              </View>
              <View style={styles.patternControlGroup}>
                <Text style={styles.patternControlLabel}>Interval: {exhalePattern.interval}ms</Text>
                <CustomSlider
                  label=""
                  value={exhalePattern.interval}
                  min={20}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setExhalePattern({ ...exhalePattern, interval: value })}
                  unit="ms"
                />
              </View>
              <Text style={styles.patternControlLabel}>Intensity: {getIntensityLabel(exhalePattern.intensity)}</Text>
              <View style={styles.intensityRow}>
                {[
                  Haptics.ImpactFeedbackStyle.Light,
                  Haptics.ImpactFeedbackStyle.Soft,
                  Haptics.ImpactFeedbackStyle.Medium,
                  Haptics.ImpactFeedbackStyle.Heavy,
                  Haptics.ImpactFeedbackStyle.Rigid,
                ].map((intensity) => (
                  <Pressable
                    key={`exhale-${intensity}`}
                    style={[
                      styles.intensityButton,
                      exhalePattern.intensity === intensity && styles.intensityButtonActive,
                    ]}
                    onPress={() => setExhalePattern({ ...exhalePattern, intensity })}
                  >
                    <Text
                      style={[
                        styles.intensityButtonText,
                        exhalePattern.intensity === intensity && styles.intensityButtonTextActive,
                      ]}
                    >
                      {getIntensityLabel(intensity)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Optional Transition */}
          <View style={styles.patternStepContainer}>
            <View style={styles.patternStepHeader}>
              <Text style={styles.patternStepLabel}>Transition (Optional)</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  style={[styles.presetButton, transitionEnabled && styles.intensityButtonActive]}
                  onPress={() => setTransitionEnabled((prev) => !prev)}
                >
                  <Text style={styles.presetButtonText}>
                    {transitionEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.presetButton, previewSection === "transition" && styles.intensityButtonActive]}
                  onPress={
                    previewSection === "transition" ? stopPreview : playTransitionPreview
                  }
                >
                  <Text style={styles.presetButtonText}>
                    {previewSection === "transition" ? "Stop" : "Preview"}
                  </Text>
                </Pressable>
              </View>
            </View>
            {transitionEnabled && (
              <>
                <Text style={styles.patternControlLabel}>
                  Transition Intensity: {getIntensityLabel(transitionIntensity)}
                </Text>
                <View style={styles.intensityRow}>
                  {[
                    Haptics.ImpactFeedbackStyle.Light,
                    Haptics.ImpactFeedbackStyle.Soft,
                    Haptics.ImpactFeedbackStyle.Medium,
                    Haptics.ImpactFeedbackStyle.Heavy,
                    Haptics.ImpactFeedbackStyle.Rigid,
                  ].map((intensity) => (
                    <Pressable
                      key={`transition-${intensity}`}
                      style={[
                        styles.intensityButton,
                        transitionIntensity === intensity && styles.intensityButtonActive,
                      ]}
                      onPress={() => setTransitionIntensity(intensity)}
                    >
                      <Text
                        style={[
                          styles.intensityButtonText,
                          transitionIntensity === intensity && styles.intensityButtonTextActive,
                        ]}
                      >
                        {getIntensityLabel(intensity)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
          
          {/* Play/Stop Dynamic Pattern */}
          <Pressable
            style={[styles.button, isPlayingDynamicPattern && styles.buttonActive]}
            onPress={isPlayingDynamicPattern ? stopDynamicPattern : playDynamicPattern}
          >
            <Text style={styles.buttonText}>
              {isPlayingDynamicPattern ? 'Stop Pattern' : 'Play Inhale-Hold-Exhale-Hold'}
            </Text>
          </Pressable>
        </View>

        {/* Pattern 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pattern 9</Text>
          <Text style={styles.controlLabel}>
            4s inhale: light 800ms{"\n"}
            4s hold: soft 800ms{"\n"}
            4s exhale: light 800ms{"\n"}
            4s hold: soft 800ms{"\n"}
            transition: heavy
          </Text>
          <Pressable
            style={[styles.button, isPlayingPattern9 && styles.buttonActive]}
            onPress={isPlayingPattern9 ? stopPattern9 : playPattern9}
          >
            <Text style={styles.buttonText}>
              {isPlayingPattern9 ? "Stop Pattern 9" : "Start Pattern 9"}
            </Text>
          </Pressable>
        </View>

        {/* Pattern 10 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pattern 10</Text>
          <Text style={styles.controlLabel}>
            4s inhale: medium 800ms{"\n"}
            4s hold: soft 200ms{"\n"}
            4s exhale: medium 800ms{"\n"}
            4s hold: soft 200ms{"\n"}
            transition: heavy
          </Text>
          <Pressable
            style={[styles.button, isPlayingPattern10 && styles.buttonActive]}
            onPress={isPlayingPattern10 ? stopPattern10 : playPattern10}
          >
            <Text style={styles.buttonText}>
              {isPlayingPattern10 ? "Stop Pattern 10" : "Start Pattern 10"}
            </Text>
          </Pressable>
        </View>

        {/* Pattern 11 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pattern 11</Text>
          <Text style={styles.controlLabel}>
            base tempo: beat 800ms / offbeat 400ms{"\n"}
            inhale/exhale: light on beats{"\n"}
            holds: light-soft alternating on 400ms grid{"\n"}
            transitions: heavy at 3200ms, 7200ms, 11200ms{"\n"}
            loop restart: 15200ms
          </Text>
          <Pressable
            style={[styles.button, isPlayingPattern11 && styles.buttonActive]}
            onPress={isPlayingPattern11 ? stopPattern11 : playPattern11}
          >
            <Text style={styles.buttonText}>
              {isPlayingPattern11 ? "Stop Pattern 11" : "Start Pattern 11"}
            </Text>
          </Pressable>
        </View>


        {/* Breathing Patterns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breathing Patterns</Text>
          <Pressable
            style={styles.button}
            onPress={triggerBreathingPattern}
          >
            <Text style={styles.buttonText}>Breathing Pattern (Inhale/Exhale)</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={triggerPulsePattern}
          >
            <Text style={styles.buttonText}>Pulse Pattern (5 Bursts)</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={triggerWavePattern}
          >
            <Text style={styles.buttonText}>Wave Pattern (Crescendo/Decrescendo)</Text>
          </Pressable>
        </View>

        {/* Quick Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Test</Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.smallButton}
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.smallButtonText}>Light</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={styles.smallButtonText}>Medium</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Heavy)}
            >
              <Text style={styles.smallButtonText}>Heavy</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              onPress={() => triggerImpact(Haptics.ImpactFeedbackStyle.Soft)}
            >
              <Text style={styles.smallButtonText}>Soft</Text>
            </Pressable>
            <Pressable
              style={styles.smallButton}
              onPress={triggerSelection}
            >
              <Text style={styles.smallButtonText}>Select</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

