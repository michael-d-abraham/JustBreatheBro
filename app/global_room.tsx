import SettingsSheet, { SettingsSheetHandle } from "@/components/SettingsSheet";
import { useBreathingAnimationTokens, useWallpaperForeground } from "@/components/Theme";
import { useApp } from "@/contexts/themeContext";
import { useBreathingAnimation } from "@/hooks/useBreathingAnimation";
import { useBreathingAudio } from "@/hooks/useBreathingAudio";
import {
  BeginBreathingPhaseHapticsArgs,
  useBreathingHaptics,
} from "@/hooks/useBreathingHaptics";
import {
  BREATH_ROOM_DEEP,
  CanonicalBreathRoomId,
  getBreathRoomCatalogEntry,
  GlobalRoomPhase,
  GlobalRoomPhaseStepPayload,
  isCanonicalBreathRoomId,
  useGlobalBreathingRoom,
} from "@/hooks/useGlobalBreathingRoom";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

/** Prefer stack back (index → picker → session); fallback if stack is empty. */
function navigateBackToRoomPicker() {
  if (typeof router.canGoBack === "function" && router.canGoBack()) {
    router.back();
  } else {
    router.replace("/global_room_picker");
  }
}

const HEADER_WHITE_TEXT = {
  color: "#FFFFFF",
  textAlign: "center" as const,
  textShadowColor: "rgba(0,0,0,0.45)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

function hapticArgsForGlobalPhase(
  phase: GlobalRoomPhase,
  durationMs: number,
  resumeMidPhase: boolean
): BeginBreathingPhaseHapticsArgs | null {
  const base =
    phase === "inhale"
      ? BREATHING_PHASE_HAPTICS.inhale
      : phase === "exhale"
        ? BREATHING_PHASE_HAPTICS.exhale
        : BREATHING_PHASE_HAPTICS.hold;
  return { ...base, durationMs, resumeMidPhase };
}

function phaseLabel(phase: GlobalRoomPhase | null): string {
  if (!phase) return "";
  if (phase === "inhale") return "Inhale";
  if (phase === "exhale") return "Exhale";
  return "Hold";
}

function GlobalRoomInner({
  onReconnect,
  initialRoomId,
  onSelectedRoomIdChange,
}: {
  onReconnect: () => void;
  initialRoomId: CanonicalBreathRoomId;
  onSelectedRoomIdChange: (room: CanonicalBreathRoomId) => void;
}) {
  const breathingAnim = useBreathingAnimationTokens();
  const wallpaperFg = useWallpaperForeground();
  const { settings, backgroundImage } = useApp();
  const insets = useSafeAreaInsets();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const settingsSheetRef = useRef<SettingsSheetHandle>(null);
  const uiOpacity = useSharedValue(1);

  const playInhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const playExhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const beginPhaseHapticsRef = useRef<((args: BeginBreathingPhaseHapticsArgs) => void) | null>(null);
  const stopSoundRef = useRef<(() => void) | null>(null);
  const forceStopSoundRef = useRef<(() => void) | null>(null);

  const {
    radius,
    strokeWidth,
    animateInhale,
    animateExhale,
    seekToPhaseProgress,
    pause: pauseAnimation,
    reset,
  } = useBreathingAnimation();

  const { beginPhase: beginPhaseHaptics, cancel: cancelHaptics } = useBreathingHaptics({
    hapticsEnabled: settings.hapticsEnabled,
  });
  beginPhaseHapticsRef.current = beginPhaseHaptics;

  const onPhaseStep = useCallback(
    async (payload: GlobalRoomPhaseStepPayload) => {
      const { phase, phaseDurationMs, remainingMs, skipBreathCueAudio } = payload;
      cancelHaptics();

      const d = phaseDurationMs;
      const elapsedRatio = d > 0 ? Math.min(1, Math.max(0, (d - remainingMs) / d)) : 1;
      seekToPhaseProgress(phase, elapsedRatio);

      const animMs = Math.max(0, remainingMs);

      if (phase === "inhale") {
        if (animMs > 0) {
          animateInhale(animMs);
        } else if (d === 0) {
          seekToPhaseProgress("inhale", 1);
        }
      } else if (phase === "exhale") {
        if (animMs > 0) {
          animateExhale(animMs);
        } else if (d === 0) {
          seekToPhaseProgress("exhale", 1);
        }
      } else {
        pauseAnimation();
      }

      const hapticArgs = hapticArgsForGlobalPhase(phase, d, false);
      if (hapticArgs) {
        beginPhaseHapticsRef.current?.(hapticArgs);
      }

      if (skipBreathCueAudio) return;

      if (phase === "inhale") {
        await playInhaleSoundRef.current?.();
      } else if (phase === "exhale") {
        await playExhaleSoundRef.current?.();
      }
    },
    [animateInhale, animateExhale, seekToPhaseProgress, pauseAnimation, cancelHaptics]
  );

  const {
    disconnect,
    isConnected,
    wsError,
    participantCount,
    roomId,
    phase,
    remainingMs,
    connectionState,
  } = useGlobalBreathingRoom({
    onPhaseStep,
    initialRoomId,
    onSelectedRoomIdChange,
  });

  const { playInhaleSound, playExhaleSound, stopSound, forceStop: forceStopSound } =
    useBreathingAudio({
      soundEnabled: settings.soundEnabled,
      isRunning: isConnected,
      soundType: settings.soundType,
    });

  useEffect(() => {
    playInhaleSoundRef.current = playInhaleSound;
    playExhaleSoundRef.current = playExhaleSound;
    stopSoundRef.current = stopSound;
    forceStopSoundRef.current = forceStopSound;
  }, [playInhaleSound, playExhaleSound, stopSound, forceStopSound]);

  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,
    strokeWidth: strokeWidth.value,
  }));

  const uiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
  }));

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(true, "fade");
      return () => {
        StatusBar.setHidden(false, "fade");
      };
    }, [])
  );

  const handleLeave = () => {
    cancelHaptics();
    forceStopSoundRef.current?.();
    pauseAnimation();
    reset();
    disconnect();
    navigateBackToRoomPicker();
  };

  useEffect(() => {
    return () => {
      cancelHaptics();
      forceStopSoundRef.current?.();
      pauseAnimation();
      reset();
      disconnect();
    };
  }, [cancelHaptics, disconnect, pauseAnimation, reset]);

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
    settingsSheetRef.current?.close();
  };

  const handleScreenTap = () => {
    setIsUIVisible((v) => !v);
  };

  useEffect(() => {
    uiOpacity.value = withTiming(isUIVisible ? 1 : 0, { duration: 200 });
  }, [isUIVisible, uiOpacity]);

  const displaySeconds = Math.max(0, Math.ceil(remainingMs / 1000));

  const roomCatalog = useMemo(
    () =>
      getBreathRoomCatalogEntry(roomId) ?? getBreathRoomCatalogEntry(initialRoomId),
    [roomId, initialRoomId]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: backgroundImage ? "transparent" : "#FFFFFF" }}>
          <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={handleScreenTap}>
            <View style={{ alignItems: "center", position: "relative" }}>
              <Svg width={400} height={400}>
                <Circle
                  cx={200}
                  cy={200}
                  r={180}
                  stroke={breathingAnim.guideOuterStroke}
                  strokeWidth={1}
                  fill="none"
                  opacity={0.6}
                />
                <Circle
                  cx={200}
                  cy={200}
                  r={65}
                  stroke={breathingAnim.guideInnerStroke}
                  strokeWidth={1}
                  fill="none"
                  opacity={0.6}
                />
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

              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: wallpaperFg,
                    fontSize: 32,
                    fontWeight: "300",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  {phaseLabel(phase)}
                </Text>
                <Text
                  style={{
                    color: wallpaperFg,
                    fontSize: 20,
                    fontWeight: "500",
                    marginTop: 12,
                    opacity: 0.85,
                  }}
                >
                  {displaySeconds}s
                </Text>
              </View>
            </View>
          </Pressable>

          {wsError && isConnected ? (
            <View
              style={{
                position: "absolute",
                top: insets.top + 8,
                left: 24,
                right: 24,
                padding: 8,
                borderRadius: 8,
                backgroundColor: "rgba(0,0,0,0.35)",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, textAlign: "center" }}>{wsError}</Text>
            </View>
          ) : null}

          {(connectionState === "connecting" || connectionState === "reconnecting") && !isConnected ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 32,
                  backgroundColor: backgroundImage ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.94)",
                },
              ]}
              pointerEvents="auto"
            >
              <Text
                style={{
                  color: wallpaperFg,
                  fontSize: 18,
                  fontWeight: "600",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                {connectionState === "reconnecting" ? "Reconnecting…" : "Connecting…"}
              </Text>
              {wsError && connectionState === "reconnecting" ? (
                <Text
                  style={{
                    color: wallpaperFg,
                    fontSize: 15,
                    opacity: 0.85,
                    textAlign: "center",
                    lineHeight: 22,
                    marginBottom: 20,
                  }}
                >
                  {wsError}
                </Text>
              ) : null}
              {connectionState === "reconnecting" ? (
                <Pressable
                  onPress={onReconnect}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    backgroundColor: "rgba(120,120,140,0.35)",
                  }}
                >
                  <Text style={{ color: wallpaperFg, fontSize: 16, fontWeight: "600" }}>Try now</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: insets.top + 8,
              left: 52,
              right: 52,
              alignItems: "center",
            }}
          >
            {roomCatalog ? (
              <>
                <Text
                  style={{
                    ...HEADER_WHITE_TEXT,
                    fontSize: 24,
                    fontWeight: "800",
                    letterSpacing: 0.3,
                  }}
                >
                  {roomCatalog.title}
                </Text>
                <Text
                  style={{
                    ...HEADER_WHITE_TEXT,
                    fontSize: 15,
                    fontWeight: "600",
                    marginTop: 10,
                    opacity: 0.95,
                  }}
                >
                  {participantCount} breathing
                </Text>
              </>
            ) : null}
          </View>

          <Animated.View
            style={[
              {
                position: "absolute",
                top: insets.top,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 8,
                pointerEvents: isUIVisible ? "auto" : "none",
              },
              uiAnimatedStyle,
            ]}
          >
            <Pressable onPress={handleLeave} style={{ width: 44 }}>
              <Text style={{ color: wallpaperFg, fontSize: 28 }}>←</Text>
            </Pressable>
            <Pressable
              onPress={handleSettingsPress}
              style={{
                width: 44,
                height: 44,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="options" size={34} color={wallpaperFg} />
            </Pressable>
          </Animated.View>

          {connectionState === "disconnected" ? (
            <View
              style={StyleSheet.absoluteFill}
              pointerEvents="box-none"
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 32,
                  backgroundColor: backgroundImage ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.92)",
                }}
              >
                <Text
                  style={{
                    color: wallpaperFg,
                    fontSize: 20,
                    fontWeight: "600",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  Connection closed
                </Text>
                <Pressable
                  onPress={onReconnect}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    backgroundColor: "rgba(120,120,140,0.35)",
                  }}
                >
                  <Text style={{ color: wallpaperFg, fontSize: 17, fontWeight: "600" }}>Reconnect</Text>
                </Pressable>
                <Pressable onPress={handleLeave} style={{ marginTop: 20 }}>
                  <Text style={{ color: wallpaperFg, fontSize: 16, opacity: 0.85 }}>
                    Choose another room
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {isSheetOpen && (
            <Pressable onPress={closeSheet} style={StyleSheet.absoluteFill}>
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
            </Pressable>
          )}

          <SettingsSheet ref={settingsSheetRef} onChange={handleSheetChange} onDismiss={handleSheetDismiss} />
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

function roomFromSearchParams(room: string | string[] | undefined): CanonicalBreathRoomId {
  const raw = Array.isArray(room) ? room[0] : room;
  if (typeof raw === "string" && isCanonicalBreathRoomId(raw)) return raw;
  return BREATH_ROOM_DEEP;
}

export default function GlobalRoomPage() {
  const { room: roomParam } = useLocalSearchParams<{ room?: string }>();
  const resolvedFromRoute = roomFromSearchParams(roomParam);

  const [sessionKey, setSessionKey] = useState(0);
  const [sessionRoomId, setSessionRoomId] = useState<CanonicalBreathRoomId>(resolvedFromRoute);

  useEffect(() => {
    setSessionRoomId(resolvedFromRoute);
  }, [resolvedFromRoute]);

  return (
    <GlobalRoomInner
      key={sessionKey}
      initialRoomId={sessionRoomId}
      onSelectedRoomIdChange={setSessionRoomId}
      onReconnect={() => setSessionKey((k) => k + 1)}
    />
  );
}
