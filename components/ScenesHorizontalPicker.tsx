import React, { ReactNode } from "react";
import { ScrollView } from "react-native";

/** Horizontal tile width — shared by Animation Theme and Soundscape pickers on Scenes. */
export const SCENES_PICKER_TILE_SIZE = 110;
export const SCENES_PICKER_GAP = 16;
export const SCENES_PICKER_SNAP_INTERVAL =
  SCENES_PICKER_TILE_SIZE + SCENES_PICKER_GAP;

interface ScenesHorizontalPickerProps {
  children: ReactNode;
}

/**
 * Snapping row for Scenes-style option strips (theme, soundscape).
 * Matches prior BottomSheetThemePicker scroll behavior.
 */
export default function ScenesHorizontalPicker({
  children,
}: ScenesHorizontalPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={SCENES_PICKER_SNAP_INTERVAL}
      decelerationRate="fast"
      style={{ flexGrow: 1, alignSelf: "stretch" }}
      contentContainerStyle={{
        gap: SCENES_PICKER_GAP,
        paddingRight: 20,
      }}
    >
      {children}
    </ScrollView>
  );
}
