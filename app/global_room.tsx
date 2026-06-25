import GlobalRoomBreathingView from "@/components/GlobalRoomBreathingView";
import GlobalRoomHeader from "@/components/GlobalRoomHeader";
import SettingsSheet, { SettingsSheetHandle } from "@/components/SettingsSheet";
import { useWallpaperForeground } from "@/components/Theme";
import { useAppSettings } from "@/contexts/appSettingsContext";
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
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

/** Prefer stack back (index → picker → session); fallback if stack is empty. */
function navigateBackToRoomPicker() {
  if (typeof router.canGoBack === "function" && router.canGoBack()) {
    router.back();
  } else {
    router.replace("/global_room_picker");
  }
}

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
  resumeMidPhase: boolean,
): BeginBreathingPhaseHapticsArgs | null {
  const base =
    phase === "inhale"
      ? BREATHING_PHASE_HAPTICS.inhale
      : phase === "exhale"
        ? BREATHING_PHASE_HAPTICS.exhale
        : BREATHING_PHASE_HAPTICS.hold;
  return { ...base, durationMs, resumeMidPhase };
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
  const wallpaperFg = useWallpaperForeground();
  const { settings, backgroundImage } = useAppSettings();
  const insets = useSafeAreaInsets();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const settingsSheetRef = useRef<SettingsSheetHandle>(null);
  const uiOpacity = useSharedValue(1);

  const playInhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const playExhaleSoundRef = useRef<(() => Promise<void>) | null>(null);
  const beginPhaseHapticsRef = useRef<
    ((args: BeginBreathingPhaseHapticsArgs) => void) | null
  >(null);
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

  const { beginPhase: beginPhaseHaptics, cancel: cancelHaptics } =
    useBreathingHaptics({
      hapticsEnabled: settings.hapticsEnabled,
    });
  beginPhaseHapticsRef.current = beginPhaseHaptics;

  // This is the core timing handler: trust only valid server phase data,
  const onPhaseStep = useCallback(
    async (payload: GlobalRoomPhaseStepPayload) => {
      const { phase, phaseDurationMs, remainingMs, skipBreathCueAudio } =
        payload;
      cancelHaptics();

      const d = phaseDurationMs;
      const elapsedRatio =
        d > 0 ? Math.min(1, Math.max(0, (d - remainingMs) / d)) : 1;
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
    [
      animateInhale,
      animateExhale,
      seekToPhaseProgress,
      pauseAnimation,
      cancelHaptics,
    ],
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

  const {
    playInhaleSound,
    playExhaleSound,
    stopSound,
    forceStop: forceStopSound,
  } = useBreathingAudio({
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

  const uiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
  }));

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(true, "fade");
      return () => {
        StatusBar.setHidden(false, "fade");
      };
    }, []),
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

  const roomCatalog = useMemo(
    () =>
      getBreathRoomCatalogEntry(roomId) ??
      getBreathRoomCatalogEntry(initialRoomId),
    [roomId, initialRoomId],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: backgroundImage ? "transparent" : "#FFFFFF",
          }}
        >
          <GlobalRoomBreathingView
            phase={phase}
            radius={radius}
            strokeWidth={strokeWidth}
            remainingMs={remainingMs}
            onScreenTap={handleScreenTap}
          />

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
              <Text
                style={{ color: "#fff", fontSize: 14, textAlign: "center" }}
              >
                {wsError}
              </Text>
            </View>
          ) : null}

          {(connectionState === "connecting" ||
            connectionState === "reconnecting") &&
          !isConnected ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 32,
                  backgroundColor: backgroundImage
                    ? "rgba(0,0,0,0.35)"
                    : "rgba(255,255,255,0.94)",
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
                {connectionState === "reconnecting"
                  ? "Reconnecting…"
                  : "Connecting…"}
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
                  <Text
                    style={{
                      color: wallpaperFg,
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Try now
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <GlobalRoomHeader
            roomCatalog={roomCatalog}
            participantCount={participantCount}
            insets={insets}
            isUIVisible={isUIVisible}
            uiAnimatedStyle={uiAnimatedStyle}
            wallpaperFg={wallpaperFg}
            onLeave={handleLeave}
            onSettingsPress={handleSettingsPress}
          />

          {connectionState === "disconnected" ? (
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 32,
                  backgroundColor: backgroundImage
                    ? "rgba(0,0,0,0.25)"
                    : "rgba(255,255,255,0.92)",
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
                  <Text
                    style={{
                      color: wallpaperFg,
                      fontSize: 17,
                      fontWeight: "600",
                    }}
                  >
                    Reconnect
                  </Text>
                </Pressable>
                <Pressable onPress={handleLeave} style={{ marginTop: 20 }}>
                  <Text
                    style={{ color: wallpaperFg, fontSize: 16, opacity: 0.85 }}
                  >
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

function roomFromSearchParams(
  room: string | string[] | undefined,
): CanonicalBreathRoomId {
  const raw = Array.isArray(room) ? room[0] : room;
  if (typeof raw === "string" && isCanonicalBreathRoomId(raw)) return raw;
  return BREATH_ROOM_DEEP;
}

export default function GlobalRoomPage() {
  const { room: roomParam } = useLocalSearchParams<{ room?: string }>();
  const resolvedFromRoute = roomFromSearchParams(roomParam);

  const [sessionKey, setSessionKey] = useState(0);
  const [sessionRoomId, setSessionRoomId] =
    useState<CanonicalBreathRoomId>(resolvedFromRoute);

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
