import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { SCENES_PICKER_TILE_SIZE } from "./ScenesHorizontalPicker";
import { useTheme } from "./Theme";

interface ScenesPreviewTileProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  /** Override square preview size (e.g. soundscape row fits four tiles without scrolling). */
  tileSize?: number;
}

/**
 * Shared chrome for Scenes carousels: fixed tile, checkmark, label (bottom sheet tokens only).
 */
export default function ScenesPreviewTile({
  label,
  selected,
  onPress,
  children,
  tileSize = SCENES_PICKER_TILE_SIZE,
}: ScenesPreviewTileProps) {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{ alignItems: "center", width: tileSize }}
    >
      <View
        style={{
          width: tileSize,
          height: tileSize,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {children}

        {selected && (
          <View
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: tokens.bottomSheetText,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="checkmark" size={18} color={tokens.bottomSheetBg} />
          </View>
        )}
      </View>

      <Text
        style={{
          color: tokens.bottomSheetText,
          fontSize: 15,
          fontWeight: "500",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
