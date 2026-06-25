import GlobalRoomParticipants from "@/components/GlobalRoomParticipants";
import { BreathRoomCatalogEntry } from "@/hooks/useGlobalBreathingRoom";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";
import { EdgeInsets } from "react-native-safe-area-context";

type Props = {
  roomCatalog: BreathRoomCatalogEntry | null;
  participantCount: number;
  insets: EdgeInsets;
  isUIVisible: boolean;
  uiAnimatedStyle: AnimatedStyle<ViewStyle>;
  wallpaperFg: string;
  onLeave: () => void;
  onSettingsPress: () => void;
};

export default function GlobalRoomHeader({
  roomCatalog,
  participantCount,
  insets,
  isUIVisible,
  uiAnimatedStyle,
  wallpaperFg,
  onLeave,
  onSettingsPress,
}: Props) {
  return (
    <>
      <GlobalRoomParticipants
        roomCatalog={roomCatalog}
        participantCount={participantCount}
        insets={insets}
      />

      {/* Navigation bar — back + settings buttons */}
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
        <Pressable onPress={onLeave} style={{ width: 44 }}>
          <Text style={{ color: wallpaperFg, fontSize: 28 }}>←</Text>
        </Pressable>
        <Pressable
          onPress={onSettingsPress}
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
    </>
  );
}
