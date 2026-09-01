import BreathingThemeGraphic from "@/components/BreathingThemeGraphic";
import {
  SettingsOptionCard,
  SettingsOptionPreviewCircle,
} from "@/components/SettingsOptionCard";
import { ThemeName } from "@/components/Theme";
import React from "react";
import { View, type ColorValue } from "react-native";

const PREVIEW_SCALE = 0.4;

type Props = {
  title: string;
  themeName: ThemeName;
  accentColor: string;
  backgroundColor: ColorValue;
  selected: boolean;
  onPress: () => void;
  width: number;
  testID?: string;
};

/** Compact theme picker tile — inherits Settings picker tokens. */
export default function ThemeCard({
  title,
  themeName,
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
        <View style={{ transform: [{ scale: PREVIEW_SCALE }] }}>
          <BreathingThemeGraphic themeName={themeName} />
        </View>
      </SettingsOptionPreviewCircle>
    </SettingsOptionCard>
  );
}
