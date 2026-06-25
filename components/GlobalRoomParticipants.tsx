import { BreathRoomCatalogEntry } from "@/hooks/useGlobalBreathingRoom";
import React from "react";
import { Text, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";

const HEADER_WHITE_TEXT = {
  color: "#FFFFFF",
  textAlign: "center" as const,
  textShadowColor: "rgba(0,0,0,0.45)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
};

type Props = {
  roomCatalog: BreathRoomCatalogEntry | null;
  participantCount: number;
  insets: EdgeInsets;
};

export default function GlobalRoomParticipants({
  roomCatalog,
  participantCount,
  insets,
}: Props) {
  return (
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
  );
}
