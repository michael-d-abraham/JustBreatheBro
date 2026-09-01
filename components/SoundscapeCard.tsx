import {
  SettingsOptionCard,
  SettingsOptionPreviewCircle,
} from "@/components/SettingsOptionCard";
import SoundscapePreviewGraphic from "@/components/SoundscapePreviewGraphic";
import { SoundscapeType } from "@/contexts/appSettingsContext";
import React from "react";
import { type ColorValue } from "react-native";

const PREVIEW_SIZE = 32;

type Props = {
  title: string;
  soundscape: SoundscapeType;
  accentColor: string;
  backgroundColor: ColorValue;
  selected: boolean;
  onPress: () => void;
  width: number;
  testID?: string;
};

/** Compact soundscape picker tile — same family as ThemeCard. */
export default function SoundscapeCard({
  title,
  soundscape,
  accentColor,
  backgroundColor,
  selected,
  onPress,
  width,
  testID,
}: Props) {
  return (
    <SettingsOptionCard
      title={title}
      selected={selected}
      onPress={onPress}
      accentColor={accentColor}
      backgroundColor={backgroundColor}
      width={width}
      testID={testID}
    >
      <SettingsOptionPreviewCircle accentColor={accentColor}>
        <SoundscapePreviewGraphic
          soundscape={soundscape}
          svgSize={PREVIEW_SIZE}
        />
      </SettingsOptionPreviewCircle>
    </SettingsOptionCard>
  );
}
