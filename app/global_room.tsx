import GlobalRoomMap from "@/components/GlobalRoomMap";
import GlobalRoomPulseButton from "@/components/GlobalRoomPulseButton";
import { useTheme, useWallpaperForeground } from "@/components/Theme";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import { useGlobalPulseHaptics } from "@/hooks/useGlobalPulseHaptics";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MAP_SIDE_MARGIN = 12;

/** Prefer the stack's back; fall back to home when the stack is empty (deep link / cold start). */
function leaveRoom() {
  if (typeof router.canGoBack === "function" && router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

/**
 * Global Room: a quiet world map of everyone here right now, and one gentle pulse you can send.
 *
 * All real-time behaviour lives in `useGlobalPresence` (socket, presence, pulses, cooldown) and
 * `useGlobalPulseHaptics` (one soft tap). This screen only renders and wires them together.
 * Connection is scoped to focus + foreground: leaving the screen or backgrounding the app closes the
 * socket, and coming back joins fresh.
 */
export default function GlobalRoomPage() {
  const wallpaperFg = useWallpaperForeground();
  const { tokens } = useTheme();
  const { settings, backgroundImage } = useAppSettings();
  const { width: windowWidth } = useWindowDimensions();
  const isFocused = useIsFocused();

  const { playPulseHaptic } = useGlobalPulseHaptics({
    hapticsEnabled: settings.hapticsEnabled,
  });

  const {
    connectionState,
    isConnected,
    selfId,
    dots,
    ghosts,
    pulses,
    participantCount,
    isCoolingDown,
    sendPulse,
    reconnectNow,
  } = useGlobalPresence({ onPulse: playPulseHaptic, enabled: isFocused });

  const offline = connectionState === "reconnecting" || connectionState === "disconnected";
  const statusText = isConnected
    ? participantCount <= 1
      ? "Just you here for now"
      : `${participantCount} people here`
    : connectionState === "reconnecting"
      ? "Reconnecting…"
      : connectionState === "disconnected"
        ? "Offline"
        : "Connecting…";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: backgroundImage ? "transparent" : tokens.sceneBackground,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Pressable
          onPress={leaveRoom}
          accessibilityRole="button"
          accessibilityLabel="Leave Global Room"
          testID="global-room-back"
          style={{ width: 44, height: 44, justifyContent: "center" }}
        >
          <Text style={{ color: wallpaperFg, fontSize: 28 }}>←</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            style={{ color: wallpaperFg, fontSize: 17, fontWeight: "600" }}
          >
            {statusText}
          </Text>
          {offline ? (
            <Pressable
              onPress={reconnectNow}
              accessibilityRole="button"
              accessibilityLabel="Try to reconnect now"
              hitSlop={8}
            >
              <Text style={{ color: wallpaperFg, fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                Try now
              </Text>
            </Pressable>
          ) : null}
        </View>
        {/* Balances the back button so the status stays centred. */}
        <View style={{ width: 44 }} />
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <GlobalRoomMap
          width={windowWidth - MAP_SIDE_MARGIN * 2}
          selfId={selfId}
          dots={dots}
          ghosts={ghosts}
          pulses={pulses}
          color={wallpaperFg}
          accentColor={tokens.accentPrimary}
        />
        <Text
          style={{
            marginTop: 14,
            paddingHorizontal: 32,
            fontSize: 12,
            lineHeight: 17,
            color: wallpaperFg,
            opacity: 0.55,
            textAlign: "center",
          }}
        >
          Dots show approximate, country-level locations. Nothing is saved.
        </Text>
      </View>

      <View style={{ alignItems: "center", paddingBottom: 40 }}>
        <GlobalRoomPulseButton
          onPress={sendPulse}
          disconnected={!isConnected}
          cooling={isCoolingDown}
          color={wallpaperFg}
          accentColor={tokens.accentPrimary}
        />
      </View>
    </SafeAreaView>
  );
}
