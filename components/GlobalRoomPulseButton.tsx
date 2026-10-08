import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  onPress: () => void;
  /** True when a pulse can't be sent right now because we're not connected. */
  disconnected: boolean;
  /** True during the post-pulse rest period. */
  cooling: boolean;
  color: string;
  accentColor: string;
};

/**
 * The one control in the Global Room: send a gentle pulse. Stays tappable while resting (a tap is
 * simply ignored by the hook) so VoiceOver users never land on a "dead" element; the visual and
 * the accessibility state both say it is resting.
 */
export default function GlobalRoomPulseButton({
  onPress,
  disconnected,
  cooling,
  color,
  accentColor,
}: Props) {
  const unavailable = disconnected || cooling;
  const label = disconnected
    ? "Waiting for connection"
    : cooling
      ? "Pulse sent"
      : "Send a gentle pulse";

  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Send a gentle pulse"
        accessibilityHint="Everyone in the Global Room feels a soft tap and sees where it came from"
        accessibilityState={{ disabled: unavailable }}
        testID="global-room-pulse-button"
        style={({ pressed }) => ({
          width: 88,
          height: 88,
          borderRadius: 44,
          borderWidth: 1.5,
          borderColor: unavailable ? color : accentColor,
          transform: [{ scale: pressed && !unavailable ? 0.94 : 1 }],
          alignItems: "center",
          justifyContent: "center",
          opacity: unavailable ? 0.4 : 1,
        })}
      >
        <Ionicons name="radio-outline" size={34} color={unavailable ? color : accentColor} />
      </Pressable>
      <Text
        style={{
          marginTop: 14,
          fontSize: 15,
          color,
          opacity: unavailable ? 0.55 : 0.85,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
