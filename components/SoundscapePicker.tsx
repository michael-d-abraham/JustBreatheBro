import { settingsPickerSurfaceColor } from "@/components/settingsScreenTokens";
import SoundscapeCard from "@/components/SoundscapeCard";
import { SettingsOptionCardRow, usePickerCardWidth } from "@/components/SettingsOptionCard";
import { SOUNDSCAPE_COLORS, SOUNDSCAPE_PALETTES } from "@/constants/featureColors";
import { SoundscapeType, useAppSettings } from "@/contexts/appSettingsContext";
import CircularOptionButton from "./CircularOptionButton";
import { useTheme } from "./Theme";
import React from "react";
import Svg, { Path } from "react-native-svg";

type SoundscapePickerVariant = "page" | "bottomSheet";

interface SoundscapePickerProps {
  variant?: SoundscapePickerVariant;
}

const SHEET_SOUNDSCAPE_ORDER: SoundscapeType[] = ["off", "dream", "fuzzy", "keys"];

export default function SoundscapePicker({
  variant = "page",
}: SoundscapePickerProps) {
  return variant === "bottomSheet" ? (
    <SheetSoundscapePicker />
  ) : (
    <PageSoundscapePicker />
  );
}

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

type PageSoundscapeOption = {
  label: string;
  value: SoundscapeType;
  color?: string;
  iconComponent?: React.ReactNode;
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

function soundscapeAccent(value: SoundscapeType): string {
  if (value === "off") {
    return "#8E8E93";
  }
  return SOUNDSCAPE_PALETTES[value].mainStroke;
}

function SheetSoundscapePicker() {
  const { settings, setSoundscape } = useAppSettings();
  const { tokens, mode } = useTheme();
  const cardSurface = settingsPickerSurfaceColor(
    mode,
    tokens.systemSecondaryGroupedBg,
  );
  const cardWidth = usePickerCardWidth();

  return (
    <SettingsOptionCardRow>
      {SHEET_SOUNDSCAPE_ORDER.map((value) => {
        const label = value === "off" ? "OFF" : value.charAt(0).toUpperCase() + value.slice(1);
        const accentHex =
          value === "off" ? "#8E8E93" : soundscapeAccent(value);

        return (
          <SoundscapeCard
            key={value}
            title={label}
            soundscape={value}
            selected={settings.soundscape === value}
            onPress={() => setSoundscape(value)}
            accentColor={accentHex}
            backgroundColor={cardSurface}
            width={cardWidth}
            testID={`scenes.soundscape-${value}`}
          />
        );
      })}
    </SettingsOptionCardRow>
  );
}
