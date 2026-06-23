import React from "react";
import { useAppSettings } from "@/contexts/appSettingsContext";
import BreathingThemeGraphic from "./BreathingThemeGraphic";
import ScenesHorizontalPicker from "./ScenesHorizontalPicker";
import ScenesPreviewTile from "./ScenesPreviewTile";
import { THEMES, ThemeName } from "./Theme";

export default function BottomSheetThemePicker() {
  const { settings, setAnimationTheme } = useAppSettings();

  return (
    <ScenesHorizontalPicker>
      {Object.entries(THEMES).map(([key, t]) => (
        <ScenesPreviewTile
          key={key}
          label={t.name}
          selected={settings.animationTheme === key}
          onPress={() => setAnimationTheme(key as ThemeName)}
        >
          <BreathingThemeGraphic themeName={key as ThemeName} />
        </ScenesPreviewTile>
      ))}
    </ScenesHorizontalPicker>
  );
}
