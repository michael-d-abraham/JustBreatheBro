import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, useWindowDimensions, View } from "react-native";
import { SoundscapeType, useApp } from "../contexts/themeContext";
import { SCENES_PICKER_TILE_SIZE } from "./ScenesHorizontalPicker";
import ScenesPreviewTile from "./ScenesPreviewTile";
import SoundscapePreviewGraphic from "./SoundscapePreviewGraphic";

type SoundscapeOption = {
  label: string;
  value: SoundscapeType;
};

const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  { label: "OFF", value: "off" },
  { label: "Dream", value: "dream" },
  { label: "Fuzzy", value: "fuzzy" },
  { label: "Keys", value: "keys" },
];

const SOUNDSCAPE_ROW_GAP = 6;

/** Graphic scales like the default 100px SVG inside an 110px tile. */
const GRAPHIC_RATIO = 100 / 110;

export default function BottomSheetSoundscapePicker() {
  const { settings, setSoundscape } = useApp();
  const { width: windowWidth } = useWindowDimensions();
  const [rowWidth, setRowWidth] = useState(0);

  const onRowLayout = (e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  };

  const { tileSize, svgSize } = useMemo(() => {
    const widthBasis =
      rowWidth > 0
        ? rowWidth
        : Math.max(0, windowWidth - 48);
    const nextTile = Math.min(
      SCENES_PICKER_TILE_SIZE,
      (widthBasis - 3 * SOUNDSCAPE_ROW_GAP) / 4
    );
    return {
      tileSize: nextTile,
      svgSize: nextTile * GRAPHIC_RATIO,
    };
  }, [rowWidth, windowWidth]);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignSelf: "stretch",
        flexGrow: 1,
        minWidth: 0,
        gap: SOUNDSCAPE_ROW_GAP,
      }}
      onLayout={onRowLayout}
    >
      {SOUNDSCAPE_OPTIONS.map(({ label, value }) => (
        <ScenesPreviewTile
          key={value}
          label={label}
          selected={settings.soundscape === value}
          onPress={() => setSoundscape(value)}
          tileSize={tileSize}
        >
          <SoundscapePreviewGraphic soundscape={value} svgSize={svgSize} />
        </ScenesPreviewTile>
      ))}
    </View>
  );
}
