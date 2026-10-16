import GlobalRoomMap from "@/components/GlobalRoomMap";
import GlobalRoomPulseButton from "@/components/GlobalRoomPulseButton";
import {
  GLOBAL_ROOM_LABEL_GAP,
  GLOBAL_ROOM_HEADER_HORIZONTAL_PADDING,
  GLOBAL_ROOM_CONTROL_GAP,
  GLOBAL_ROOM_PULSE_SIZE,
  globalRoomPalette,
} from "@/components/globalRoomTokens";
import HomeNavIconButton from "@/components/HomeNavIconButton";
import {
  HOME_NAV_ICON_BUTTON_SIZE,
  HOME_TAGLINE_FONT_SIZE,
  HOME_TAGLINE_FONT_WEIGHT,
  HOME_TAGLINE_LETTER_SPACING,
  HOME_TAGLINE_OPACITY,
} from "@/components/homeNavTokens";
import { useTheme } from "@/components/Theme";
import { useAppSettings } from "@/contexts/appSettingsContext";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import { useGlobalPulseHaptics } from "@/hooks/useGlobalPulseHaptics";
import { fitMapWidth } from "@/lib/globalRoomLayout";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, useWindowDimensions, View, type LayoutChangeEvent } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

/** Prefer the stack's back; fall back to home when the stack is empty (deep link / cold start). */
function leaveRoom() {
  if (typeof router.canGoBack === "function" && router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

function BackIcon({ size, color }: { size?: number; color: string }) {
  return <Ionicons name="chevron-back" size={size} color={color} />;
}

/**
 * Global Room: a quiet world map of everyone here right now, and one gentle pulse you can send.
 *
 * All real-time behaviour lives in `useGlobalPresence` (socket, presence, pulses, cooldown) and
 * `useGlobalPulseHaptics` (one soft tap). This screen only renders and wires them together, using
 * the same frosted controls, tagline type and mode/theme tokens as Home. Connection is scoped to
 * focus + foreground: leaving the screen or backgrounding the app closes the socket, and coming
 * back joins fresh.
 */
export default function GlobalRoomPage() {
  const { tokens } = useTheme();
  const { settings } = useAppSettings();
  const isFocused = useIsFocused();
  const palette = globalRoomPalette(tokens.mode, tokens.accent);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);

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

  const onMapAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea((prev) =>
      prev && prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  // Use window size until layout fires so the map is not blank on the first frame.
  const headerBlock = insets.top + 12 + HOME_NAV_ICON_BUTTON_SIZE + HOME_TAGLINE_FONT_SIZE * 2;
  const areaWidth = area?.width ?? screenWidth;
  const areaHeight = area?.height ?? Math.max(0, screenHeight - headerBlock);
  const mapWidth = fitMapWidth(areaWidth, areaHeight - pulseStackHeight);

  const tagline = {
    fontSize: HOME_TAGLINE_FONT_SIZE,
    fontWeight: HOME_TAGLINE_FONT_WEIGHT,
    letterSpacing: HOME_TAGLINE_LETTER_SPACING,
    textTransform: "uppercase",
    color: palette.ink,
    opacity: HOME_TAGLINE_OPACITY,
  } as const;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        // Plain, opaque scene color — deliberately not the wallpaper (which the root layout draws
        // behind every screen) so the map sits on a calm, even surface.
        backgroundColor: tokens.sceneBackground,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: GLOBAL_ROOM_HEADER_HORIZONTAL_PADDING,
          paddingTop: 12,
        }}
      >
        <HomeNavIconButton
          testID="global-room-back"
          accessibilityLabel="Leave Global Room"
          Icon={BackIcon}
          onPress={leaveRoom}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            style={[tagline, { textAlign: "center" }]}
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
              <Text style={[tagline, { marginTop: 6, color: palette.link, opacity: 1 }]}>
                Try now
              </Text>
            </Pressable>
          ) : null}
        </View>
        {/* Balances the back button so the status stays centred. */}
        <View style={{ width: HOME_NAV_ICON_BUTTON_SIZE }} />
      </View>

      <View onLayout={onMapAreaLayout} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <GlobalRoomMap
            width={mapWidth}
            selfId={selfId}
            dots={dots}
            ghosts={ghosts}
            pulses={pulses}
            palette={palette}
          />
        </View>
        <View style={{ alignItems: "center", paddingTop: GLOBAL_ROOM_CONTROL_GAP, paddingBottom: 8 }}>
          <GlobalRoomPulseButton
            onPress={sendPulse}
            disconnected={!isConnected}
            cooling={isCoolingDown}
            palette={palette}
          />
        </View>
      </View>

    </SafeAreaView>
  );
}

/** Height reserved for the pulse stack; the map flexes in the space above it. */
const pulseStackHeight =
  GLOBAL_ROOM_CONTROL_GAP +
  GLOBAL_ROOM_PULSE_SIZE +
  GLOBAL_ROOM_LABEL_GAP +
  HOME_TAGLINE_FONT_SIZE * 1.4 +
  8;
