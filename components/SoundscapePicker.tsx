import React from "react";
import Svg, { Path } from "react-native-svg";
import { SOUNDSCAPE_COLORS } from "../constants/featureColors";
import { SoundscapeType, useApp } from "../contexts/themeContext";
import CircularOptionButton from "./CircularOptionButton";
import { useTheme } from "./Theme";

type SoundscapeOption = {
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

const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  { label: "Dream", value: "dream", color: SOUNDSCAPE_COLORS.dream },
  { label: "Fuzzy", value: "fuzzy", color: SOUNDSCAPE_COLORS.fuzzy },
  { label: "Keys", value: "keys", color: SOUNDSCAPE_COLORS.keys },
  { label: "OFF", value: "off", iconComponent: <OffIcon /> },
];

export default function SoundscapePicker() {
  const { settings, setSoundscape } = useApp();

  return (
    <>
      {SOUNDSCAPE_OPTIONS.map(({ label, value, color, iconComponent }) => (
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
