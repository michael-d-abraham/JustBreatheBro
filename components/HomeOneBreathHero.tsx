import HomeBreathRoomDropdown from "@/components/HomeBreathRoomDropdown";
import HomeTimerDropdown from "@/components/HomeTimerDropdown";
import HomeNavPressable from "@/components/HomeNavPressable";
import { useTheme } from "@/components/Theme";
import type { CanonicalBreathRoomId } from "@/hooks/useGlobalBreathingRoom";
import {
  HOME_HERO_PICKER_GAP,
  HOME_HERO_TAGLINE_GAP,
  HOME_JOIN_CIRCLE_BLUR,
  HOME_JOIN_CIRCLE_FONT_SIZE,
  HOME_JOIN_CIRCLE_GAP,
  HOME_JOIN_CIRCLE_SHADOW_OPACITY,
  HOME_JOIN_CIRCLE_SIZE,
  HOME_ONE_BREATH_TAGLINE,
  HOME_START_STACK_ABOVE_CENTER,
  HOME_TAGLINE_OPACITY,
  homeNavIconPrimary,
} from "@/components/homeNavTokens";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type OpenDropdown = "room" | "timer" | null;

type Props = {
  onJoinPress: () => void;
  roomId: CanonicalBreathRoomId;
  onRoomSelect: (roomId: CanonicalBreathRoomId) => void;
  durationMinutes: number;
  onTimerSelect: (minutes: number) => void;
};

export default function HomeOneBreathHero({
  onJoinPress,
  roomId,
  onRoomSelect,
  durationMinutes,
  onTimerSelect,
}: Props) {
  const { tokens } = useTheme();
  const foreground = homeNavIconPrimary(tokens.mode);
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          flexDirection: "column",
          alignItems: "center",
          marginBottom: HOME_START_STACK_ABOVE_CENTER,
        },
        tagline: {
          fontSize: 11,
          fontWeight: "500",
          letterSpacing: 2.4,
          textTransform: "uppercase",
          color: foreground,
          opacity: HOME_TAGLINE_OPACITY,
          textAlign: "center",
          marginBottom: HOME_HERO_TAGLINE_GAP,
        },
        primaryGroup: {
          flexDirection: "column",
          alignItems: "center",
          gap: HOME_JOIN_CIRCLE_GAP,
        },
        pickerRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: HOME_HERO_PICKER_GAP,
        },
        joinButton: {
          width: HOME_JOIN_CIRCLE_SIZE,
          height: HOME_JOIN_CIRCLE_SIZE,
        },
        joinButtonText: {
          textAlign: "center",
          fontSize: HOME_JOIN_CIRCLE_FONT_SIZE,
          fontWeight: "700",
          letterSpacing: -0.3,
          color: foreground,
        },
      }),
    [foreground],
  );

  const setRoomOpen = (open: boolean) => {
    setOpenDropdown(open ? "room" : null);
  };

  const setTimerOpen = (open: boolean) => {
    setOpenDropdown(open ? "timer" : null);
  };

  return (
    <View style={styles.stack}>
      <Text style={styles.tagline}>{HOME_ONE_BREATH_TAGLINE}</Text>

      <View style={styles.primaryGroup}>
        <HomeNavPressable
          testID="home.join-button"
          accessibilityLabel="Join"
          onPress={onJoinPress}
          style={styles.joinButton}
          borderRadius={HOME_JOIN_CIRCLE_SIZE / 2}
          blurIntensity={HOME_JOIN_CIRCLE_BLUR}
          shadowOpacity={HOME_JOIN_CIRCLE_SHADOW_OPACITY}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </HomeNavPressable>

        <View style={styles.pickerRow}>
          <HomeBreathRoomDropdown
            roomId={roomId}
            open={openDropdown === "room"}
            onOpenChange={setRoomOpen}
            onSelect={onRoomSelect}
          />
          <HomeTimerDropdown
            durationMinutes={durationMinutes}
            open={openDropdown === "timer"}
            onOpenChange={setTimerOpen}
            onSelect={onTimerSelect}
          />
        </View>
      </View>
    </View>
  );
}
