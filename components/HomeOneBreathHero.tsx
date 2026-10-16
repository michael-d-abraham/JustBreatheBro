import HomeNavPressable from "@/components/HomeNavPressable";
import { useTheme } from "@/components/Theme";
import {
  HOME_HERO_TAGLINE_GAP,
  HOME_JOIN_CIRCLE_BLUR,
  HOME_JOIN_CIRCLE_FONT_SIZE,
  HOME_JOIN_CIRCLE_GAP,
  HOME_JOIN_CIRCLE_SHADOW_OPACITY,
  HOME_JOIN_CIRCLE_SIZE,
  HOME_ONE_BREATH_TAGLINE,
  HOME_START_STACK_ABOVE_CENTER,
  HOME_TAGLINE_FONT_SIZE,
  HOME_TAGLINE_FONT_WEIGHT,
  HOME_TAGLINE_LETTER_SPACING,
  HOME_TAGLINE_OPACITY,
  homeNavIconPrimary,
} from "@/components/homeNavTokens";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  onJoinPress: () => void;
};

export default function HomeOneBreathHero({ onJoinPress }: Props) {
  const { tokens } = useTheme();
  const foreground = homeNavIconPrimary(tokens.mode);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        stack: {
          flexDirection: "column",
          alignItems: "center",
          marginBottom: HOME_START_STACK_ABOVE_CENTER,
        },
        tagline: {
          fontSize: HOME_TAGLINE_FONT_SIZE,
          fontWeight: HOME_TAGLINE_FONT_WEIGHT,
          letterSpacing: HOME_TAGLINE_LETTER_SPACING,
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
      </View>
    </View>
  );
}
