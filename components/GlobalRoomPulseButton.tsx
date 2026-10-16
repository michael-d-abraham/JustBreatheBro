import HomeNavPressable from "@/components/HomeNavPressable";
import {
  GLOBAL_ROOM_LABEL_GAP,
  GLOBAL_ROOM_PULSE_ICON_SIZE,
  GLOBAL_ROOM_PULSE_SIZE,
  GLOBAL_ROOM_UNAVAILABLE_OPACITY,
  type GlobalRoomPalette,
} from "@/components/globalRoomTokens";
import {
  HOME_NAV_BLUR_INTENSITY,
  HOME_NAV_SHADOW_OPACITY,
  HOME_TAGLINE_FONT_SIZE,
  HOME_TAGLINE_FONT_WEIGHT,
  HOME_TAGLINE_LETTER_SPACING,
  HOME_TAGLINE_OPACITY,
} from "@/components/homeNavTokens";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  onPress: () => void;
  /** True when a pulse can't be sent because we're not connected. */
  disconnected: boolean;
  /** True during the post-pulse rest period. */
  cooling: boolean;
  palette: GlobalRoomPalette;
};

/**
 * The one control in the Global Room: send a gentle pulse. Built on the same frosted-glass
 * `HomeNavPressable` as Home's Join circle. It stays tappable while resting (the hook simply
 * ignores the tap) so VoiceOver users never land on a "dead" element; the visual and the
 * accessibility state both say it is resting.
 */
export default function GlobalRoomPulseButton({
  onPress,
  disconnected,
  cooling,
  palette,
}: Props) {
  const unavailable = disconnected || cooling;
  const label = disconnected
    ? "Waiting for connection"
    : cooling
      ? "Pulse sent"
      : "Send a gentle pulse";

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ opacity: unavailable ? GLOBAL_ROOM_UNAVAILABLE_OPACITY : 1 }}>
        <HomeNavPressable
          testID="global-room-pulse-button"
          accessibilityLabel="Send a gentle pulse"
          accessibilityHint="Everyone in the Global Room feels a soft tap and sees where it came from"
          accessibilityState={{ disabled: unavailable }}
          onPress={onPress}
          style={{ width: GLOBAL_ROOM_PULSE_SIZE, height: GLOBAL_ROOM_PULSE_SIZE }}
          borderRadius={GLOBAL_ROOM_PULSE_SIZE / 2}
          blurIntensity={HOME_NAV_BLUR_INTENSITY}
          shadowOpacity={HOME_NAV_SHADOW_OPACITY}
        >
          <Ionicons
            name="radio-outline"
            size={GLOBAL_ROOM_PULSE_ICON_SIZE}
            color={unavailable ? palette.ink : palette.self}
          />
        </HomeNavPressable>
      </View>
      <Text
        style={{
          marginTop: GLOBAL_ROOM_LABEL_GAP,
          fontSize: HOME_TAGLINE_FONT_SIZE,
          fontWeight: HOME_TAGLINE_FONT_WEIGHT,
          letterSpacing: HOME_TAGLINE_LETTER_SPACING,
          textTransform: "uppercase",
          textAlign: "center",
          color: palette.ink,
          opacity: HOME_TAGLINE_OPACITY,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
