import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { SOUNDSCAPE_COLORS } from "@/constants/featureColors";
import { SoundscapeType, useAppSettings } from "@/contexts/appSettingsContext";
import CircularOptionButton from "./CircularOptionButton";
import { SCENES_PICKER_TILE_SIZE } from "./ScenesHorizontalPicker";
import ScenesPreviewTile from "./ScenesPreviewTile";
import SoundscapePreviewGraphic from "./SoundscapePreviewGraphic";
import { useTheme } from "./Theme";

type SoundscapePickerVariant = "page" | "bottomSheet";

interface SoundscapePickerProps {
  variant?: SoundscapePickerVariant;
}

export default function SoundscapePicker({
  variant = "page",
}: SoundscapePickerProps) {
  return variant === "bottomSheet" ? (
    <SheetSoundscapePicker />
  ) : (
    <PageSoundscapePicker />
  );
}

/* -------------------------------------------------------------------------- */
/* Page variant: colored circular option buttons                             */
/* -------------------------------------------------------------------------- */

type PageSoundscapeOption = {
  label: string;
  value: SoundscapeType;
  color?: string;
  iconComponent?: React.ReactNode;
};

// Off icon component (horizontal line)
const OffIcon = () => {
  const { tokens } = useTheme();
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Path
        d="M 4 14 L 24 14"
        stroke={tokens.textOnAccent}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const PAGE_SOUNDSCAPE_OPTIONS: PageSoundscapeOption[] = [
  { label: "Dream", value: "dream", color: SOUNDSCAPE_COLORS.dream },
  { label: "Fuzzy", value: "fuzzy", color: SOUNDSCAPE_COLORS.fuzzy },
  { label: "Keys", value: "keys", color: SOUNDSCAPE_COLORS.keys },
  { label: "OFF", value: "off", iconComponent: <OffIcon /> },
];

function PageSoundscapePicker() {
  const { settings, setSoundscape } = useAppSettings();

  return (
    <>
      {PAGE_SOUNDSCAPE_OPTIONS.map(({ label, value, color, iconComponent }) => (
        <CircularOptionButton
          key={value}
          label={label}
          iconComponent={iconComponent}
          color={color}
          isSelected={settings.soundscape === value}
          onPress={() => setSoundscape(value)}
        />
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottom sheet variant: responsive preview-graphic tiles                     */
/* -------------------------------------------------------------------------- */

type SheetSoundscapeOption = {
  label: string;
  value: SoundscapeType;
};

const SHEET_SOUNDSCAPE_OPTIONS: SheetSoundscapeOption[] = [
  { label: "OFF", value: "off" },
  { label: "Dream", value: "dream" },
  { label: "Fuzzy", value: "fuzzy" },
  { label: "Keys", value: "keys" },
];

const SOUNDSCAPE_ROW_GAP = 6;

/** Graphic scales like the default 100px SVG inside an 110px tile. */
const GRAPHIC_RATIO = 100 / 110;

function SheetSoundscapePicker() {
  const { settings, setSoundscape } = useAppSettings();
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
      {SHEET_SOUNDSCAPE_OPTIONS.map(({ label, value }) => (
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
